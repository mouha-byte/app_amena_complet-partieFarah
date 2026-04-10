import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../core/services/forum.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forum-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <a routerLink="/forum" style="color:#64748b;text-decoration:none"><i class="fa-solid fa-arrow-left"></i></a>
        <div>
          <h1 style="font-size:24px;font-weight:700">{{ categoryName }}</h1>
          <p style="color:#64748b;font-size:14px">{{ posts.length }} publication(s)</p>
        </div>
      </div>

      <button class="btn-primary-alz" style="margin-bottom:16px" (click)="showNewPost=true">
        <i class="fa-solid fa-plus"></i> Nouvelle publication
      </button>

      @if (loading) {
        <div style="text-align:center;padding:48px"><div class="spinner" style="margin:0 auto"></div></div>
      } @else {
        @for (p of posts; track p.id) {
          <a [routerLink]="['/forum/post', p.id]" style="text-decoration:none;color:inherit;display:block;margin-bottom:12px">
            <div class="card-alzcare">
              <h3 style="font-size:16px;font-weight:600;margin-bottom:6px">{{ p.title }}</h3>
              <p style="font-size:14px;color:#64748b;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">{{ p.content }}</p>
              <div style="display:flex;gap:16px;font-size:12px;color:#94a3b8">
                <span><i class="fa-regular fa-clock"></i> {{ p.createdAt | date:'dd/MM/yyyy' }}</span>
                <span><i class="fa-regular fa-user"></i> Utilisateur #{{ p.userId }}</span>
              </div>
            </div>
          </a>
        }

        @if (posts.length === 0) {
          <div class="card-alzcare" style="text-align:center;padding:48px">
            <p style="color:#64748b">Aucune publication dans cette catégorie</p>
          </div>
        }
      }

      @if (showNewPost) {
        <div class="modal-overlay" (click)="showNewPost=false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">Nouvelle publication</h2>
            <div class="form-group">
              <label class="form-label">Titre</label>
              <input class="form-input" [(ngModel)]="newPost.title">
            </div>
            <div class="form-group">
              <label class="form-label">Contenu</label>
              <textarea class="form-input" [(ngModel)]="newPost.content" rows="5"></textarea>
            </div>
            <div style="display:flex;gap:12px;margin-top:16px">
              <button class="btn-primary-alz" (click)="createPost()">Publier</button>
              <button class="btn-secondary-alz" (click)="showNewPost=false">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ForumPostsPage implements OnInit {
  categoryId = 0;
  categoryName = '';
  posts: any[] = [];
  loading = true;
  showNewPost = false;
  newPost = { title: '', content: '' };

  constructor(private route: ActivatedRoute, private forumService: ForumService, private authService: AuthService) {}

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.forumService.getCategoryById(this.categoryId).subscribe(cat => this.categoryName = cat.name);
    this.loadPosts();
  }

  loadPosts(): void {
    this.forumService.getPostsByCategory(this.categoryId).subscribe({
      next: p => { this.posts = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  createPost(): void {
    if (!this.newPost.title || !this.newPost.content) return;
    const post = { ...this.newPost, userId: this.authService.getUserId() || 1 };
    this.forumService.createPost(post, this.categoryId).subscribe(() => {
      this.showNewPost = false;
      this.newPost = { title: '', content: '' };
      this.loadPosts();
    });
  }
}
