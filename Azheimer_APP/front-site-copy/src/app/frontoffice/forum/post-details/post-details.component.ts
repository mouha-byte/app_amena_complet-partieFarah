import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService, Post, Comment } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.html',
  styleUrls: ['./post-details.component.css'],
  standalone: false
})
export class PostDetailsComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  newCommentContent: string = '';
  editingCommentId: number | null = null;
  editCommentContent: string = '';
  get currentUserId(): number { return this.authService.getUserId() ?? 0; }
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private forumService: ForumService,
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('🚀 [POST-DETAILS] Component initialized');
    this.loading = true;
    this.error = null;
    this.post = null;

    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      console.log('🔍 [POST-DETAILS] Route param ID:', idStr);

      if (idStr) {
        const postId = parseInt(idStr);
        if (isNaN(postId)) {
          console.error('❌ [POST-DETAILS] Invalid ID');
          this.error = 'Identifiant de post invalide.';
          this.loading = false;
        } else {
          console.log('✅ [POST-DETAILS] Valid ID, loading post:', postId);
          this.loadPostData(postId);
        }
      } else {
        console.error('❌ [POST-DETAILS] No ID in route');
        this.error = 'Aucun post spécifié.';
        this.loading = false;
      }
    });
  }

  loadPostData(postId: number): void {
    console.log('📡 [POST-DETAILS] Starting API call for post:', postId);
    this.loading = true;
    this.error = null;

    // Safety timeout - force error after 10 seconds
    const loadingTimeout = setTimeout(() => {
      if (this.loading && !this.post) {
        console.error('⏱️ [POST-DETAILS] TIMEOUT - Forcing error state');
        this.error = 'Le chargement prend trop de temps. Le serveur ne répond pas.';
        this.loading = false;
      }
    }, 10000);

    this.forumService.getPostById(postId).subscribe({
      next: (postData) => {
        console.log('✅ [POST-DETAILS] SUCCESS - Post received:', postData);
        clearTimeout(loadingTimeout); // IMPORTANT: Cancel timeout immediately

        this.post = postData;
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection

        console.log('✅ [POST-DETAILS] State updated - loading:', this.loading, 'post:', !!this.post);

        // Load comments in background
        this.loadComments(postId);
      },
      error: (err) => {
        console.error('❌ [POST-DETAILS] ERROR loading post:', err);
        clearTimeout(loadingTimeout); // IMPORTANT: Cancel timeout on error too

        this.error = "Discussion introuvable ou erreur serveur.";
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        console.log('❌ [POST-DETAILS] Error state - loading:', this.loading);
      }
    });
  }

  loadComments(postId: number): void {
    console.log('💬 [POST-DETAILS] Loading comments for post:', postId);

    this.forumService.getCommentsByPostId(postId).subscribe({
      next: (commentsData) => {
        console.log('✅ [POST-DETAILS] Comments loaded:', commentsData?.length || 0, 'comments');
        this.comments = commentsData || [];
      },
      error: (err) => {
        console.error('❌ [POST-DETAILS] Error loading comments (non-critical):', err);
        this.comments = []; // Don't fail the page
      }
    });
  }

  navigateBack(): void {
    if (this.post && this.post.categoryId) {
      this.router.navigate(['/forum/category', this.post.categoryId]);
    } else {
      this.router.navigate(['/forum']);
    }
  }

  addComment(): void {
    if (!this.newCommentContent.trim() || !this.post) return;

    const commentBody = {
      content: this.newCommentContent.trim(),
      userId: this.currentUserId
    };

    console.log('📝 [POST-DETAILS] Adding comment:', commentBody);

    this.forumService.addComment(commentBody, this.post.id).subscribe({
      next: (newComment) => {
        console.log('✅ [POST-DETAILS] Comment added:', newComment);
        this.comments.unshift(newComment);
        this.newCommentContent = '';
        if (this.post) {
          this.post.commentCount++;
        }
      },
      error: (err) => {
        console.error('❌ [POST-DETAILS] Error adding comment:', err);
        alert("Erreur lors de l'envoi du commentaire.");
      }
    });
  }

  startEditComment(comment: Comment): void {
    console.log('✏️ [POST-DETAILS] Starting edit for comment:', comment.id);
    this.editingCommentId = comment.id;
    this.editCommentContent = comment.content;
  }

  saveEditComment(comment: Comment): void {
    if (!this.editCommentContent.trim()) return;

    console.log('💾 [POST-DETAILS] Saving comment:', comment.id);

    this.forumService.updateComment(comment.id, { content: this.editCommentContent }).subscribe({
      next: (updated) => {
        console.log('✅ [POST-DETAILS] Comment updated:', updated);
        const idx = this.comments.findIndex(c => c.id === comment.id);
        if (idx !== -1) {
          this.comments[idx] = updated;
        }
        this.cancelEditComment();
      },
      error: (err) => {
        console.error('❌ [POST-DETAILS] Error updating comment:', err);
        alert("Erreur lors de la modification.");
      }
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentContent = '';
  }

  deleteComment(id: number): void {
    if (!confirm('Supprimer ce commentaire ?')) return;

    console.log('🗑️ [POST-DETAILS] Deleting comment:', id);

    this.forumService.deleteComment(id).subscribe({
      next: () => {
        console.log('✅ [POST-DETAILS] Comment deleted');
        this.comments = this.comments.filter(c => c.id !== id);
        if (this.post) this.post.commentCount--;
      },
      error: (err) => {
        console.error('❌ [POST-DETAILS] Error deleting comment:', err);
        alert("Erreur lors de la suppression.");
      }
    });
  }

  isCommentOwner(comment: Comment): boolean {
    // For now, all comments belong to user 1
    return comment.userId === this.currentUserId;
  }
}
