package tn.esprit.activities_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.activities_service.entity.PhotoActivity;
import tn.esprit.activities_service.service.PhotoActivityService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/photo-activities")
@Tag(name = "Photo Activities Management", description = "API pour la gestion des activités photo")
public class PhotoActivityController {

    @Autowired
    private PhotoActivityService photoActivityService;

    @Operation(summary = "Récupérer toutes les activités photo", description = "Retourne la liste de toutes les activités photo disponibles")
    @GetMapping
    public ResponseEntity<List<PhotoActivity>> getAllPhotoActivities() {
        List<PhotoActivity> photos = photoActivityService.getAllPhotoActivities();
        return ResponseEntity.ok(photos);
    }

    @Operation(summary = "Récupérer une activité photo par ID", description = "Retourne une activité photo spécifique basée sur son ID")
    @GetMapping("/{id}")
    public ResponseEntity<PhotoActivity> getPhotoActivityById(
            @Parameter(description = "ID de l'activité photo à récupérer") @PathVariable("id") Long id) {
        Optional<PhotoActivity> photo = photoActivityService.getPhotoActivityById(id);
        return photo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Créer une nouvelle activité photo", description = "Crée une nouvelle activité photo")
    @PostMapping
    public ResponseEntity<PhotoActivity> createPhotoActivity(@RequestBody PhotoActivity photoActivity) {
        PhotoActivity createdPhoto = photoActivityService.createPhotoActivity(photoActivity);
        return ResponseEntity.ok(createdPhoto);
    }

    @Operation(summary = "Mettre à jour une activité photo", description = "Met à jour une activité photo existante")
    @PutMapping("/{id}")
    public ResponseEntity<PhotoActivity> updatePhotoActivity(
            @Parameter(description = "ID de l'activité photo à mettre à jour") @PathVariable("id") Long id,
            @RequestBody PhotoActivity photoActivity) {
        PhotoActivity updatedPhoto = photoActivityService.updatePhotoActivity(id, photoActivity);
        if (updatedPhoto != null) {
            return ResponseEntity.ok(updatedPhoto);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Supprimer une activité photo", description = "Supprime une activité photo existante")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhotoActivity(
            @Parameter(description = "ID de l'activité photo à supprimer") @PathVariable("id") Long id) {
        boolean deleted = photoActivityService.deletePhotoActivity(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Rechercher des activités photo par difficulté", description = "Retourne les activités photo d'une difficulté spécifique")
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<PhotoActivity>> getPhotoActivitiesByDifficulty(
            @Parameter(description = "Difficulté des activités") @PathVariable("difficulty") String difficulty) {
        List<PhotoActivity> photos = photoActivityService.getPhotoActivitiesByDifficulty(difficulty);
        return ResponseEntity.ok(photos);
    }

    @Operation(summary = "Rechercher des activités photo par titre", description = "Recherche des activités photo contenant le titre spécifié")
    @GetMapping("/search")
    public ResponseEntity<List<PhotoActivity>> searchPhotoActivities(
            @Parameter(description = "Terme de recherche") @RequestParam("title") String title) {
        List<PhotoActivity> photos = photoActivityService.searchPhotoActivities(title);
        return ResponseEntity.ok(photos);
    }
}
