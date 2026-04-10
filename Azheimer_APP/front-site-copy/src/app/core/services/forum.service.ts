import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  violenceSensitivity?: number;
  spamSensitivity?: number;
  // Local-only fields (managed via localStorage)
  likes?: number;
  dislikes?: number;
  banned?: boolean;
  popular?: boolean;
  postId?: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  userId: number;
  author: string;
  categoryId: number;
  categoryName: string;
  commentCount: number;
  violenceSensitivity?: number;
  spamSensitivity?: number;
  status?: 'PUBLISHED' | 'DRAFT';
  // Local-only fields
  likes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = '/api';

  // localStorage keys
  private POST_LIKES_KEY = 'forum_post_likes';
  private COMMENT_LIKES_KEY = 'forum_comment_likes';
  private COMMENT_DISLIKES_KEY = 'forum_comment_dislikes';
  private COMMENT_BANNED_KEY = 'forum_comment_banned';
  private COMMENT_POPULAR_KEY = 'forum_comment_popular';

  constructor(private http: HttpClient) { }

  // ===== Categories =====
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: { name: string; description?: string }): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: { name: string; description?: string }): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // ===== Posts =====
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`);
  }

  getPostsByCategory(categoryId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts/category/${categoryId}`);
  }

  createPost(post: { title: string; content: string; userId: number }, categoryId: number): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts/category/${categoryId}`, post);
  }

  updatePost(id: number, post: { title?: string; content?: string; userId?: number }): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`);
  }

  // ===== Comments =====
  getAllComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments`);
  }

  addComment(comment: Omit<Comment, 'id' | 'createdAt'>, postId: number): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments/post/${postId}`, comment);
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/post/${postId}`);
  }

  updateComment(id: number, comment: { content: string }): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`);
  }

  // ===== Post Likes (localStorage) =====
  private getStorageMap(key: string): { [id: number]: number } {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch { return {}; }
  }

  private getStorageSet(key: string): number[] {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch { return []; }
  }

  // Post likes
  getPostLikes(postId: number): number {
    return this.getStorageMap(this.POST_LIKES_KEY)[postId] || 0;
  }

  likePost(postId: number): number {
    const map = this.getStorageMap(this.POST_LIKES_KEY);
    map[postId] = (map[postId] || 0) + 1;
    localStorage.setItem(this.POST_LIKES_KEY, JSON.stringify(map));
    return map[postId];
  }

  // Comment likes
  getCommentLikes(commentId: number): number {
    return this.getStorageMap(this.COMMENT_LIKES_KEY)[commentId] || 0;
  }

  likeComment(commentId: number): number {
    const map = this.getStorageMap(this.COMMENT_LIKES_KEY);
    map[commentId] = (map[commentId] || 0) + 1;
    localStorage.setItem(this.COMMENT_LIKES_KEY, JSON.stringify(map));
    return map[commentId];
  }

  // Comment dislikes
  getCommentDislikes(commentId: number): number {
    return this.getStorageMap(this.COMMENT_DISLIKES_KEY)[commentId] || 0;
  }

  dislikeComment(commentId: number): number {
    const map = this.getStorageMap(this.COMMENT_DISLIKES_KEY);
    map[commentId] = (map[commentId] || 0) + 1;
    localStorage.setItem(this.COMMENT_DISLIKES_KEY, JSON.stringify(map));
    const newCount = map[commentId];
    // Auto-ban if dislikes >= 10
    if (newCount >= 10) {
      this.banComment(commentId);
    }
    return newCount;
  }

  // Banned comments
  isCommentBanned(commentId: number): boolean {
    return this.getStorageSet(this.COMMENT_BANNED_KEY).includes(commentId);
  }

  banComment(commentId: number): void {
    const set = this.getStorageSet(this.COMMENT_BANNED_KEY);
    if (!set.includes(commentId)) {
      set.push(commentId);
      localStorage.setItem(this.COMMENT_BANNED_KEY, JSON.stringify(set));
    }
  }

  unbanComment(commentId: number): void {
    let set = this.getStorageSet(this.COMMENT_BANNED_KEY);
    set = set.filter(id => id !== commentId);
    localStorage.setItem(this.COMMENT_BANNED_KEY, JSON.stringify(set));
  }

  getBannedCommentIds(): number[] {
    return this.getStorageSet(this.COMMENT_BANNED_KEY);
  }

  // Popular comments
  isCommentPopular(commentId: number): boolean {
    return this.getStorageSet(this.COMMENT_POPULAR_KEY).includes(commentId);
  }

  togglePopular(commentId: number): boolean {
    const set = this.getStorageSet(this.COMMENT_POPULAR_KEY);
    const idx = set.indexOf(commentId);
    if (idx >= 0) {
      set.splice(idx, 1);
      localStorage.setItem(this.COMMENT_POPULAR_KEY, JSON.stringify(set));
      return false;
    } else {
      set.push(commentId);
      localStorage.setItem(this.COMMENT_POPULAR_KEY, JSON.stringify(set));
      return true;
    }
  }
}
