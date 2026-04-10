import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <div>
          <h1 style="font-size:24px;font-weight:700">Gestion des utilisateurs</h1>
          <p style="color:#64748b;font-size:14px">{{ users.length }} utilisateur(s) enregistré(s)</p>
        </div>
        <input class="form-input" style="width:250px" [(ngModel)]="search" placeholder="Rechercher..." (input)="filter()">
      </div>

      <div class="card-alzcare" style="padding:0;overflow-x:auto">
        <table class="table-alzcare">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Aidant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filtered; track u.userId) {
              <tr>
                <td>{{ u.userId }}</td>
                <td style="font-weight:500">{{ u.firstName }} {{ u.lastName }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.phone || '-' }}</td>
                <td><span class="badge-alz" [style]="getRoleBadge(u.role)">{{ getRoleLabel(u.role) }}</span></td>
                <td>
                  @if (u.role === 'PATIENT') {
                    {{ getCaregiverName(u.caregiverId!) }}
                  } @else {
                    -
                  }
                </td>
                <td>
                  @if (u.role === 'PATIENT') {
                    <button style="background:none;border:none;color:#3b82f6;cursor:pointer;font-size:13px" (click)="openAssign(u)">
                      <i class="fa-solid fa-user-plus"></i> Assigner
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Assign caregiver modal -->
      @if (assignUser) {
        <div class="modal-overlay" (click)="assignUser=null">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2 style="font-size:18px;font-weight:700;margin-bottom:20px">Assigner un aidant</h2>
            <p style="margin-bottom:16px;color:#64748b">Patient : <strong>{{ assignUser.firstName }} {{ assignUser.lastName }}</strong></p>
            <div class="form-group">
              <label class="form-label">Aidant</label>
              <select class="form-select" [(ngModel)]="selectedCaregiverId">
                <option [ngValue]="null">-- Aucun --</option>
                @for (c of caregivers; track c.userId) {
                  <option [ngValue]="c.userId">{{ c.firstName }} {{ c.lastName }}</option>
                }
              </select>
            </div>
            <div style="display:flex;gap:12px;margin-top:16px">
              <button class="btn-primary-alz" (click)="saveAssign()">Enregistrer</button>
              <button class="btn-secondary-alz" (click)="assignUser=null">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersPage implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  caregivers: User[] = [];
  search = '';
  assignUser: User | null = null;
  selectedCaregiverId: number | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getAllUsers().subscribe(list => {
      this.users = list;
      this.caregivers = list.filter(u => u.role === 'CAREGIVER');
      this.filter();
    });
  }

  filter(): void {
    const s = this.search.toLowerCase();
    this.filtered = this.users.filter(u =>
      !s || `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s)
    );
  }

  openAssign(u: User): void {
    this.assignUser = u;
    this.selectedCaregiverId = u.caregiverId ?? null;
  }

  saveAssign(): void {
    if (!this.assignUser) return;
    this.authService.updateUser(this.assignUser.userId, { caregiverId: this.selectedCaregiverId }).subscribe(() => {
      this.assignUser!.caregiverId = this.selectedCaregiverId ?? undefined;
      this.assignUser = null;
    });
  }

  getCaregiverName(id?: number): string {
    if (!id) return 'Non assigné';
    const c = this.users.find(u => u.userId === id);
    return c ? `${c.firstName} ${c.lastName}` : `#${id}`;
  }

  getRoleLabel(role: string): string {
    const m: Record<string, string> = { ADMIN: 'Admin', DOCTOR: 'Médecin', CAREGIVER: 'Aidant', PATIENT: 'Patient', VOLUNTEER: 'Bénévole' };
    return m[role] || role;
  }

  getRoleBadge(role: string): string {
    const m: Record<string, string> = { ADMIN: 'background:#dbeafe;color:#1d4ed8', DOCTOR: 'background:#d1fae5;color:#059669', CAREGIVER: 'background:#fef3c7;color:#b45309', PATIENT: 'background:#ede9fe;color:#7c3aed', VOLUNTEER: 'background:#f1f5f9;color:#64748b' };
    return m[role] || 'background:#f1f5f9;color:#64748b';
  }
}
