package tn.esprit.activities_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.activities_service.entity.PhotoActivity;
import tn.esprit.activities_service.repository.PhotoActivityRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PhotoActivityService {
    
    @Autowired
    private PhotoActivityRepository photoActivityRepository;
    
    public List<PhotoActivity> getAllPhotoActivities() {
        return photoActivityRepository.findAll();
    }
    
    public Optional<PhotoActivity> getPhotoActivityById(Long id) {
        return photoActivityRepository.findById(id);
    }
    
    public PhotoActivity createPhotoActivity(PhotoActivity photoActivity) {
        return photoActivityRepository.save(photoActivity);
    }
    
    public PhotoActivity updatePhotoActivity(Long id, PhotoActivity photoActivity) {
        if (photoActivityRepository.existsById(id)) {
            photoActivity.setId(id);
            return photoActivityRepository.save(photoActivity);
        }
        return null;
    }
    
    public boolean deletePhotoActivity(Long id) {
        if (photoActivityRepository.existsById(id)) {
            photoActivityRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public List<PhotoActivity> getPhotoActivitiesByDifficulty(String difficulty) {
        return photoActivityRepository.findByDifficulty(difficulty);
    }
    
    public List<PhotoActivity> searchPhotoActivities(String title) {
        return photoActivityRepository.findByTitleContaining(title);
    }
}
