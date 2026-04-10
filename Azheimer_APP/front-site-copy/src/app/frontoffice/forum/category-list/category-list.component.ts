import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ForumService, Category } from '../../../core/services/forum.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  standalone: false
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading: boolean = false;

  constructor(
    private forumService: ForumService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.forumService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
      }
    });
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/forum/category', category.id]);
  }

  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Support': 'ri-heart-pulse-line',
      'Research': 'ri-microscope-line',
      'Discussion': 'ri-discuss-line',
      'News': 'ri-newspaper-line',
      'General': 'ri-folder-line'
    };
    return icons[categoryName] || 'ri-folder-line';
  }

  getCategoryGradient(categoryName: string): string {
    const gradients: { [key: string]: string } = {
      'Support': 'linear-gradient(135deg, #60A5FA, #3B82F6)',
      'Research': 'linear-gradient(135deg, #34D399, #10B981)',
      'Discussion': 'linear-gradient(135deg, #A78BFA, #8B5CF6)',
      'News': 'linear-gradient(135deg, #F472B6, #EC4899)',
      'General': 'linear-gradient(135deg, #7DD3FC, #06B6D4)'
    };
    return gradients[categoryName] || 'linear-gradient(135deg, #7DD3FC, #06B6D4)';
  }
}
