import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ForumService, Comment } from '../../../core/services/forum.service';

@Component({
    selector: 'app-comment-list',
    templateUrl: './comment-list.html',
    styleUrls: ['./comment-list.css'],
    standalone: false
})
export class CommentList implements OnInit {
    comments: Comment[] = [];
    loading: boolean = false;
    error: string | null = null;
    activeTab: 'all' | 'banned' = 'all';

    constructor(private forumService: ForumService, private route: ActivatedRoute) { }

    ngOnInit(): void {
        const tabFromRoute = this.route.snapshot.data['tab'];
        if (tabFromRoute === 'banned') {
            this.activeTab = 'banned';
        }
        this.loadComments();
    }

    loadComments(): void {
        this.loading = true;
        this.error = null;

        console.log('[CommentList] Requesting all comments from Forum Service...');
        this.forumService.getAllComments().subscribe({
            next: (comments: Comment[]) => {
                console.log('[CommentList] Success:', comments.length, 'comments found.');
                // Enrich with local like/dislike/banned/popular state
                this.comments = comments.map(c => ({
                    ...c,
                    likes: this.forumService.getCommentLikes(c.id),
                    dislikes: this.forumService.getCommentDislikes(c.id),
                    banned: this.forumService.isCommentBanned(c.id),
                    popular: this.forumService.isCommentPopular(c.id)
                }));
                this.loading = false;
            },
            error: (err: any) => {
                console.error('[CommentList] Fatal Error:', err);
                this.error = `Connection failed. Make sure the Forum Service (Port 8085) is running. (${err.message})`;
                this.loading = false;
            }
        });
    }

    get displayedComments(): Comment[] {
        if (this.activeTab === 'banned') {
            return this.comments.filter(c => c.banned);
        }
        return this.comments.filter(c => !c.banned);
    }

    get bannedCount(): number {
        return this.comments.filter(c => c.banned).length;
    }

    get activeCount(): number {
        return this.comments.filter(c => !c.banned).length;
    }

    get popularCount(): number {
        return this.comments.filter(c => c.popular).length;
    }

    likeComment(comment: Comment): void {
        const newCount = this.forumService.likeComment(comment.id);
        comment.likes = newCount;
    }

    dislikeComment(comment: Comment): void {
        const newCount = this.forumService.dislikeComment(comment.id);
        comment.dislikes = newCount;
        // Check auto-ban
        if (newCount >= 10) {
            comment.banned = true;
        }
    }

    togglePopular(comment: Comment): void {
        const isNowPopular = this.forumService.togglePopular(comment.id);
        comment.popular = isNowPopular;
    }

    unbanComment(comment: Comment): void {
        this.forumService.unbanComment(comment.id);
        comment.banned = false;
    }

    banComment(comment: Comment): void {
        this.forumService.banComment(comment.id);
        comment.banned = true;
    }

    deleteComment(id: number): void {
        if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;

        this.forumService.deleteComment(id).subscribe({
            next: () => {
                this.comments = this.comments.filter(c => c.id !== id);
            },
            error: (err: any) => {
                console.error('Error deleting comment:', err);
            }
        });
    }

    formatDate(date: string): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }
}
