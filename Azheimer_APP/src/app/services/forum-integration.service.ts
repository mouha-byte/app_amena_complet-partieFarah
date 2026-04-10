import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface ForumComment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  violenceSensitivity?: number;
  spamSensitivity?: number;
  likes?: number;
  dislikes?: number;
  banned?: boolean;
  popular?: boolean;
  postId?: number;
}

export type Comment = ForumComment;

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  userId: number;
  author?: string;
  createdAt: string;
  categoryId: number;
  categoryName?: string;
  commentCount?: number;
  violenceSensitivity?: number;
  spamSensitivity?: number;
  status?: 'PUBLISHED' | 'DRAFT';
  likes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ForumIntegrationService {
  private readonly apiUrl = 'http://localhost:8088/api';

  private readonly postLikesKey = 'forum_post_likes';
  private readonly commentLikesKey = 'forum_comment_likes';
  private readonly commentDislikesKey = 'forum_comment_dislikes';
  private readonly commentBannedKey = 'forum_comment_banned';
  private readonly commentPopularKey = 'forum_comment_popular';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<ForumCategory[]> {
    return this.http.get<ForumCategory[]>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: number): Observable<ForumCategory> {
    return this.http.get<ForumCategory>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: { name: string; description?: string }): Observable<ForumCategory> {
    return this.http.post<ForumCategory>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: { name: string; description?: string }): Observable<ForumCategory> {
    return this.http.put<ForumCategory>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  getAllPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.apiUrl}/posts`);
  }

  getPostById(id: number): Observable<ForumPost> {
    return this.http.get<ForumPost>(`${this.apiUrl}/posts/${id}`);
  }

  getPostsByCategory(categoryId: number): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.apiUrl}/posts/category/${categoryId}`);
  }

  createPost(post: { title: string; content: string; userId: number }, categoryId: number): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.apiUrl}/posts/category/${categoryId}`, post);
  }

  updatePost(id: number, post: { title?: string; content?: string; userId?: number }): Observable<ForumPost> {
    return this.http.put<ForumPost>(`${this.apiUrl}/posts/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`);
  }

  getAllComments(): Observable<ForumComment[]> {
    return this.http.get<ForumComment[]>(`${this.apiUrl}/comments`);
  }

  addComment(comment: Omit<ForumComment, 'id' | 'createdAt'>, postId: number): Observable<ForumComment> {
    return this.http.post<ForumComment>(`${this.apiUrl}/comments/post/${postId}`, comment);
  }

  getCommentsByPostId(postId: number): Observable<ForumComment[]> {
    return this.http.get<ForumComment[]>(`${this.apiUrl}/comments/post/${postId}`);
  }

  updateComment(id: number, comment: { content: string }): Observable<ForumComment> {
    return this.http.put<ForumComment>(`${this.apiUrl}/comments/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`);
  }

  getPostLikes(postId: number): number {
    return this.getStorageMap(this.postLikesKey)[postId] || 0;
  }

  likePost(postId: number): number {
    const map = this.getStorageMap(this.postLikesKey);
    map[postId] = (map[postId] || 0) + 1;
    this.setStorageMap(this.postLikesKey, map);
    return map[postId];
  }

  getCommentLikes(commentId: number): number {
    return this.getStorageMap(this.commentLikesKey)[commentId] || 0;
  }

  likeComment(commentId: number): number {
    const map = this.getStorageMap(this.commentLikesKey);
    map[commentId] = (map[commentId] || 0) + 1;
    this.setStorageMap(this.commentLikesKey, map);
    return map[commentId];
  }

  getCommentDislikes(commentId: number): number {
    return this.getStorageMap(this.commentDislikesKey)[commentId] || 0;
  }

  dislikeComment(commentId: number): number {
    const map = this.getStorageMap(this.commentDislikesKey);
    map[commentId] = (map[commentId] || 0) + 1;
    this.setStorageMap(this.commentDislikesKey, map);
    const count = map[commentId];
    if (count >= 10) {
      this.banComment(commentId);
    }
    return count;
  }

  isCommentBanned(commentId: number): boolean {
    return this.getStorageSet(this.commentBannedKey).includes(commentId);
  }

  banComment(commentId: number): void {
    const set = this.getStorageSet(this.commentBannedKey);
    if (!set.includes(commentId)) {
      set.push(commentId);
      this.setStorageSet(this.commentBannedKey, set);
    }
  }

  unbanComment(commentId: number): void {
    const set = this.getStorageSet(this.commentBannedKey).filter((id) => id !== commentId);
    this.setStorageSet(this.commentBannedKey, set);
  }

  isCommentPopular(commentId: number): boolean {
    return this.getStorageSet(this.commentPopularKey).includes(commentId);
  }

  togglePopular(commentId: number): boolean {
    const set = this.getStorageSet(this.commentPopularKey);
    const index = set.indexOf(commentId);
    if (index >= 0) {
      set.splice(index, 1);
      this.setStorageSet(this.commentPopularKey, set);
      return false;
    }
    set.push(commentId);
    this.setStorageSet(this.commentPopularKey, set);
    return true;
  }

  private getStorageMap(key: string): Record<number, number> {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}') as Record<number, number>;
    } catch {
      return {};
    }
  }

  private setStorageMap(key: string, map: Record<number, number>): void {
    localStorage.setItem(key, JSON.stringify(map));
  }

  private getStorageSet(key: string): number[] {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]') as number[];
    } catch {
      return [];
    }
  }

  private setStorageSet(key: string, values: number[]): void {
    localStorage.setItem(key, JSON.stringify(values));
  }
}
