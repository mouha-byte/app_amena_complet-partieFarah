import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocalizationService, LocalizationUser, OSMPlace, SafeZone } from '../../services/localization.service';

@Component({
  selector: 'app-localization-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './localization-management.component.html',
  styleUrls: ['./localization-management.component.css']
})
export class LocalizationManagementComponent implements OnInit {
  user: any;
  patients: LocalizationUser[] = [];
  zones: SafeZone[] = [];
  filteredZones: SafeZone[] = [];

  selectedPatientFilter: number | 'ALL' = 'ALL';
  editing = false;
  loading = false;
  searching = false;

  locationQuery = '';
  placeResults: OSMPlace[] = [];

  msg = '';
  msgType: 'ok' | 'err' | '' = '';

  form: SafeZone = {
    name: '',
    patientId: 0,
    centerLatitude: 0,
    centerLongitude: 0,
    radius: 150
  };

  constructor(
    private auth: AuthService,
    private localization: LocalizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    if (!this.user) {
      this.router.navigate(['/officiel/login']);
      return;
    }

    if (!this.canManage) {
      this.showMsg("Acces reserve aux roles ADMIN et DOCTOR.", 'err');
      return;
    }

    this.loadAll();
  }

  get canManage(): boolean {
    const role = this.user?.role;
    return role === 'ADMIN' || role === 'DOCTOR';
  }

  loadAll(): void {
    this.loading = true;

    this.localization.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients || [];
        if (this.patients.length && !this.form.patientId) {
          this.form.patientId = this.patients[0].id;
        }
      },
      error: () => this.showMsg('Erreur lors du chargement des patients.', 'err')
    });

    this.localization.getSafeZones().subscribe({
      next: (zones) => {
        this.zones = zones || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.showMsg('Erreur lors du chargement des localisations.', 'err');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.selectedPatientFilter === 'ALL') {
      this.filteredZones = [...this.zones];
      return;
    }
    this.filteredZones = this.zones.filter(z => z.patientId === this.selectedPatientFilter);
  }

  resetForm(): void {
    this.editing = false;
    this.locationQuery = '';
    this.placeResults = [];
    this.form = {
      name: '',
      patientId: this.patients[0]?.id || 0,
      centerLatitude: 0,
      centerLongitude: 0,
      radius: 150
    };
  }

  editZone(zone: SafeZone): void {
    this.editing = true;
    this.form = { ...zone };
  }

  saveZone(): void {
    if (!this.form.patientId || !this.form.name?.trim()) {
      this.showMsg('Veuillez remplir le nom et le patient.', 'err');
      return;
    }

    const payload: SafeZone = {
      ...this.form,
      radius: Number(this.form.radius),
      centerLatitude: Number(this.form.centerLatitude),
      centerLongitude: Number(this.form.centerLongitude)
    };

    if (this.editing && payload.id) {
      this.localization.updateSafeZone(payload.id, payload).subscribe({
        next: () => {
          this.showMsg('Localisation mise a jour.', 'ok');
          this.resetForm();
          this.loadAll();
        },
        error: () => this.showMsg('Erreur lors de la mise a jour.', 'err')
      });
      return;
    }

    this.localization.createSafeZone(payload).subscribe({
      next: () => {
        this.showMsg('Localisation creee.', 'ok');
        this.resetForm();
        this.loadAll();
      },
      error: () => this.showMsg('Erreur lors de la creation.', 'err')
    });
  }

  deleteZone(zone: SafeZone): void {
    if (!zone.id) return;
    if (!confirm('Supprimer cette localisation ?')) return;

    this.localization.deleteSafeZone(zone.id).subscribe({
      next: () => {
        this.showMsg('Localisation supprimee.', 'ok');
        this.loadAll();
      },
      error: () => this.showMsg('Erreur lors de la suppression.', 'err')
    });
  }

  searchPlaces(): void {
    const q = this.locationQuery.trim();
    if (q.length < 3) {
      this.placeResults = [];
      return;
    }

    this.searching = true;
    this.localization.searchPlace(q).subscribe({
      next: (res) => {
        this.placeResults = res || [];
        this.searching = false;
      },
      error: () => {
        this.searching = false;
        this.showMsg('Recherche OpenStreetMap indisponible.', 'err');
      }
    });
  }

  selectPlace(place: OSMPlace): void {
    this.form.centerLatitude = Number(place.lat);
    this.form.centerLongitude = Number(place.lon);
    this.form.name = this.form.name?.trim() ? this.form.name : place.display_name.slice(0, 80);
    this.placeResults = [];
    this.locationQuery = place.display_name;
  }

  getPatientLabel(patientId: number): string {
    const p = this.patients.find(x => x.id === patientId);
    return p ? `${p.firstname} ${p.lastname} (#${p.id})` : `Patient #${patientId}`;
  }

  openOSM(zone: SafeZone): void {
    const url = `https://www.openstreetmap.org/?mlat=${zone.centerLatitude}&mlon=${zone.centerLongitude}#map=16/${zone.centerLatitude}/${zone.centerLongitude}`;
    window.open(url, '_blank');
  }

  private showMsg(message: string, type: 'ok' | 'err'): void {
    this.msg = message;
    this.msgType = type;
    setTimeout(() => {
      this.msg = '';
      this.msgType = '';
    }, 4000);
  }
}
