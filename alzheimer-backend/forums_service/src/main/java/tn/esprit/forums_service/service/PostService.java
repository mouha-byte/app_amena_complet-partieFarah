package tn.esprit.forums_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.forums_service.entity.Category;
import tn.esprit.forums_service.entity.Post;
import tn.esprit.forums_service.exception.ResourceNotFoundException;
import tn.esprit.forums_service.repository.CategoryRepository;
import tn.esprit.forums_service.repository.PostRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final LocalContentModerationService moderationService;

    public Post createPost(Post post, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        post.setCategory(category);
        applyModeration(post);
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        refreshModerationScores(posts);
        return posts;
    }

    public Post getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        refreshModerationScores(List.of(post));
        return post;
    }

    public List<Post> getPostsByCategoryId(Long categoryId) {
        List<Post> posts = postRepository.findByCategoryId(categoryId);
        refreshModerationScores(posts);
        return posts;
    }

    public Post updatePost(Long id, Post postDetails) {
        Post post = getPostById(id);
        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        applyModeration(post);
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        Post post = getPostById(id);
        postRepository.delete(post);
    }

    private void applyModeration(Post post) {
        String title = post.getTitle() != null ? post.getTitle() : "";
        String content = post.getContent() != null ? post.getContent() : "";
        LocalContentModerationService.ModerationScores scores = moderationService.evaluate(title + "\n" + content);
        post.setViolenceSensitivity(scores.violenceScore());
        post.setSpamSensitivity(scores.spamScore());
    }

    private void refreshModerationScores(List<Post> posts) {
        List<Post> needsRefresh = posts.stream()
                .filter(post -> post.getViolenceSensitivity() == null || post.getSpamSensitivity() == null)
                .toList();

        if (needsRefresh.isEmpty()) {
            return;
        }

        for (Post post : needsRefresh) {
            applyModeration(post);
        }

        postRepository.saveAll(needsRefresh);
    }
}
