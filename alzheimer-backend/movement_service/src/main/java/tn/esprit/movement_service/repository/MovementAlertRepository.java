package tn.esprit.movement_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.movement_service.entity.AlertType;
import tn.esprit.movement_service.entity.MovementAlert;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovementAlertRepository extends JpaRepository<MovementAlert, Long> {

    List<MovementAlert> findTop200ByOrderByCreatedAtDesc();

    List<MovementAlert> findByAcknowledgedFalseOrderByCreatedAtDesc();

    List<MovementAlert> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    boolean existsByPatientIdAndAlertTypeAndAcknowledgedFalseAndCreatedAtAfter(
            Long patientId,
            AlertType alertType,
            LocalDateTime createdAt
    );
}
