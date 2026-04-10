import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { PhotoService, PhotoActivity } from '../../services/photo.service';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, SafeUrlPipe]
})
export class PhotoManagementComponent implements OnInit {

  photos: PhotoActivity[] = [];
  isLoading = false;
  searchTerm = '';
  selectedFile: File | null = null;
  isEditing = false;
  currentPhotoId: number | null = null;
  photoForm: FormGroup;

  constructor(private router: Router, private photoService: PhotoService, private fb: FormBuilder) {
    this.photoForm = this.createPhotoForm();
  }

  ngOnInit(): void {
    this.loadPhotos();
  }

  createPhotoForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      difficulty: ['', Validators.required],
      points: [1, [Validators.required, Validators.min(1)]],
      imageUrl: ['']
    });
  }

  loadPhotos(): void {
    this.isLoading = true;
    
    // Données simulées pour le front-office
    setTimeout(() => {
      this.photos = [
        {
          id: 1,
          title: 'Chat domestique',
          description: 'Un mignon chat de maison',
          imageUrl: 'https://picsum.photos/seed/cat1/300/200.jpg',
          type: 'DOMESTIC',
          difficulty: 'EASY',
          points: 10,
          status: 'ACTIVE',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          title: 'Lion sauvage',
          description: 'Un majestueux lion dans la savane',
          imageUrl: 'https://picsum.photos/seed/lion1/300/200.jpg',
          type: 'WILD',
          difficulty: 'MEDIUM',
          points: 20,
          status: 'ACTIVE',
          createdAt: '2024-01-16'
        },
        {
          id: 3,
          title: 'Voiture classique',
          description: 'Une voiture rouge des années 60',
          imageUrl: 'https://picsum.photos/seed/car1/300/200.jpg',
          type: 'OBJECTS',
          difficulty: 'EASY',
          points: 15,
          status: 'ACTIVE',
          createdAt: '2024-01-17'
        },
        {
          id: 4,
          title: 'Famille heureuse',
          description: 'Un groupe de personnes souriantes',
          imageUrl: 'https://picsum.photos/seed/family1/300/200.jpg',
          type: 'PEOPLE',
          difficulty: 'MEDIUM',
          points: 25,
          status: 'ACTIVE',
          createdAt: '2024-01-18'
        },
        {
          id: 5,
          title: 'Plage paradisiaque',
          description: 'Une belle plage avec des palmiers',
          imageUrl: 'https://picsum.photos/seed/beach1/300/200.jpg',
          type: 'PLACES',
          difficulty: 'EASY',
          points: 10,
          status: 'ACTIVE',
          createdAt: '2024-01-19'
        }
      ];
      this.isLoading = false;
      console.log('Photos chargées:', this.photos);
    }, 1000);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      // Filtrer les photos existantes
      this.photos = this.photos.filter(photo => 
        photo.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        photo.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        photo.type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.loadPhotos();
    }
  }

  onEdit(photo: PhotoActivity): void {
    console.log('Édition de la photo:', photo);
    this.isEditing = true;
    this.currentPhotoId = photo.id || null;
    
    // Pré-remplir le formulaire
    this.photoForm.patchValue({
      title: photo.title,
      description: photo.description || '',
      type: photo.type,
      difficulty: photo.difficulty,
      points: photo.points,
      imageUrl: photo.imageUrl
    });

    // Ouvrir la modal
    this.openModal();
  }

  onDelete(photo: PhotoActivity): void {
    console.log('Suppression de la photo:', photo);
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la photo "${photo.title}" ?\n\nCette action est irréversible.`)) {
      try {
        // Simulation de suppression (car backend non accessible)
        this.photos = this.photos.filter(p => p.id !== photo.id);
        console.log('Photo supprimée avec succès:', photo.title);
        
        // Afficher un message de succès
        this.showSuccessMessage('Photo supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.showErrorMessage('Erreur lors de la suppression de la photo');
      }
    }
  }

  showSuccessMessage(message: string): void {
    // Créer un toast ou une alerte simple
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto-suppression après 3 secondes
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 3000);
  }

  showErrorMessage(message: string): void {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 5000);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Créer une URL temporaire pour l'aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoForm.patchValue({
          imageUrl: e.target?.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onUpload(): void {
    console.log('=== DÉBUT SAUVEGARDE PHOTO ===');
    console.log('Formulaire valide:', !this.photoForm.invalid);
    console.log('Valeur formulaire:', this.photoForm.value);
    
    if (this.photoForm.invalid) {
      console.log('SAUVEGARDE BLOQUÉE - Formulaire invalide');
      this.showErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const photoData: PhotoActivity = {
      ...this.photoForm.value,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    console.log('Données de la photo à sauvegarder:', photoData);

    try {
      if (this.isEditing && this.currentPhotoId) {
        // Mise à jour
        const index = this.photos.findIndex(p => p.id === this.currentPhotoId);
        if (index !== -1) {
          this.photos[index] = { ...this.photos[index], ...photoData };
          console.log('Photo mise à jour avec succès');
          this.showSuccessMessage('Photo mise à jour avec succès');
        }
      } else {
        // Création
        const newPhoto = {
          id: Math.max(...this.photos.map(p => p.id || 0)) + 1,
          ...photoData
        };
        this.photos.unshift(newPhoto);
        console.log('Photo créée avec succès:', newPhoto);
        this.showSuccessMessage('Photo ajoutée avec succès');
      }

      this.closeModal();
      this.clearFormAfterSave();
      console.log('=== FIN SAUVEGARDE PHOTO ===');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showErrorMessage('Erreur lors de la sauvegarde de la photo');
    }
  }

  clearFormAfterSave(): void {
    this.selectedFile = null;
    this.isEditing = false;
    this.currentPhotoId = null;
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('photoFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onImageError(event: any): void {
    // Remplacer l'image par une image par défaut en cas d'erreur
    event.target.src = 'https://picsum.photos/seed/default/300/200.jpg';
  }

  openModal(): void {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('addPhotoModal'));
    modal.show();
  }

  closeModal(): void {
    const modalElement = document.getElementById('addPhotoModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
    
    // Forcer la suppression du backdrop et des classes
    setTimeout(() => {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 300);
  }

  onAddNew(): void {
    this.isEditing = false;
    this.currentPhotoId = null;
    this.resetForm(); // Réinitialiser seulement pour l'ajout
    this.openModal();
  }

  resetForm(): void {
    this.photoForm.reset();
    this.selectedFile = null;
    this.isEditing = false;
    this.currentPhotoId = null;
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('photoFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'DOMESTIC': 'bg-primary',
      'WILD': 'bg-success',
      'OBJECTS': 'bg-warning',
      'PEOPLE': 'bg-info',
      'PLACES': 'bg-secondary'
    };
    return colors[type] || 'bg-secondary';
  }

  getDifficultyBadge(difficulty: string): string {
    const badges: { [key: string]: string } = {
      'EASY': 'success',
      'MEDIUM': 'warning',
      'HARD': 'danger',
      'EXPERT': 'dark'
    };
    return badges[difficulty] || 'secondary';
  }
}
