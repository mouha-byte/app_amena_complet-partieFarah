package tn.esprit.users_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.users_service.entity.Patient;
import tn.esprit.users_service.entity.Role;
import tn.esprit.users_service.entity.User;
import tn.esprit.users_service.repository.PatientRepository;
import tn.esprit.users_service.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public Patient createPatient(Patient patient) {
        Patient normalized = normalizeAndValidate(patient, null);

        Optional<Patient> existing = patientRepository.findByUserId(normalized.getUser().getId());
        if (existing.isPresent()) {
            Patient current = existing.get();
            applyMutableFields(current, normalized);
            return patientRepository.save(current);
        }

        return patientRepository.save(normalized);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId);
    }

    public List<Patient> getPatientsByCaregiverId(Long caregiverId) {
        return patientRepository.findByCaregiverId(caregiverId);
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        return patientRepository.findById(id).map(patient -> {
            Patient normalized = normalizeAndValidate(patientDetails, patient);
            applyMutableFields(patient, normalized);
            return patientRepository.save(patient);
        }).orElseThrow(() -> new RuntimeException("Patient not found with id " + id));
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }

    private Patient normalizeAndValidate(Patient payload, Patient fallback) {
        if (payload == null) {
            throw new IllegalArgumentException("Patient payload is required.");
        }

        Long userId = payload.getUser() != null ? payload.getUser().getId() : null;
        if (userId == null && fallback != null && fallback.getUser() != null) {
            userId = fallback.getUser().getId();
        }
        if (userId == null) {
            throw new IllegalArgumentException("Patient user is required.");
        }

        Long caregiverId = payload.getCaregiver() != null ? payload.getCaregiver().getId() : null;
        if (caregiverId == null && fallback != null && fallback.getCaregiver() != null) {
            caregiverId = fallback.getCaregiver().getId();
        }
        if (caregiverId == null) {
            throw new IllegalArgumentException("Caregiver link is required for a patient profile.");
        }

        final Long resolvedUserId = userId;
        final Long resolvedCaregiverId = caregiverId;

        User patientUser = userRepository.findById(resolvedUserId)
            .orElseThrow(() -> new IllegalArgumentException("Patient user not found with id " + resolvedUserId));
        if (patientUser.getRole() != Role.PATIENT) {
            throw new IllegalArgumentException("Linked user must have PATIENT role.");
        }

        User caregiverUser = userRepository.findById(resolvedCaregiverId)
            .orElseThrow(() -> new IllegalArgumentException("Caregiver user not found with id " + resolvedCaregiverId));
        if (caregiverUser.getRole() != Role.CAREGIVER) {
            throw new IllegalArgumentException("Linked caregiver must have CAREGIVER role.");
        }

        payload.setUser(patientUser);
        payload.setCaregiver(caregiverUser);

        if (payload.getAddress() == null) {
            payload.setAddress("");
        }
        if (payload.getMedicalHistory() == null) {
            payload.setMedicalHistory("");
        }
        if (payload.getEmergencyContact() == null || payload.getEmergencyContact().isBlank()) {
            payload.setEmergencyContact(caregiverUser.getEmail());
        }

        return payload;
    }

    private void applyMutableFields(Patient target, Patient source) {
        target.setDateOfBirth(source.getDateOfBirth());
        target.setAddress(source.getAddress());
        target.setEmergencyContact(source.getEmergencyContact());
        target.setMedicalHistory(source.getMedicalHistory());
        target.setUser(source.getUser());
        target.setCaregiver(source.getCaregiver());
    }
}
