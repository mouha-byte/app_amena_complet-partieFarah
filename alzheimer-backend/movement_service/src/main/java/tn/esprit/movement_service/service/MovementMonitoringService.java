package tn.esprit.movement_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.movement_service.dto.LocationReportRequest;
import tn.esprit.movement_service.dto.SafeZoneDto;
import tn.esprit.movement_service.entity.AlertSeverity;
import tn.esprit.movement_service.entity.AlertType;
import tn.esprit.movement_service.entity.LocationPing;
import tn.esprit.movement_service.entity.MovementAlert;
import tn.esprit.movement_service.repository.LocationPingRepository;
import tn.esprit.movement_service.repository.MovementAlertRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovementMonitoringService {

    private final LocalizationClient localizationClient;
    private final LocationPingRepository locationPingRepository;
    private final MovementAlertRepository movementAlertRepository;
    private final MovementAlertNotifier movementAlertNotifier;

    @Value("${movement.alerts.abrupt-distance-meters:300}")
    private double abruptDistanceThresholdMeters;

    @Value("${movement.alerts.immobile-seconds:20}")
    private long immobileSeconds;

    @Value("${movement.alerts.immobile-radius-meters:25}")
    private double immobileRadiusMeters;

    @Value("${movement.alerts.no-gps-minutes:30}")
    private long noGpsMinutes;

    @Value("${movement.alerts.cooldown-minutes:20}")
    private long duplicateCooldownMinutes;

    @Transactional
    public LocationPing reportLocation(LocationReportRequest request) {
        validateRequest(request);

        LocalDateTime recordedAt = request.getRecordedAt() != null ? request.getRecordedAt() : LocalDateTime.now();
        Optional<LocationPing> previous = locationPingRepository.findTopByPatientIdOrderByRecordedAtDesc(request.getPatientId());
        String source = request.getSource();

        LocationPing ping = LocationPing.builder()
                .patientId(request.getPatientId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .accuracyMeters(request.getAccuracyMeters())
            .source(source)
                .recordedAt(recordedAt)
                .build();

        previous.ifPresent(prev -> {
            double speed = calculateSpeedKmh(prev, ping);
            ping.setSpeedKmh(speed >= 0 ? speed : null);
        });

        LocationPing saved = locationPingRepository.save(ping);

        if (isSimulationSource(source)) {
            createSimulationAlert(saved, previous.orElse(null));
        }

        evaluateOutOfSafeZone(saved);
        evaluateAbruptMovement(previous.orElse(null), saved);
        evaluateImmobility(saved.getPatientId());

        return saved;
    }

    public Optional<LocationPing> getLatestLocation(Long patientId) {
        return locationPingRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId);
    }

    public List<LocationPing> getPatientHistory(Long patientId, int minutes) {
        int boundedMinutes = Math.max(5, Math.min(minutes, 10080));
        LocalDateTime start = LocalDateTime.now().minusMinutes(boundedMinutes);
        List<LocationPing> data = locationPingRepository.findByPatientIdAndRecordedAtAfterOrderByRecordedAtAsc(patientId, start);
        return data.stream().sorted(Comparator.comparing(LocationPing::getRecordedAt)).toList();
    }

    public List<MovementAlert> getRecentAlerts(boolean onlyUnacknowledged) {
        if (onlyUnacknowledged) {
            return movementAlertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc();
        }
        return movementAlertRepository.findTop200ByOrderByCreatedAtDesc();
    }

    public List<MovementAlert> getPatientAlerts(Long patientId) {
        return movementAlertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Transactional
    public MovementAlert acknowledgeAlert(Long alertId) {
        MovementAlert alert = movementAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        return movementAlertRepository.save(alert);
    }

    @Scheduled(fixedDelayString = "${movement.alerts.no-gps-check-ms:600000}")
    public void checkGpsSilence() {
        LocalDateTime now = LocalDateTime.now();
        List<Long> patientsWithZones = localizationClient.getPatientIdsWithSafeZones();
        if (patientsWithZones.isEmpty()) {
            patientsWithZones = locationPingRepository.findDistinctPatientIds();
        }

        for (Long patientId : patientsWithZones) {
            Optional<LocationPing> latest = locationPingRepository.findTopByPatientIdOrderByRecordedAtDesc(patientId);
            if (latest.isEmpty()) {
                createAlertIfNeeded(
                        patientId,
                        AlertType.GPS_NO_DATA,
                        AlertSeverity.CRITICAL,
                        "Aucune donnee GPS recue pour ce patient."
                );
                continue;
            }

            long minutesSinceLastGps = Duration.between(latest.get().getRecordedAt(), now).toMinutes();
            if (minutesSinceLastGps >= noGpsMinutes) {
                createAlertIfNeeded(
                        patientId,
                        AlertType.GPS_NO_DATA,
                        AlertSeverity.CRITICAL,
                        "Le GPS n'envoie plus de donnees depuis " + minutesSinceLastGps + " minutes."
                );
            }
        }
    }

    @Scheduled(fixedDelayString = "${movement.alerts.immobility-check-ms:10000}")
    public void checkImmobilePatients() {
        List<Long> patientIds = locationPingRepository.findDistinctPatientIds();
        for (Long patientId : patientIds) {
            evaluateImmobility(patientId);
        }
    }

    private void validateRequest(LocationReportRequest request) {
        if (request.getPatientId() == null) {
            throw new IllegalArgumentException("patientId is required");
        }
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new IllegalArgumentException("latitude and longitude are required");
        }
        if (request.getLatitude() < -90 || request.getLatitude() > 90 || request.getLongitude() < -180 || request.getLongitude() > 180) {
            throw new IllegalArgumentException("Invalid latitude/longitude values");
        }
    }

    private void evaluateOutOfSafeZone(LocationPing ping) {
        List<SafeZoneDto> zones = localizationClient.getSafeZonesByPatientId(ping.getPatientId());
        if (zones.isEmpty()) {
            return;
        }

        boolean insideAllowedZone = zones.stream().anyMatch(zone -> {
            double d = distanceMeters(ping.getLatitude(), ping.getLongitude(), zone.getCenterLatitude(), zone.getCenterLongitude());
            return d <= zone.getRadius();
        });

        if (!insideAllowedZone) {
            createAlertIfNeeded(
                    ping.getPatientId(),
                    AlertType.OUT_OF_SAFE_ZONE,
                    AlertSeverity.CRITICAL,
                    "Le patient est sorti des zones autorisees."
            );
        }
    }

    private void evaluateAbruptMovement(LocationPing previous, LocationPing current) {
        if (previous == null) {
            return;
        }

        double displacementMeters = distanceMeters(
                previous.getLatitude(),
                previous.getLongitude(),
                current.getLatitude(),
                current.getLongitude()
        );

        if (displacementMeters >= abruptDistanceThresholdMeters) {
            createAlertIfNeeded(
                    current.getPatientId(),
                    AlertType.RAPID_OR_UNUSUAL_MOVEMENT,
                    AlertSeverity.WARNING,
                    "Changement brusque detecte (" + String.format("%.0f", displacementMeters) + " m entre 2 positions)."
            );
        }
    }

    private void evaluateImmobility(Long patientId) {
        LocalDateTime start = LocalDateTime.now().minusSeconds(immobileSeconds);
        List<LocationPing> pings = locationPingRepository.findByPatientIdAndRecordedAtAfterOrderByRecordedAtAsc(patientId, start);

        if (pings.size() < 2) {
            return;
        }

        LocationPing first = pings.get(0);
        LocationPing last = pings.get(pings.size() - 1);
        long immobilizedSeconds = Duration.between(first.getRecordedAt(), last.getRecordedAt()).getSeconds();
        if (immobilizedSeconds < immobileSeconds) {
            return;
        }

        double maxDistance = pings.stream()
                .mapToDouble(p -> distanceMeters(first.getLatitude(), first.getLongitude(), p.getLatitude(), p.getLongitude()))
                .max()
                .orElse(Double.MAX_VALUE);

        if (maxDistance <= immobileRadiusMeters) {
            createAlertIfNeeded(
                    patientId,
                    AlertType.IMMOBILE_TOO_LONG,
                    AlertSeverity.WARNING,
                    "Patient immobile depuis plus de " + immobileSeconds + " secondes."
            );
        }
    }

    private void createAlertIfNeeded(Long patientId, AlertType type, AlertSeverity severity, String message) {
        createAlertIfNeeded(patientId, type, severity, message, false);
    }

    private void createAlertIfNeeded(Long patientId, AlertType type, AlertSeverity severity, String message, boolean forceCreate) {
        if (!forceCreate) {
            LocalDateTime cooldownStart = LocalDateTime.now().minusMinutes(duplicateCooldownMinutes);
            boolean existsRecentOpenAlert = movementAlertRepository
                    .existsByPatientIdAndAlertTypeAndAcknowledgedFalseAndCreatedAtAfter(patientId, type, cooldownStart);

            if (existsRecentOpenAlert) {
                return;
            }
        }

        MovementAlert alert = MovementAlert.builder()
                .patientId(patientId)
                .alertType(type)
                .severity(severity)
                .message(message)
                .acknowledged(false)
                .emailSent(false)
                .createdAt(LocalDateTime.now())
                .build();

        MovementAlert saved = movementAlertRepository.save(alert);
        boolean emailSent = movementAlertNotifier.notifyByEmail(saved, getLatestLocation(patientId).orElse(null));
        if (emailSent) {
            saved.setEmailSent(true);
            movementAlertRepository.save(saved);
        }
    }

    private boolean isSimulationSource(String source) {
        return source != null && source.startsWith("SIMULATION_");
    }

    private void createSimulationAlert(LocationPing current, LocationPing previous) {
        String source = current.getSource() != null ? current.getSource() : "SIMULATION";

        AlertType type;
        AlertSeverity severity;
        String message;

        if (source.contains("OUT_OF_ZONE")) {
            type = AlertType.OUT_OF_SAFE_ZONE;
            severity = AlertSeverity.CRITICAL;
            message = "Alerte test: sortie de zone simulee.";
        } else if (source.contains("ABRUPT")) {
            type = AlertType.RAPID_OR_UNUSUAL_MOVEMENT;
            severity = AlertSeverity.WARNING;

            if (previous != null) {
                double displacementMeters = distanceMeters(
                        previous.getLatitude(),
                        previous.getLongitude(),
                        current.getLatitude(),
                        current.getLongitude()
                );
                message = "Alerte test: changement brusque simule (" + String.format("%.0f", displacementMeters) + " m).";
            } else {
                message = "Alerte test: changement brusque simule.";
            }
        } else {
            type = AlertType.RAPID_OR_UNUSUAL_MOVEMENT;
            severity = AlertSeverity.WARNING;
            message = "Alerte test de mouvement simule.";
        }

        // Force a new alert for every simulation click so it appears in active alerts and triggers email each time.
        createAlertIfNeeded(current.getPatientId(), type, severity, message, true);
    }

    private double calculateSpeedKmh(LocationPing prev, LocationPing current) {
        long seconds = Duration.between(prev.getRecordedAt(), current.getRecordedAt()).getSeconds();
        if (seconds <= 0) {
            return -1;
        }
        double meters = distanceMeters(prev.getLatitude(), prev.getLongitude(), current.getLatitude(), current.getLongitude());
        return (meters / seconds) * 3.6;
    }

    private double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final double earthRadius = 6371000.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}
