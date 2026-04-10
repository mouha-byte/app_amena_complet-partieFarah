package tn.esprit.activities_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "photo_activity")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PhotoActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Column(nullable = false)
    private String difficulty;
    
    @Column(name = "created_at", updatable = false)
    private java.util.Date createdAt;
    
    @Column(name = "updated_at")
    private java.util.Date updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new java.util.Date();
        updatedAt = new java.util.Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new java.util.Date();
    }
}
