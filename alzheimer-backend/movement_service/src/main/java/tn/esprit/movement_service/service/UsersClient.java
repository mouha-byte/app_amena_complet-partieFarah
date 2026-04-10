package tn.esprit.movement_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UsersClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${users.service.base-url:http://localhost:8086}")
    private String usersBaseUrl;

    public List<String> getDoctorEmails() {
        List<UserLite> users = getAllUsers();
        return users.stream()
                .filter(u -> "DOCTOR".equalsIgnoreCase(u.getRole()))
                .map(UserLite::getEmail)
                .filter(this::isValidEmail)
                .map(String::trim)
                .distinct()
                .toList();
    }

    public List<String> getCaregiverEmailsForPatient(Long patientUserId) {
        Optional<PatientLite> patient = getPatientByUserId(patientUserId);
        if (patient.isPresent()) {
            String emergencyContact = patient.get().getEmergencyContact();
            if (isValidEmail(emergencyContact)) {
                return List.of(emergencyContact.trim());
            }
        }

        List<UserLite> users = getAllUsers();
        return users.stream()
                .filter(u -> "CAREGIVER".equalsIgnoreCase(u.getRole()))
                .map(UserLite::getEmail)
                .filter(this::isValidEmail)
                .map(String::trim)
                .distinct()
                .toList();
    }

    private List<UserLite> getAllUsers() {
        try {
            String url = usersBaseUrl + "/users";
            ResponseEntity<List<UserLite>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<UserLite>>() {}
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (RestClientException ex) {
            return Collections.emptyList();
        }
    }

    private Optional<PatientLite> getPatientByUserId(Long patientUserId) {
        try {
            String url = usersBaseUrl + "/patients";
            ResponseEntity<List<PatientLite>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<PatientLite>>() {}
            );

            if (response.getBody() == null) {
                return Optional.empty();
            }

            return response.getBody().stream()
                    .filter(p -> p.getUser() != null && p.getUser().getId() != null)
                    .filter(p -> p.getUser().getId().equals(patientUserId))
                    .findFirst();
        } catch (RestClientException ex) {
            return Optional.empty();
        }
    }

    private boolean isValidEmail(String value) {
        if (value == null) {
            return false;
        }
        String v = value.trim();
        if (v.isBlank()) {
            return false;
        }
        int atIndex = v.indexOf('@');
        int dotIndex = v.lastIndexOf('.');
        return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < v.length() - 1;
    }

    public static class UserLite {
        private Long id;
        private String email;
        private String role;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class PatientLite {
        private Long id;
        private UserLite user;
        private String emergencyContact;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public UserLite getUser() {
            return user;
        }

        public void setUser(UserLite user) {
            this.user = user;
        }

        public String getEmergencyContact() {
            return emergencyContact;
        }

        public void setEmergencyContact(String emergencyContact) {
            this.emergencyContact = emergencyContact;
        }
    }
}