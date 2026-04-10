package tn.esprit.users_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tn.esprit.users_service.entity.Role;
import tn.esprit.users_service.entity.User;
import tn.esprit.users_service.repository.UserRepository;

import java.time.LocalDateTime;

/**
 * Seeds test users on application startup if database is empty.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Admin
            User admin = new User();
            admin.setFirstname("Admin");
            admin.setLastname("MindCare");
            admin.setEmail("admin@mindcare.com");
            admin.setPassword("admin123");
            admin.setPhone("+216 00 000 001");
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);

            // Doctor
            User doctor = new User();
            doctor.setFirstname("Dr. Ahmed");
            doctor.setLastname("Ben Ali");
            doctor.setEmail("doctor@mindcare.com");
            doctor.setPassword("doctor123");
            doctor.setPhone("+216 00 000 002");
            doctor.setRole(Role.DOCTOR);
            doctor.setCreatedAt(LocalDateTime.now());
            userRepository.save(doctor);

            // Patient
            User patient = new User();
            patient.setFirstname("Alice");
            patient.setLastname("Dupont");
            patient.setEmail("patient@mindcare.com");
            patient.setPassword("patient123");
            patient.setPhone("+216 00 000 003");
            patient.setRole(Role.PATIENT);
            patient.setCreatedAt(LocalDateTime.now());
            userRepository.save(patient);

            // Caregiver
            User caregiver = new User();
            caregiver.setFirstname("Marie");
            caregiver.setLastname("Martin");
            caregiver.setEmail("caregiver@mindcare.com");
            caregiver.setPassword("caregiver123");
            caregiver.setPhone("+216 00 000 004");
            caregiver.setRole(Role.CAREGIVER);
            caregiver.setCreatedAt(LocalDateTime.now());
            userRepository.save(caregiver);

            System.out.println("✅ 4 test users created (admin, doctor, patient, caregiver)");
        } else {
            System.out.println("ℹ️ Users already exist, skipping seed data.");
        }
    }
}
