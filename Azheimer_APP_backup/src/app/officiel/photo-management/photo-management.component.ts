import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-off-photo-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './photo-management.component.html',
  styleUrls: ['../quiz-management/quiz-management.component.css', './photo-management.component.css']
})
export class PhotoManagementComponent implements OnInit {
  photos: any[] = [];
  loading = true;
  showForm = false;
  editing = false;
  msg = '';
  msgType = '';
  private api = 'http://localhost:8085/api/photo-activities';

  form: any = this.emptyForm();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  emptyForm() {
    return { id: null, title: '', description: '', difficulty: 'EASY', imageUrl: '', correctAnswer: '', options: ['', '', '', ''] };
  }

  load() {
    this.loading = true;
    this.http.get<any[]>(this.api).subscribe({
      next: (d) => { this.photos = d || []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.showMsg('Erreur de chargement', 'error'); this.cdr.detectChanges(); }
    });
  }

  openCreate() { this.form = this.emptyForm(); this.editing = false; this.showForm = true; }

  openEdit(p: any) {
    this.form = JSON.parse(JSON.stringify(p));
    if (!this.form.options?.length) this.form.options = ['', '', '', ''];
    while (this.form.options.length < 4) this.form.options.push('');
    this.editing = true;
    this.showForm = true;
  }

  save() {
    if (this.editing) {
      this.http.put(`${this.api}/${this.form.id}`, this.form).subscribe({
        next: () => { this.showMsg('Photo mise à jour ✅', 'success'); this.showForm = false; this.load(); this.cdr.detectChanges(); },
        error: (e) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    } else {
      this.http.post(this.api, this.form).subscribe({
        next: () => { this.showMsg('Photo créée ✅', 'success'); this.showForm = false; this.load(); this.cdr.detectChanges(); },
        error: (e) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer cette activité photo ?')) return;
    this.http.delete(`${this.api}/${id}`).subscribe({
      next: () => { this.showMsg('Supprimé ✅', 'success'); this.load(); this.cdr.detectChanges(); },
      error: () => { this.showMsg('Erreur suppression', 'error'); this.cdr.detectChanges(); }
    });
  }

  showMsg(m: string, t: string) {
    this.msg = m; this.msgType = t;
    setTimeout(() => this.msg = '', 4000);
  }

  trackByIdx(i: number) { return i; }
}
