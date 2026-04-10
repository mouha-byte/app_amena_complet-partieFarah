import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-off-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class OfficielLandingComponent implements OnInit, OnDestroy {
  navScrolled = false;
  private scrollHandler!: () => void;

  features = [
    { icon: '🧠', title: 'Quiz Cognitifs', desc: 'Évaluez les capacités cognitives avec des quiz adaptatifs multi-niveaux.', color: '#667eea' },
    { icon: '📸', title: 'Reconnaissance Photo', desc: 'Activités de reconnaissance visuelle pour stimuler la mémoire.', color: '#a78bfa' },
    { icon: '📊', title: 'Score Intelligent', desc: 'Algorithme de scoring pondéré basé sur la précision, le temps et la difficulté.', color: '#f093fb' },
    { icon: '🔔', title: 'Détection Automatique', desc: 'Détection du risque d\'Alzheimer avec alertes email automatiques.', color: '#4fd1c5' },
    { icon: '👨‍⚕️', title: 'Suivi Médical', desc: 'Interface dédiée pour les médecins et le suivi des patients.', color: '#f6ad55' },
    { icon: '🗺️', title: 'Zones de Sécurité', desc: 'Géolocalisation et zones de sécurité pour les patients.', color: '#fc8181' }
  ];

  steps = [
    { num: '01', title: 'Créer un compte', desc: 'Inscrivez-vous en tant que médecin, patient ou aidant en quelques secondes.', icon: '🔐' },
    { num: '02', title: 'Passer les quiz', desc: 'Complétez des activités cognitives adaptées à votre profil.', icon: '🎯' },
    { num: '03', title: 'Analyse automatique', desc: 'Notre algorithme évalue le score et détecte les risques.', icon: '⚙️' },
    { num: '04', title: 'Suivi & alertes', desc: 'Recevez les résultats et alertes automatiques par email.', icon: '📬' }
  ];

  stats = [
    { value: '4', label: 'Niveaux de risque', icon: '📈' },
    { value: '3', label: 'Types d\'activités', icon: '🎮' },
    { value: '100%', label: 'Automatisé', icon: '🤖' },
    { value: '24/7', label: 'Surveillance', icon: '🛡️' }
  ];

  trustedBy = [
    { icon: '🏥', name: 'Hôpitaux' },
    { icon: '🧪', name: 'Laboratoires' },
    { icon: '🎓', name: 'Universités' },
    { icon: '🏠', name: 'EHPAD' },
    { icon: '💊', name: 'Cliniques' }
  ];

  ngOnInit() {
    this.scrollHandler = () => {
      this.navScrolled = window.scrollY > 40;
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollHandler);
  }
}
