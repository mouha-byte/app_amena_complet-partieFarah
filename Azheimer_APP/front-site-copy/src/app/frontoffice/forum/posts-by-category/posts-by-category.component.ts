import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService, Post, Category } from '../../../core/services/forum.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-posts-by-category',
  templateUrl: './posts-by-category.component.html',
  styleUrls: ['./posts-by-category.component.css'],
  standalone: false
})
export class PostsByCategoryComponent implements OnInit {
  posts: Post[] = [];
  category: Category | null = null;
  categoryId: number | null = null;
  loading: boolean = false;

  constructor(
    private forumService: ForumService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('PostsByCategoryComponent - Route ID:', id);
      if (id) {
        this.categoryId = parseInt(id);
        if (!isNaN(this.categoryId)) {
          this.loadCategoryAndPosts();
        } else {
          console.error('Invalid category ID:', id);
          this.router.navigate(['/forum']);
        }
      }
    });
  }

  loadCategoryAndPosts(): void {
    if (!this.categoryId) return;

    this.loading = true;

    console.log('Loading data for category ID:', this.categoryId);

    // catchError on each so a failing category lookup never blocks posts
    const category$ = this.forumService.getCategoryById(this.categoryId).pipe(
      catchError(() => of(null))
    );
    const posts$ = this.forumService.getPostsByCategory(this.categoryId).pipe(
      catchError(() => of([] as Post[]))
    );

    forkJoin({
      category: category$,
      posts: posts$
    }).subscribe({
      next: (result) => {
        console.log('Results loaded:', result);
        this.category = result.category;
        this.posts = result.posts;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error in forkJoin loading category data:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToPost(post: Post): void {
    this.router.navigate(['/forum/post', post.id]);
  }

  navigateBack(): void {
    console.log('Navigating back to forum home');
    this.router.navigate(['/forum']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Unkown Date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  getCategoryGradient(categoryName: string): string {
    const gradients: { [key: string]: string } = {
      'Support': 'linear-gradient(135deg, #60A5FA, #3B82F6)',
      'Research': 'linear-gradient(135deg, #34D399, #10B981)',
      'Discussion': 'linear-gradient(135deg, #A78BFA, #8B5CF6)',
      'News': 'linear-gradient(135deg, #F472B6, #EC4899)',
      'General': 'linear-gradient(135deg, #7DD3FC, #06B6D4)'
    };
    return gradients[categoryName] || 'linear-gradient(135deg, #f472b6, #fb923c)';
  }
}
