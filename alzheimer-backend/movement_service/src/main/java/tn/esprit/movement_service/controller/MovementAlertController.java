package tn.esprit.movement_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.movement_service.entity.MovementAlert;
import tn.esprit.movement_service.service.MovementMonitoringService;

import java.util.List;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
public class MovementAlertController {

    private final MovementMonitoringService movementMonitoringService;

    @GetMapping
    public ResponseEntity<List<MovementAlert>> getAlerts(
            @RequestParam(defaultValue = "false") boolean unacknowledgedOnly
    ) {
        return ResponseEntity.ok(movementMonitoringService.getRecentAlerts(unacknowledgedOnly));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MovementAlert>> getPatientAlerts(@PathVariable Long patientId) {
        return ResponseEntity.ok(movementMonitoringService.getPatientAlerts(patientId));
    }

    @PutMapping("/{alertId}/ack")
    public ResponseEntity<MovementAlert> acknowledge(@PathVariable Long alertId) {
        return ResponseEntity.ok(movementMonitoringService.acknowledgeAlert(alertId));
    }

    @PostMapping("/checks/no-gps")
    public ResponseEntity<String> triggerNoGpsCheck() {
        movementMonitoringService.checkGpsSilence();
        return ResponseEntity.ok("No-GPS check executed");
    }
}
