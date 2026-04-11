package tn.esprit.users_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tn.esprit.users_service.entity.Role;
import tn.esprit.users_service.entity.User;
import tn.esprit.users_service.repository.UserRepository;

import java.time.LocalDateTime;

/**
 * Ensures test users exist on application startup.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        ensureUser("Admin", "MindCare", "admin@mindcare.com", "admin123", "+216 00 000 001", Role.ADMIN);
        ensureUser("Dr. Ahmed", "Ben Ali", "doctor@mindcare.com", "doctor123", "+216 00 000 002", Role.DOCTOR);
        ensureUser("Alice", "Dupont", "patient@mindcare.com", "patient123", "+216 00 000 003", Role.PATIENT);
        ensureUser("Marie", "Martin", "caregiver@mindcare.com", "caregiver123", "+216 00 000 004", Role.CAREGIVER);

        // Requested custom accounts
        ensureUser("Amena", "Patient", "amena.patient@gmail.com", "patient123", "+216 00 000 005", Role.PATIENT);
        ensureUser("Amena", "Caregiver", "amena@gmail.com", "caregiver123", "+216 00 000 006", Role.CAREGIVER);

        System.out.println("✅ Seed users ensured (including Amena patient/caregiver accounts)");
    }

    private void ensureUser(String firstname, String lastname, String email, String password, String phone, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = new User();
        user.setFirstname(firstname);
        user.setLastname(lastname);
        user.setEmail(email);
        user.setPassword(password);
        user.setPhone(phone);
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
