import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ForumCategory, ForumIntegrationService, ForumPost } from '../../services/forum-integration.service';

@Component({
  selector: 'app-forum-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forum-dashboard.component.html',
  styleUrls: ['./forum-dashboard.component.css']
})
export class ForumDashboardComponent implements OnInit {
  loading = true;
  error = '';

  categories: ForumCategory[] = [];
  posts: ForumPost[] = [];

  constructor(private forumService: ForumIntegrationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      categories: this.forumService.getAllCategories().pipe(catchError(() => of([] as ForumCategory[]))),
      posts: this.forumService.getAllPosts().pipe(catchError(() => of([] as ForumPost[])))
    }).subscribe({
      next: ({ categories, posts }) => {
        this.categories = categories || [];
        this.posts = (posts || []).slice().sort((a, b) => {
          const da = new Date(a.createdAt).getTime();
          const db = new Date(b.createdAt).getTime();
          return db - da;
        });

        if (!this.categories.length && !this.posts.length) {
          this.error = 'Aucune donnee forum chargee. Verifiez forums_service (port 8088) et la base forum_db.';
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le module Forum. Verifiez forums_service (port 8088).';
        this.loading = false;
      }
    });
  }

  get totalComments(): number {
    return this.posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
  }

  get topPosts(): ForumPost[] {
    return this.posts.slice(0, 8);
  }

  countPostsByCategory(categoryId: number): number {
    return this.posts.filter((p) => p.categoryId === categoryId).length;
  }
}
