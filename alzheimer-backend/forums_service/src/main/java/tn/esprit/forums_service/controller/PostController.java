package tn.esprit.forums_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forums_service.dto.PostDTO;
import tn.esprit.forums_service.entity.Post;
import tn.esprit.forums_service.repository.CommentRepository;
import tn.esprit.forums_service.service.PostService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class PostController {

    private final PostService postService;
    private final CommentRepository commentRepository;

    @PostMapping("/category/{categoryId}")
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody Post post, @PathVariable("categoryId") Long categoryId) {
        Post created = postService.createPost(post, categoryId);
        PostDTO dto = PostDTO.builder()
                .id(created.getId())
                .title(created.getTitle())
                .content(created.getContent())
                .userId(created.getUserId())
                .author(resolveAuthor(created))
                .createdAt(created.getCreatedAt())
                .categoryId(created.getCategory() != null ? created.getCategory().getId() : null)
                .categoryName(created.getCategory() != null ? created.getCategory().getName() : "General")
                .status(created.getStatus() != null ? created.getStatus() : "PUBLISHED")
                .commentCount(0)
                .violenceSensitivity(created.getViolenceSensitivity() != null ? created.getViolenceSensitivity() : 0)
                .spamSensitivity(created.getSpamSensitivity() != null ? created.getSpamSensitivity() : 0)
                .build();
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping
    public List<PostDTO> getAllPosts() {
        System.out.println(">>> Request: getAllPosts");
        List<Post> posts = postService.getAllPosts();
        System.out.println(">>> Found " + posts.size() + " posts");
        
        List<PostDTO> dtos = posts.stream()
            .map(post -> {
                long count = 0;
                try {
                    count = commentRepository.countByPost_Id(post.getId());
                } catch (Exception e) {
                    System.err.println(">>> Error counting comments for post " + post.getId() + ": " + e.getMessage());
                }
                
                return PostDTO.builder()
                    .id(post.getId())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .userId(post.getUserId())
                    .author(resolveAuthor(post))
                    .createdAt(post.getCreatedAt())
                    .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                    .categoryName(post.getCategory() != null ? post.getCategory().getName() : "General")
                    .status(post.getStatus() != null ? post.getStatus() : "PUBLISHED")
                    .commentCount(count)
                        .violenceSensitivity(post.getViolenceSensitivity() != null ? post.getViolenceSensitivity() : 0)
                        .spamSensitivity(post.getSpamSensitivity() != null ? post.getSpamSensitivity() : 0)
                    .build();
            })
            .collect(Collectors.toList());
        
        System.out.println(">>> Returning " + dtos.size() + " DTOs for dashboard");
        return dtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable("id") Long id) {
        System.out.println(">>> Request: getPostById - ID: " + id);
        Post post = postService.getPostById(id);
        System.out.println(">>> Found post: " + (post != null ? post.getTitle() : "NULL"));
        
        long count = 0;
        try {
            count = commentRepository.countByPost_Id(id);
        } catch (Exception e) {
            System.err.println(">>> Error counting comments: " + e.getMessage());
        }

        PostDTO dto = PostDTO.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .userId(post.getUserId())
            .author(resolveAuthor(post))
            .createdAt(post.getCreatedAt())
            .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
            .categoryName(post.getCategory() != null ? post.getCategory().getName() : "General")
            .status(post.getStatus() != null ? post.getStatus() : "PUBLISHED")
            .commentCount(count)
            .violenceSensitivity(post.getViolenceSensitivity() != null ? post.getViolenceSensitivity() : 0)
            .spamSensitivity(post.getSpamSensitivity() != null ? post.getSpamSensitivity() : 0)
            .build();
        
        System.out.println(">>> Returning DTO for post " + id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/category/{categoryId}")
    public List<PostDTO> getPostsByCategoryId(@PathVariable("categoryId") Long categoryId) {
        return postService.getPostsByCategoryId(categoryId).stream()
            .map(post -> PostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .userId(post.getUserId())
                .author(resolveAuthor(post))
                .createdAt(post.getCreatedAt())
                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : "General")
                .status(post.getStatus() != null ? post.getStatus() : "PUBLISHED")
                .commentCount(commentRepository.countByPost_Id(post.getId()))
                .violenceSensitivity(post.getViolenceSensitivity() != null ? post.getViolenceSensitivity() : 0)
                .spamSensitivity(post.getSpamSensitivity() != null ? post.getSpamSensitivity() : 0)
                .build())
            .collect(Collectors.toList());
    }

    private String resolveAuthor(Post post) {
        if (post.getAuthor() != null && !post.getAuthor().isBlank()) {
            return post.getAuthor();
        }
        if (post.getUserId() != null && post.getUserId() > 0) {
            return "User " + post.getUserId();
        }
        return "Anonyme";
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable("id") Long id, @RequestBody Post postDetails) {
        return ResponseEntity.ok(postService.updatePost(id, postDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
