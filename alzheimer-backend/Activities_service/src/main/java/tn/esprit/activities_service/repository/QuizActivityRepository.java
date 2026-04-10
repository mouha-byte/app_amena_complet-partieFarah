package tn.esprit.activities_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.activities_service.entity.QuizActivity;

import java.util.List;

@Repository
public interface QuizActivityRepository extends JpaRepository<QuizActivity, Long> {
    
    List<QuizActivity> findByTheme(String theme);
    
    List<QuizActivity> findByDifficulty(String difficulty);
    
    List<QuizActivity> findByThemeAndDifficulty(String theme, String difficulty);
    
    @Query("SELECT q FROM QuizActivity q WHERE q.title LIKE %:title%")
    List<QuizActivity> findByTitleContaining(String title);
    
    @Query("SELECT q FROM QuizActivity q ORDER BY q.createdAt DESC")
    List<QuizActivity> findAllOrderByCreatedAtDesc();
}
