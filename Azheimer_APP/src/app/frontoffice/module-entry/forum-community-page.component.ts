import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumPage } from '../../backoffice/forum-full/forum-page';
import { ForumPostsPage } from '../../backoffice/forum-full/forum-posts-page';
import { ForumPostDetailPage } from '../../backoffice/forum-full/forum-post-detail-page';

@Component({
  selector: 'app-forum-community-page',
  standalone: true,
  imports: [CommonModule, ForumPage, ForumPostsPage, ForumPostDetailPage],
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        padding: 110px 0 48px;
        background: #f8fafc;
      }

      .community-container {
        width: min(1100px, calc(100% - 32px));
        margin: 0 auto;
      }

      .community-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
      }

      @media (max-width: 768px) {
        :host {
          padding: 94px 0 28px;
        }

        .community-card {
          padding: 16px;
          border-radius: 12px;
        }
      }
    `
  ],
  template: `
    <section class="community-container">
      <div class="community-card">
        @if (view === 'categories') {
          <app-forum-page (categorySelected)="onCategorySelected($event)"></app-forum-page>
        }

        @if (view === 'posts') {
          <app-forum-posts
            [categoryId]="selectedCategoryId"
            (back)="backToCategories()"
            (openPost)="onPostSelected($event)">
          </app-forum-posts>
        }

        @if (view === 'detail') {
          <app-forum-post-detail
            [postId]="selectedPostId"
            (back)="backToPosts()">
          </app-forum-post-detail>
        }
      </div>
    </section>
  `
})
export class ForumCommunityPageComponent {
  view: 'categories' | 'posts' | 'detail' = 'categories';
  selectedCategoryId = 0;
  selectedPostId = 0;

  onCategorySelected(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.selectedPostId = 0;
    this.view = 'posts';
  }

  onPostSelected(postId: number): void {
    this.selectedPostId = postId;
    this.view = 'detail';
  }

  backToCategories(): void {
    this.selectedCategoryId = 0;
    this.selectedPostId = 0;
    this.view = 'categories';
  }

  backToPosts(): void {
    this.selectedPostId = 0;
    this.view = 'posts';
  }
}
