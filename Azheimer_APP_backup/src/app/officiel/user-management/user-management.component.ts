import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-off-user-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['../quiz-management/quiz-management.component.css', './user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loading = true;
  showForm = false;
  editing = false;
  msg = '';
  msgType = '';
  private api = 'http://localhost:8086/users';

  form: any = this.emptyForm();

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  emptyForm() {
    return { id: null, firstname: '', lastname: '', email: '', password: '', phone: '', role: 'PATIENT' };
  }

  load() {
    this.loading = true;
    this.http.get<any[]>(this.api).subscribe({
      next: (d) => { this.users = d || []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.showMsg('Erreur de chargement', 'error'); this.cdr.detectChanges(); }
    });
  }

  openCreate() { this.form = this.emptyForm(); this.editing = false; this.showForm = true; }

  openEdit(u: any) {
    this.form = { ...u, password: '' };
    this.editing = true;
    this.showForm = true;
  }

  save() {
    if (this.editing) {
      const data = { ...this.form };
      if (!data.password) delete data.password;
      this.http.put(`${this.api}/${data.id}`, data).subscribe({
        next: () => { this.showMsg('Utilisateur mis à jour ✅', 'success'); this.showForm = false; this.load(); this.cdr.detectChanges(); },
        error: (e) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    } else {
      this.http.post('http://localhost:8086/auth/register', this.form).subscribe({
        next: () => { this.showMsg('Utilisateur créé ✅', 'success'); this.showForm = false; this.load(); this.cdr.detectChanges(); },
        error: (e) => { this.showMsg('Erreur: ' + (e.error?.message || e.message), 'error'); this.cdr.detectChanges(); }
      });
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.http.delete(`${this.api}/${id}`).subscribe({
      next: () => { this.showMsg('Supprimé ✅', 'success'); this.load(); this.cdr.detectChanges(); },
      error: () => { this.showMsg('Erreur suppression', 'error'); this.cdr.detectChanges(); }
    });
  }

  showMsg(m: string, t: string) {
    this.msg = m; this.msgType = t;
    setTimeout(() => this.msg = '', 4000);
  }

  getRoleBadge(r: string) {
    return { ADMIN: '🛡️', DOCTOR: '🩺', PATIENT: '🧠', CAREGIVER: '🤝' }[r] || '👤';
  }

  getRoleClass(r: string) {
    return { ADMIN: 'role-admin', DOCTOR: 'role-doctor', PATIENT: 'role-patient', CAREGIVER: 'role-care' }[r] || '';
  }
}
