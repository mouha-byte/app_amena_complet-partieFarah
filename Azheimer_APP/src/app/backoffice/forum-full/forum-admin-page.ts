import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumIntegrationService } from '../../services/forum-integration.service';

@Component({
  selector: 'app-forum-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    :host {
      display: block;
      color: #0f172a;
    }

    :host .table-alzcare thead th {
      color: #334155;
      font-weight: 700;
    }

    :host .table-alzcare tbody td {
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
    <div>
      <h1 style="font-size:24px;font-weight:700;margin-bottom:4px;color:#0f172a">Gestion du Forum</h1>
      <p style="color:#0f172a;font-size:14px;margin-bottom:24px">Administrer les catégories, publications et commentaires</p>

      <!-- Tabs -->
      <div style="display:flex;gap:4px;margin-bottom:24px;border-bottom:2px solid #e2e8f0;flex-wrap:wrap">
        @for (tab of tabs; track tab.key) {
          <button
            style="padding:10px 20px;border:none;background:none;font-size:14px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;position:relative"
            [style.color]="activeTab===tab.key ? '#3b82f6' : '#64748b'"
            [style.border-bottom-color]="activeTab===tab.key ? '#3b82f6' : 'transparent'"
            (click)="activeTab=tab.key">
            {{ tab.label }}
            @if (tab.key === 'banned' && bannedCount > 0) {
              <span style="background:#ef4444;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;margin-left:6px">
                {{ bannedCount }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Categories Tab -->
      @if (activeTab === 'categories') {
        <div style="margin-bottom:16px">
          <button class="btn-primary-alz" (click)="openCatForm()"><i class="fa-solid fa-plus"></i> Nouvelle catégorie</button>
        </div>
        <div class="card-alzcare" style="padding:0;overflow:hidden">
          <table class="table-alzcare">
            <thead><tr><th>Nom</th><th>Description</th><th>Actions</th></tr></thead>
            <tbody>
              @for (c of categories; track c.id) {
                <tr>
                  <td style="font-weight:500">{{ c.name }}</td>
                  <td>{{ c.description }}</td>
                  <td>
                    <button style="background:none;border:none;color:#3b82f6;cursor:pointer" (click)="openCatForm(c)"><i class="fa-solid fa-pen"></i></button>
                    <button style="background:none;border:none;color:#ef4444;cursor:pointer" (click)="deleteCat(c.id)"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Posts Tab (with Likes) -->
      @if (activeTab === 'posts') {
        <div class="card-alzcare" style="padding:0;overflow:hidden">
          <table class="table-alzcare">
            <thead><tr><th>Titre</th><th>Catégorie</th><th>Date</th><th style="text-align:center">Likes</th><th style="text-align:center">Violence</th><th style="text-align:center">Spam</th><th>Actions</th></tr></thead>
            <tbody>
              @for (p of posts; track p.id) {
                <tr>
                  <td style="font-weight:500;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.title }}</td>
                  <td>{{ getCatName(p.categoryId) }}</td>
                  <td style="white-space:nowrap">{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td style="text-align:center">
                    <button
                      style="background:none;border:1px solid #fecaca;border-radius:20px;padding:4px 14px;cursor:pointer;display:inline-flex;align-items:center;gap:6px"
                      (click)="likePost(p)">
                      <i class="fa-solid fa-heart" style="color:#ef4444;font-size:14px"></i>
                      <span style="font-weight:600;color:#ef4444;font-size:13px">{{ getPostLikes(p.id) }}</span>
                    </button>
                  </td>
                  <td style="text-align:center">
                    <span [style]="sensitivityPillStyle(p.violenceSensitivity)">{{ formatSensitivity(p.violenceSensitivity) }}</span>
                  </td>
                  <td style="text-align:center">
                    <span [style]="sensitivityPillStyle(p.spamSensitivity)">{{ formatSensitivity(p.spamSensitivity) }}</span>
                  </td>
                  <td>
                    <button style="background:none;border:none;color:#ef4444;cursor:pointer" (click)="deletePost(p.id)"><i class="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Comments Tab (with Like/Dislike, Popular, Ban) -->
      @if (activeTab === 'comments') {
        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px">
          <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:#16a34a">{{ activeCommentCount }}</div>
            <div style="font-size:12px;color:#64748b">Actifs</div>
          </div>
          <div style="background:#fef2f2;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:#ef4444">{{ bannedCount }}</div>
            <div style="font-size:12px;color:#64748b">Bannis</div>
          </div>
          <div style="background:#fffbeb;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:#f59e0b">{{ popularCount }}</div>
            <div style="font-size:12px;color:#64748b">Populaires</div>
          </div>
          <div style="background:#eff6ff;border-radius:12px;padding:16px;text-align:center">
            <div style="font-size:24px;font-weight:700;color:#3b82f6">{{ allComments.length }}</div>
            <div style="font-size:12px;color:#64748b">Total</div>
          </div>
        </div>

        <div class="card-alzcare" style="padding:0;overflow:hidden">
          <table class="table-alzcare">
            <thead>
              <tr>
                <th>Contenu</th>
                <th>Post</th>
                <th>Date</th>
                <th style="text-align:center">👍 Like</th>
                <th style="text-align:center">👎 Dislike</th>
                <th style="text-align:center">Violence</th>
                <th style="text-align:center">Spam</th>
                <th style="text-align:center">Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of activeComments; track c.id) {
                <tr [style.background]="c.popular ? '#fffbeb' : ''">
                  <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    @if (c.popular) {
                      <i class="fa-solid fa-star" style="color:#f59e0b;margin-right:4px" title="Commentaire populaire"></i>
                    }
                    {{ c.content }}
                  </td>
                  <td>{{ c.postId }}</td>
                  <td style="white-space:nowrap">{{ c.createdAt | date:'dd/MM HH:mm' }}</td>
                  <td style="text-align:center">
                    <button
                      style="background:none;border:1px solid #bbf7d0;border-radius:16px;padding:3px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px"
                      (click)="likeComment(c)">
                      <i class="fa-solid fa-thumbs-up" style="color:#16a34a;font-size:13px"></i>
                      <span style="font-weight:600;color:#16a34a;font-size:12px">{{ c.likes || 0 }}</span>
                    </button>
                  </td>
                  <td style="text-align:center">
                    <button
                      style="background:none;border:1px solid #fecaca;border-radius:16px;padding:3px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px"
                      (click)="dislikeComment(c)">
                      <i class="fa-solid fa-thumbs-down" style="color:#ef4444;font-size:13px"></i>
                      <span style="font-weight:600;color:#ef4444;font-size:12px">{{ c.dislikes || 0 }}</span>
                    </button>
                    @if ((c.dislikes || 0) >= 7 && (c.dislikes || 0) < 10) {
                      <div style="font-size:10px;color:#f59e0b;margin-top:2px">⚠️ {{ 10 - (c.dislikes || 0) }} avant ban</div>
                    }
                  </td>
                  <td style="text-align:center">
                    <span [style]="sensitivityPillStyle(c.violenceSensitivity)">{{ formatSensitivity(c.violenceSensitivity) }}</span>
                  </td>
                  <td style="text-align:center">
                    <span [style]="sensitivityPillStyle(c.spamSensitivity)">{{ formatSensitivity(c.spamSensitivity) }}</span>
                  </td>
                  <td style="text-align:center">
                    @if (c.popular) {
                      <span style="background:#fef3c7;color:#b45309;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600">
                        ⭐ Populaire
                      </span>
                    } @else {
                      <span style="background:#dcfce7;color:#16a34a;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600">
                        Actif
                      </span>
                    }
                  </td>
                  <td>
                    <div style="display:flex;gap:6px;align-items:center">
                      <!-- Toggle Popular -->
                      <button
                        style="background:none;border:none;cursor:pointer;font-size:16px"
                        [style.color]="c.popular ? '#f59e0b' : '#cbd5e1'"
                        [title]="c.popular ? 'Retirer populaire' : 'Marquer populaire'"
                        (click)="togglePopular(c)">
                        <i class="fa-solid fa-star"></i>
                      </button>
                      <!-- Ban -->
                      <button
                        style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:14px"
                        title="Bannir ce commentaire"
                        (click)="banComment(c)">
                        <i class="fa-solid fa-ban"></i>
                      </button>
                      <!-- Delete -->
                      <button style="background:none;border:none;color:#ef4444;cursor:pointer" (click)="deleteForumComment(c.id)">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (activeComments.length === 0) {
                <tr><td colspan="9" style="text-align:center;padding:32px;color:#94a3b8">Aucun commentaire actif</td></tr>
              }
            </tbody>
          </table>
        </div>
        <div style="margin-top:8px;font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:6px">
          <i class="fa-solid fa-circle-info"></i>
          Les commentaires avec ≥10 dislikes sont automatiquement bannis
        </div>
      }

      <!-- BANNED Tab -->
      @if (activeTab === 'banned') {
        <div style="margin-bottom:16px">
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px">
            <i class="fa-solid fa-ban" style="color:#ef4444;font-size:24px"></i>
            <div>
              <div style="font-weight:600;color:#991b1b">{{ bannedCount }} commentaire(s) banni(s)</div>
              <div style="font-size:13px;color:#b91c1c">Commentaires bannis automatiquement (≥10 dislikes) ou manuellement</div>
            </div>
          </div>
        </div>
        <div class="card-alzcare" style="padding:0;overflow:hidden">
          <table class="table-alzcare">
            <thead>
              <tr>
                <th>Contenu</th>
                <th>Post</th>
                <th style="text-align:center">Dislikes</th>
                <th style="text-align:center">Raison</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of bannedComments; track c.id) {
                <tr style="background:#fef2f2">
                  <td style="max-width:350px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-decoration:line-through;color:#94a3b8">
                    {{ c.content }}
                  </td>
                  <td>{{ c.postId }}</td>
                  <td style="text-align:center">
                    <span style="background:#fecaca;color:#ef4444;padding:2px 10px;border-radius:10px;font-size:12px;font-weight:600">
                      👎 {{ c.dislikes || 0 }}
                    </span>
                  </td>
                  <td style="text-align:center">
                    <span style="background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600">
                      {{ (c.dislikes || 0) >= 10 ? 'Auto-ban' : 'Manuel' }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;gap:8px">
                      <button
                        style="background:none;border:1px solid #bbf7d0;border-radius:6px;padding:4px 12px;cursor:pointer;color:#16a34a;font-size:12px;font-weight:500"
                        (click)="unbanComment(c)"
                        title="Débannir ce commentaire">
                        <i class="fa-solid fa-rotate-left"></i> Débannir
                      </button>
                      <button style="background:none;border:none;color:#ef4444;cursor:pointer" (click)="deleteForumComment(c.id)">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
              @if (bannedComments.length === 0) {
                <tr><td colspan="5" style="text-align:center;padding:32px;color:#94a3b8">
                  <i class="fa-solid fa-check-circle" style="color:#16a34a;font-size:24px;display:block;margin-bottom:8px"></i>
                  Aucun commentaire banni
                </td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Category Form Modal -->
      @if (showCatForm) {
        <div class="modal-overlay" (click)="showCatForm=false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">{{ editingCat ? 'Modifier' : 'Nouvelle' }} catégorie</h2>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input class="form-input" [(ngModel)]="catForm.name">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-input" [(ngModel)]="catForm.description"></textarea>
            </div>
            <div style="display:flex;gap:12px;margin-top:16px">
              <button class="btn-primary-alz" (click)="saveCat()">{{ editingCat ? 'Modifier' : 'Créer' }}</button>
              <button class="btn-secondary-alz" (click)="showCatForm=false">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ForumAdminPage implements OnInit {
  tabs = [
    { key: 'categories', label: 'Catégories' },
    { key: 'posts', label: 'Publications' },
    { key: 'comments', label: 'Commentaires' },
    { key: 'banned', label: '🚫 Bannis' }
  ];
  activeTab = 'categories';
  categories: any[] = [];
  posts: any[] = [];
  allComments: any[] = [];
  showCatForm = false;
  editingCat = false;
  editCatId = 0;
  catForm = { name: '', description: '' };

  constructor(private forumService: ForumIntegrationService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.forumService.getAllCategories().subscribe(c => this.categories = c);
    this.forumService.getAllPosts().subscribe(p => this.posts = p);
    this.forumService.getAllComments().subscribe(comments => {
      this.allComments = comments.map(c => ({
        ...c,
        likes: this.forumService.getCommentLikes(c.id),
        dislikes: this.forumService.getCommentDislikes(c.id),
        banned: this.forumService.isCommentBanned(c.id),
        popular: this.forumService.isCommentPopular(c.id)
      }));
    });
  }

  // ===== Categories =====
  getCatName(catId: number): string {
    return this.categories.find(c => c.id === catId)?.name || '-';
  }

  openCatForm(cat?: any): void {
    if (cat) {
      this.editingCat = true;
      this.editCatId = cat.id;
      this.catForm = { name: cat.name, description: cat.description };
    } else {
      this.editingCat = false;
      this.catForm = { name: '', description: '' };
    }
    this.showCatForm = true;
  }

  saveCat(): void {
    if (this.editingCat) {
      this.forumService.updateCategory(this.editCatId, this.catForm).subscribe(() => { this.showCatForm = false; this.loadAll(); });
    } else {
      this.forumService.createCategory(this.catForm).subscribe(() => { this.showCatForm = false; this.loadAll(); });
    }
  }

  deleteCat(id: number): void {
    if (!confirm('Supprimer cette catégorie ?')) return;
    this.forumService.deleteCategory(id).subscribe(() => this.loadAll());
  }

  // ===== Posts =====
  deletePost(id: number): void {
    if (!confirm('Supprimer cette publication ?')) return;
    this.forumService.deletePost(id).subscribe(() => this.loadAll());
  }

  likePost(post: any): void {
    this.forumService.likePost(post.id);
  }

  getPostLikes(postId: number): number {
    return this.forumService.getPostLikes(postId);
  }

  formatSensitivity(score?: number): string {
    return `${score ?? 0}%`;
  }

  sensitivityPillStyle(score?: number): string {
    const value = score ?? 0;

    if (value >= 70) {
      return 'background:#fee2e2;color:#b91c1c;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600';
    }

    if (value >= 40) {
      return 'background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600';
    }

    return 'background:#dcfce7;color:#166534;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600';
  }

  // ===== Comments =====
  get activeComments(): any[] {
    return this.allComments.filter(c => !c.banned);
  }

  get bannedComments(): any[] {
    return this.allComments.filter(c => c.banned);
  }

  get bannedCount(): number {
    return this.allComments.filter(c => c.banned).length;
  }

  get activeCommentCount(): number {
    return this.allComments.filter(c => !c.banned).length;
  }

  get popularCount(): number {
    return this.allComments.filter(c => c.popular && !c.banned).length;
  }

  likeComment(comment: any): void {
    const newCount = this.forumService.likeComment(comment.id);
    comment.likes = newCount;
  }

  dislikeComment(comment: any): void {
    const newCount = this.forumService.dislikeComment(comment.id);
    comment.dislikes = newCount;
    // Auto-ban at ≥10
    if (newCount >= 10) {
      comment.banned = true;
    }
  }

  togglePopular(comment: any): void {
    const isNow = this.forumService.togglePopular(comment.id);
    comment.popular = isNow;
  }

  banComment(comment: any): void {
    this.forumService.banComment(comment.id);
    comment.banned = true;
  }

  unbanComment(comment: any): void {
    this.forumService.unbanComment(comment.id);
    comment.banned = false;
  }

  deleteForumComment(id: number): void {
    if (!confirm('Supprimer ce commentaire ?')) return;
    this.forumService.deleteComment(id).subscribe(() => this.loadAll());
  }
}
