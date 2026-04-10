import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumIntegrationService } from '../../services/forum-integration.service';

@Component({
  selector: 'app-forum-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="forum-posts-shell">
      <div class="forum-posts-header">
        <button type="button" class="forum-back-btn" (click)="back.emit()"><i class="fa-solid fa-arrow-left"></i></button>
        <div>
          <h1 class="forum-posts-title">{{ categoryName || 'Publications' }}</h1>
          <p class="forum-posts-subtitle">{{ posts.length }} publication(s)</p>
        </div>
      </div>

      <button class="btn-primary-alz" style="margin-bottom:16px" (click)="openCreateModal()">
        <i class="fa-solid fa-plus"></i> Nouvelle publication
      </button>

      @if (loading) {
        <div style="text-align:center;padding:48px"><div class="spinner" style="margin:0 auto"></div></div>
      } @else {
        @for (p of posts; track p.id) {
          <button type="button" (click)="openPost.emit(p.id)" class="post-card-btn">
            <div class="card-alzcare post-card">
              <h3 class="post-title">{{ p.title }}</h3>
              <p class="post-content">{{ p.content }}</p>
              <div class="post-meta">
                <span><i class="fa-regular fa-clock"></i> {{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                <span><i class="fa-regular fa-user"></i> {{ p.author || 'Anonyme' }}</span>
              </div>
            </div>
          </button>
        }

        @if (posts.length === 0) {
          <div class="card-alzcare" style="text-align:center;padding:48px">
            <p style="color:#0f172a">Aucune publication dans cette catégorie</p>
          </div>
        }
      }

      @if (showNewPost) {
        <div class="forum-post-overlay" (click)="closeCreateModal()">
          <div class="forum-post-modal" (click)="$event.stopPropagation()">
            <h2 class="forum-modal-title">Nouvelle publication</h2>
            <p class="forum-modal-subtitle">Ce post sera publie en mode communautaire (non relie a une personne).</p>

            <div class="form-group">
              <label class="form-label forum-label">Titre</label>
              <input class="form-input forum-input" [(ngModel)]="newPost.title" placeholder="Titre du post">
            </div>
            <div class="form-group">
              <label class="form-label forum-label">Contenu</label>
              <textarea class="form-input forum-input" [(ngModel)]="newPost.content" rows="5" placeholder="Ecrivez votre publication..."></textarea>
            </div>

            @if (createPostError) {
              <div class="forum-error-box">
                {{ createPostError }}
              </div>
            }

            <div class="forum-actions">
              <button class="btn-primary-alz" [disabled]="submittingPost" (click)="createPost()">
                {{ submittingPost ? 'Publication...' : 'Publier' }}
              </button>
              <button class="btn-secondary-alz" (click)="closeCreateModal()">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        color: #0f172a;
      }

      .forum-posts-shell {
        color: #0f172a;
      }

      .forum-posts-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }

      .forum-back-btn {
        color: #334155;
        text-decoration: none;
        background: none;
        border: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
      }

      .forum-back-btn:hover {
        background: rgba(148, 163, 184, 0.2);
        color: #0f172a;
      }

      .forum-posts-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        color: #0f172a;
      }

      .forum-posts-subtitle {
        color: #334155;
        font-size: 14px;
        margin: 0;
      }

      .post-card-btn {
        text-decoration: none;
        color: inherit;
        display: block;
        margin-bottom: 12px;
        background: none;
        border: none;
        padding: 0;
        width: 100%;
        text-align: left;
      }

      .post-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
      }

      .post-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 6px;
        color: #0f172a;
      }

      .post-content {
        font-size: 14px;
        color: #334155;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .post-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #475569;
      }

      .forum-post-overlay {
        position: fixed;
        inset: 0;
        z-index: 1055;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .forum-post-modal {
        width: min(760px, 95vw);
        max-height: calc(100vh - 48px);
        overflow: auto;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 24px;
        background: #ffffff;
        box-shadow: 0 24px 45px rgba(15, 23, 42, 0.2);
      }

      .forum-modal-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 6px;
        color: #0f172a;
      }

      .forum-modal-subtitle {
        margin: 0 0 18px;
        font-size: 13px;
        color: #334155;
      }

      .forum-label {
        color: #0f172a;
      }

      .forum-input {
        background: #ffffff;
        border-color: #cbd5e1;
        color: #0f172a;
      }

      .forum-input::placeholder {
        color: #475569;
        opacity: 1;
      }

      .forum-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
      }

      .forum-error-box {
        margin-top: 8px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 13px;
      }

      .forum-actions {
        display: flex;
        gap: 12px;
        margin-top: 18px;
      }

      @media (max-width: 640px) {
        .forum-post-modal {
          padding: 18px;
        }

        .forum-actions {
          flex-direction: column;
        }
      }
    `
  ]
})
export class ForumPostsPage implements OnInit, OnChanges {
  @Input() categoryId = 0;
  @Output() back = new EventEmitter<void>();
  @Output() openPost = new EventEmitter<number>();

  categoryName = '';
  posts: any[] = [];
  loading = true;
  showNewPost = false;
  submittingPost = false;
  createPostError = '';
  newPost = { title: '', content: '' };

  constructor(private forumService: ForumIntegrationService) {}

  ngOnInit(): void {
    this.reloadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && !changes['categoryId'].firstChange) {
      this.reloadData();
    }
  }

  private reloadData(): void {
    if (!this.categoryId) {
      this.loading = false;
      this.posts = [];
      this.categoryName = '';
      return;
    }

    this.loading = true;
    this.forumService.getCategoryById(this.categoryId).subscribe({
      next: (cat) => {
        this.categoryName = cat.name;
      },
      error: () => {
        this.categoryName = 'Categorie';
      }
    });

    this.loadPosts();
  }

  loadPosts(): void {
    this.forumService.getPostsByCategory(this.categoryId).subscribe({
      next: p => {
        this.posts = p;
        this.ensureAuthorFallbackFromPosts();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private ensureAuthorFallbackFromPosts(): void {
    this.posts = (this.posts || []).map((post) => {
      if (post?.author && String(post.author).trim()) {
        return post;
      }
      if (post?.userId) {
        return { ...post, author: `User ${post.userId}` };
      }
      return { ...post, author: 'Anonyme' };
    });
  }

  openCreateModal(): void {
    this.createPostError = '';
    this.showNewPost = true;
  }

  closeCreateModal(): void {
    this.showNewPost = false;
    this.createPostError = '';
  }

  createPost(): void {
    const title = this.newPost.title.trim();
    const content = this.newPost.content.trim();

    if (!title || !content) {
      this.createPostError = 'Veuillez renseigner un titre et un contenu.';
      return;
    }

    if (!this.categoryId) {
      this.createPostError = 'Categorie invalide. Retournez a la liste des categories puis reessayez.';
      return;
    }

    this.submittingPost = true;
    this.createPostError = '';

    const post = { title, content };
    this.forumService.createPost(post, this.categoryId).subscribe({
      next: () => {
        this.submittingPost = false;
        this.showNewPost = false;
        this.newPost = { title: '', content: '' };
        this.loadPosts();
      },
      error: (err) => {
        this.submittingPost = false;
        const apiMessage = typeof err?.error === 'string'
          ? err.error
          : (err?.error?.message || err?.message || 'Erreur serveur lors de la creation du post.');
        this.createPostError = apiMessage;
      }
    });
  }
}
