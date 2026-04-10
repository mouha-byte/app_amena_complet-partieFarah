import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ForumService, Category } from '../../../core/services/forum.service';

@Component({
  selector: 'app-forum-home',
  templateUrl: './forum-home.html',
  styleUrls: ['./forum-home.component.css'],
  standalone: false
})
export class ForumHomeComponent implements OnInit {
  categories: Category[] = [];
  postCounts: number[] = [];
  memberCounts: number[] = [];
  loading: boolean = false;
  totalMembers: number = 1234;
  totalDiscussions: number = 567;

  constructor(
    private forumService: ForumService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.forumService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded in ForumHome:', categories);
        this.categories = categories; // Show all categories from backend
        this.initializeCounts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initializeCounts(): void {
    // Stable counts to avoid NG0100
    this.postCounts = this.categories.map(() => Math.floor(Math.random() * 50) + 10);
    this.memberCounts = this.categories.map(() => Math.floor(Math.random() * 100) + 20);
  }

  getPostCount(i: number): number {
    return this.postCounts[i] || 0;
  }

  getMemberCount(i: number): number {
    return this.memberCounts[i] || 0;
  }

  navigateToCategory(cat: Category): void {
    if (cat && cat.id) {
      this.router.navigate(['/forum/category', cat.id]);
    }
  }

  getCategoryIcon(i: number): string {
    const icons = [
      'ri-heart-pulse-line',
      'ri-microscope-line',
      'ri-discuss-line',
      'ri-newspaper-line',
      'ri-folder-line',
      'ri-question-line',
      'ri-mental-health-line',
      'ri-capsule-line'
    ];
    return icons[i % icons.length];
  }

  getCategoryGradient(i: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    return gradients[i % gradients.length];
  }
}
