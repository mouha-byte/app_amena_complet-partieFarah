package tn.esprit.forums_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.forums_service.entity.Comment;
import tn.esprit.forums_service.entity.Post;
import tn.esprit.forums_service.exception.ResourceNotFoundException;
import tn.esprit.forums_service.repository.CommentRepository;
import tn.esprit.forums_service.repository.PostRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final LocalContentModerationService moderationService;

    public Comment addComment(Long postId, Comment comment) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        comment.setPost(post);
        applyModeration(comment);
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPost_Id(postId);
        refreshModerationScores(comments);
        return comments;
    }

    public List<Comment> getAllComments() {
        List<Comment> comments = commentRepository.findAll();
        refreshModerationScores(comments);
        return comments;
    }

    public Comment updateComment(Long id, Comment commentDetails) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        String newContent = commentDetails.getContent() != null ? commentDetails.getContent().trim() : "";
        if (newContent.isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        comment.setContent(newContent);
        applyModeration(comment);
        return commentRepository.save(comment);
    }

    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
        commentRepository.delete(comment);
    }

    private void applyModeration(Comment comment) {
        String content = comment.getContent() != null ? comment.getContent() : "";
        LocalContentModerationService.ModerationScores scores = moderationService.evaluate(content);
        comment.setViolenceSensitivity(scores.violenceScore());
        comment.setSpamSensitivity(scores.spamScore());
    }

    private void refreshModerationScores(List<Comment> comments) {
        List<Comment> needsRefresh = comments.stream()
                .filter(comment -> comment.getViolenceSensitivity() == null || comment.getSpamSensitivity() == null)
                .toList();

        if (needsRefresh.isEmpty()) {
            return;
        }

        for (Comment comment : needsRefresh) {
            applyModeration(comment);
        }

        commentRepository.saveAll(needsRefresh);
    }
}
