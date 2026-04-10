package tn.esprit.movement_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import tn.esprit.movement_service.entity.LocationPing;
import tn.esprit.movement_service.entity.MovementAlert;

import java.util.ArrayList;
import java.util.List;

@Service
public class MovementAlertNotifier {

    private static final Logger log = LoggerFactory.getLogger(MovementAlertNotifier.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private UsersClient usersClient;

    @Value("${movement.alert.email.to:admin@mindcare.com}")
    private String adminEmail;

    @Value("${movement.alert.email.from:noreply@mindcare.com}")
    private String fromEmail;

    public boolean notifyByEmail(MovementAlert alert, LocationPing latestPing) {
        if (mailSender == null) {
            log.warn("JavaMailSender not configured. Email alert skipped for patient {}.", alert.getPatientId());
            return false;
        }

        List<String> recipients = resolveRecipients(alert.getPatientId());
        if (recipients.isEmpty()) {
            log.warn("No alert email recipients found for patient {}.", alert.getPatientId());
            return false;
        }

        String subject = "[Mind Care] Alerte mouvement - Patient " + alert.getPatientId();
        String body = buildBody(alert, latestPing);
        boolean sentAtLeastOnce = false;

        for (String recipient : recipients) {
            try {
                sendSimpleEmail(recipient, subject, body);
                sentAtLeastOnce = true;
            } catch (Exception ex) {
                log.error("Failed to send movement alert email to {}: {}", recipient, ex.getMessage());
            }
        }

        return sentAtLeastOnce;
    }

    private List<String> resolveRecipients(Long patientId) {
        List<String> recipients = new ArrayList<>();

        recipients.addAll(usersClient.getDoctorEmails());
        recipients.addAll(usersClient.getCaregiverEmailsForPatient(patientId));

        // Keep admin fallback for operational safety.
        if (adminEmail != null && !adminEmail.isBlank()) {
            recipients.add(adminEmail.trim());
        }

        return recipients.stream()
                .map(String::trim)
                .filter(v -> !v.isBlank())
                .distinct()
                .toList();
    }

    private void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    private String buildBody(MovementAlert alert, LocationPing latestPing) {
        StringBuilder sb = new StringBuilder();
        sb.append("Alerte mouvement detectee\n\n");
        sb.append("Patient ID: ").append(alert.getPatientId()).append("\n");
        sb.append("Type: ").append(alert.getAlertType()).append("\n");
        sb.append("Severite: ").append(alert.getSeverity()).append("\n");
        sb.append("Message: ").append(alert.getMessage()).append("\n");
        sb.append("Date: ").append(alert.getCreatedAt()).append("\n\n");

        if (latestPing != null) {
            sb.append("Derniere position\n");
            sb.append("Latitude: ").append(latestPing.getLatitude()).append("\n");
            sb.append("Longitude: ").append(latestPing.getLongitude()).append("\n");
            sb.append("Heure position: ").append(latestPing.getRecordedAt()).append("\n");
            if (latestPing.getSpeedKmh() != null) {
                sb.append("Vitesse (km/h): ").append(String.format("%.2f", latestPing.getSpeedKmh())).append("\n");
            }
        }

        sb.append("\nVeuillez verifier le patient dans le tableau de bord de supervision.");
        return sb.toString();
    }
}
