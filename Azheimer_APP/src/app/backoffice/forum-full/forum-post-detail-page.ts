import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumIntegrationService } from '../../services/forum-integration.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forum-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host {
      display: block;
      color: #0f172a;
    }

    :host .form-input,
    :host .form-select,
    :host textarea.form-input {
      color: #0f172a !important;
      background: #ffffff !important;
      border-color: #cbd5e1 !important;
    }

    :host .form-input::placeholder,
    :host textarea.form-input::placeholder {
      color: #475569 !important;
      opacity: 1;
    }
  `],
  template: `
    <div style="max-width:800px">
      <button type="button" (click)="back.emit()" style="color:#0f172a;text-decoration:none;font-size:14px;display:inline-block;margin-bottom:16px;background:none;border:none;padding:0">
        <i class="fa-solid fa-arrow-left"></i> Retour au forum
      </button>

      @if (loading) {
        <div style="text-align:center;padding:48px"><div class="spinner" style="margin:0 auto"></div></div>
      } @else if (post) {
        <div class="card-alzcare" style="margin-bottom:24px">
          <h1 style="font-size:22px;font-weight:700;margin-bottom:8px;color:#0f172a">{{ post.title }}</h1>
          <div style="font-size:13px;color:#334155;margin-bottom:16px">
            <i class="fa-regular fa-clock"></i> {{ post.createdAt | date:'dd/MM/yyyy à HH:mm' }}
            · Utilisateur #{{ post.userId }}
          </div>
          <p style="font-size:15px;line-height:1.7;color:#0f172a;white-space:pre-wrap">{{ post.content }}</p>

          <!-- Post Like -->
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid #f1f5f9;display:flex;align-items:center;gap:12px">
            <button
              style="background:none;border:1px solid #fecaca;border-radius:20px;padding:6px 18px;cursor:pointer;display:inline-flex;align-items:center;gap:8px"
              (click)="likePost()">
              <i class="fa-solid fa-heart" style="color:#ef4444"></i>
              <span style="font-weight:600;color:#ef4444">{{ postLikes }}</span>
            </button>
            <span style="font-size:13px;color:#94a3b8">J'aime</span>
          </div>
        </div>

        <!-- Comments -->
        <div class="card-alzcare">
          <h2 style="font-size:16px;font-weight:600;margin-bottom:16px">Commentaires ({{ visibleComments.length }})</h2>

          @for (c of visibleComments; track c.id) {
            <div style="border-bottom:1px solid #f1f5f9;padding:12px 0" [style.background]="c.popular ? '#fffdf7' : ''">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span style="font-weight:500;font-size:14px;display:flex;align-items:center;gap:6px">
                  @if (c.popular) {
                    <i class="fa-solid fa-star" style="color:#f59e0b;font-size:12px" title="Commentaire populaire"></i>
                  }
                  Utilisateur #{{ c.userId }}
                </span>
                <span style="font-size:12px;color:#94a3b8">{{ c.createdAt | date:'dd/MM HH:mm' }}</span>
              </div>

              @if (editingCommentId === c.id) {
                <div style="display:flex;gap:8px">
                  <input class="form-input" [(ngModel)]="editContent">
                  <button class="btn-primary-alz" style="padding:8px 16px" (click)="saveEditComment(c.id)">OK</button>
                  <button class="btn-secondary-alz" style="padding:8px 16px" (click)="editingCommentId=0">&#x2715;</button>
                </div>
              } @else {
                <p style="font-size:14px;color:#475569">{{ c.content }}</p>

                <!-- Like / Dislike buttons -->
                <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
                  <button
                    style="background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:12px"
                    (click)="likeComment(c)">
                    <i class="fa-solid fa-thumbs-up" style="color:#16a34a;font-size:13px"></i>
                    <span style="font-weight:600;color:#16a34a;font-size:12px">{{ c.likes || 0 }}</span>
                  </button>
                  <button
                    style="background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:12px"
                    (click)="dislikeComment(c)">
                    <i class="fa-solid fa-thumbs-down" style="color:#ef4444;font-size:13px"></i>
                    <span style="font-weight:600;color:#ef4444;font-size:12px">{{ c.dislikes || 0 }}</span>
                  </button>

                  @if (c.userId === currentUserId) {
                    <span style="margin-left:auto;display:flex;gap:8px">
                      <button style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:13px" (click)="startEditComment(c)"><i class="fa-solid fa-pen"></i> Modifier</button>
                      <button style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:13px" (click)="deleteComment(c.id)"><i class="fa-solid fa-trash"></i> Supprimer</button>
                    </span>
                  }
                </div>
              }
            </div>
          }

          <div style="margin-top:16px;display:flex;gap:8px">
            <input class="form-input" [(ngModel)]="newComment" placeholder="Écrire un commentaire..." (keyup.enter)="addComment()">
            <button class="btn-primary-alz" [disabled]="!newComment.trim()" (click)="addComment()">Envoyer</button>
          </div>
        </div>
      }
    </div>
  `
})
export class ForumPostDetailPage implements OnInit, OnChanges {
  @Input() postId = 0;
  @Output() back = new EventEmitter<void>();

  post: any = null;
  comments: any[] = [];
  loading = true;
  newComment = '';
  currentUserId: number | null = null;
  editingCommentId = 0;
  editContent = '';
  postLikes = 0;

  constructor(
    private forumService: ForumIntegrationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadPost();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postId'] && !changes['postId'].firstChange) {
      this.loadPost();
    }
  }

  private loadPost(): void {
    if (!this.postId) {
      this.post = null;
      this.comments = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    const id = this.postId;
    this.forumService.getPostById(id).subscribe(p => {
      this.post = p;
      this.postLikes = this.forumService.getPostLikes(p.id);
      this.loading = false;
    });
    this.forumService.getCommentsByPostId(id).subscribe(c => {
      this.comments = c.map(comment => ({
        ...comment,
        likes: this.forumService.getCommentLikes(comment.id),
        dislikes: this.forumService.getCommentDislikes(comment.id),
        banned: this.forumService.isCommentBanned(comment.id),
        popular: this.forumService.isCommentPopular(comment.id)
      }));
    });
  }

  get visibleComments(): any[] {
    return this.comments.filter(c => !c.banned);
  }

  likePost(): void {
    if (!this.post) return;
    this.postLikes = this.forumService.likePost(this.post.id);
  }

  likeComment(comment: any): void {
    comment.likes = this.forumService.likeComment(comment.id);
  }

  dislikeComment(comment: any): void {
    const newCount = this.forumService.dislikeComment(comment.id);
    comment.dislikes = newCount;
    if (newCount >= 10) {
      comment.banned = true;
    }
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.post) return;
    this.forumService.addComment({ content: this.newComment, userId: this.currentUserId ?? 0 }, this.post.id).subscribe(c => {
      this.comments.push({ ...c, likes: 0, dislikes: 0, banned: false, popular: false });
      this.newComment = '';
    });
  }

  startEditComment(c: any): void {
    this.editingCommentId = c.id;
    this.editContent = c.content;
  }

  saveEditComment(id: number): void {
    this.forumService.updateComment(id, { content: this.editContent }).subscribe(updated => {
      const idx = this.comments.findIndex(c => c.id === id);
      if (idx >= 0) {
        this.comments[idx] = {
          ...updated,
          likes: this.forumService.getCommentLikes(id),
          dislikes: this.forumService.getCommentDislikes(id),
          banned: this.forumService.isCommentBanned(id),
          popular: this.forumService.isCommentPopular(id)
        };
      }
      this.editingCommentId = 0;
    });
  }

  deleteComment(id: number): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    this.forumService.deleteComment(id).subscribe(() => {
      this.comments = this.comments.filter(c => c.id !== id);
    });
  }
}
