package tn.esprit.users_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.users_service.entity.Role;
import tn.esprit.users_service.entity.User;
import tn.esprit.users_service.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;

    /**
     * POST /auth/login
     * Body: { "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(errorResponse("Email et mot de passe requis."));
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse("Email ou mot de passe incorrect."));
        }

        User user = userOpt.get();
        // Simple password check (plaintext for dev/test — use BCrypt in production)
        if (!password.equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse("Email ou mot de passe incorrect."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Connexion réussie !");
        response.put("user", userToMap(user));
        return ResponseEntity.ok(response);
    }

    /**
     * POST /auth/register
     * Body: { "firstname", "lastname", "email", "password", "phone", "role" }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User newUser) {
        if (newUser.getEmail() == null || newUser.getPassword() == null
                || newUser.getEmail().isBlank() || newUser.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(errorResponse("Email et mot de passe requis."));
        }

        newUser.setEmail(newUser.getEmail().trim().toLowerCase());

        if (userRepository.existsByEmail(newUser.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(errorResponse("Un compte avec cet email existe déjà."));
        }

        if (newUser.getRole() == null) {
            newUser.setRole(Role.PATIENT);
        }
        newUser.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(newUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Compte créé avec succès !");
        response.put("user", userToMap(saved));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /auth/me/{id}
     * Returns user profile by ID.
     */
    @GetMapping("/me/{id}")
    public ResponseEntity<?> getProfile(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(userToMap(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /auth/test
     * Health check endpoint.
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "auth"));
    }

    // --- Helpers ---

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("firstname", user.getFirstname());
        map.put("lastname", user.getLastname());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole() != null ? user.getRole().name() : "PATIENT");
        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return map;
    }

    private Map<String, Object> errorResponse(String message) {
        Map<String, Object> map = new HashMap<>();
        map.put("success", false);
        map.put("message", message);
        return map;
    }
}
