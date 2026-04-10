import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumIntegrationService } from '../../services/forum-integration.service';

@Component({
  selector: 'app-forum-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 style="font-size:24px;font-weight:700;margin-bottom:4px">Forum communautaire</h1>
      <p style="color:#64748b;font-size:14px;margin-bottom:24px">Échangez avec la communauté AlzCare</p>

      @if (loading) {
        <div style="text-align:center;padding:48px"><div class="spinner" style="margin:0 auto"></div></div>
      } @else {
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
          @for (cat of categories; track cat.id) {
            <button type="button" (click)="openCategory(cat.id)" style="text-decoration:none;color:inherit;background:none;border:none;padding:0;text-align:left;width:100%">
              <div class="card-alzcare" style="cursor:pointer;height:100%">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                  <div style="width:44px;height:44px;background:#eff6ff;border-radius:10px;display:flex;align-items:center;justify-content:center">
                    <i class="fa-solid fa-folder" style="color:#3b82f6;font-size:18px"></i>
                  </div>
                  <h3 style="font-size:16px;font-weight:600">{{ cat.name }}</h3>
                </div>
                <p style="font-size:14px;color:#64748b;line-height:1.5">{{ cat.description || 'Discussion générale' }}</p>
              </div>
            </button>
          }
        </div>

        @if (categories.length === 0) {
          <div class="card-alzcare" style="text-align:center;padding:48px">
            <i class="fa-solid fa-comments" style="font-size:48px;color:#cbd5e1;margin-bottom:16px"></i>
            <p style="color:#64748b">Aucune catégorie disponible</p>
          </div>
        }
      }
    </div>
  `
})
export class ForumPage implements OnInit {
  @Output() categorySelected = new EventEmitter<number>();

  categories: any[] = [];
  loading = true;

  constructor(private forumService: ForumIntegrationService) {}

  ngOnInit(): void {
    this.forumService.getAllCategories().subscribe({
      next: cats => { this.categories = cats; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openCategory(categoryId: number): void {
    this.categorySelected.emit(categoryId);
  }
}
