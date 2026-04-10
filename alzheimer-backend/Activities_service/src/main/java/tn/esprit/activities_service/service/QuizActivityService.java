package tn.esprit.activities_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.activities_service.entity.QuizActivity;
import tn.esprit.activities_service.repository.QuizActivityRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class QuizActivityService {

    @Autowired
    private QuizActivityRepository quizActivityRepository;

    public List<QuizActivity> getAllQuizActivities() {
        return quizActivityRepository.findAll();
    }

    public Optional<QuizActivity> getQuizActivityById(Long id) {
        return quizActivityRepository.findById(id);
    }

    public QuizActivity createQuizActivity(QuizActivity quizActivity) {
        if (quizActivity.getQuestions() != null) {
            quizActivity.getQuestions().forEach(q -> q.setQuiz(quizActivity));
        }
        return quizActivityRepository.save(quizActivity);
    }

    public QuizActivity updateQuizActivity(Long id, QuizActivity quizActivity) {
        if (quizActivityRepository.existsById(id)) {
            quizActivity.setId(id);
            if (quizActivity.getQuestions() != null) {
                quizActivity.getQuestions().forEach(q -> q.setQuiz(quizActivity));
            }
            return quizActivityRepository.save(quizActivity);
        }
        return null;
    }

    public boolean deleteQuizActivity(Long id) {
        if (quizActivityRepository.existsById(id)) {
            quizActivityRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<QuizActivity> getQuizActivitiesByTheme(String theme) {
        return quizActivityRepository.findByTheme(theme);
    }

    public List<QuizActivity> getQuizActivitiesByDifficulty(String difficulty) {
        return quizActivityRepository.findByDifficulty(difficulty);
    }

    public List<QuizActivity> searchQuizActivities(String title) {
        return quizActivityRepository.findByTitleContaining(title);
    }
}
