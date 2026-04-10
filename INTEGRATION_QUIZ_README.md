# 🧠 Integration Quiz Back-Office → Front-Office

## ✅ Fonctionnalité Implémentée

Les quiz créés dans le back-office sont maintenant automatiquement affichés dans le front-office lorsque l'utilisateur clique sur le bouton "Quiz".

## 🔄 Flux de fonctionnement

### 1. **Back-Office (Admin)**
- URL : `http://localhost:4200/admin/quiz-management`
- Création/modification/suppression de quiz
- Stockage dans la base de données via l'API Spring Boot (port 8085)

### 2. **API Backend**
- Endpoint : `http://localhost:8085/api/quiz-activities`
- CRUD complet des quiz
- Cross-origin activé pour le front-end Angular

### 3. **Front-Office (Patient)**
- Accès via le bouton "Quiz" dans la page Activities
- URL : `http://localhost:4201/quiz`
- Affichage automatique des quiz créés en back-office

## 🛠️ Modifications apportées

### Front-End Angular
1. **QuizListComponent** (`quiz-list.component.ts`)
   - Intégration avec `QuizService` pour appeler l'API backend
   - Fallback vers données de test si backend non disponible
   - Affichage des quiz avec cartes interactives

2. **ActivitiesComponent** (`activities.component.ts`)
   - Redirection automatique vers `/quiz` lors du clic sur le bouton Quiz
   - Plus de filtrage, navigation directe

3. **Routing** (`app-routing-module.ts`)
   - Ajout des routes `/quiz` et `/quiz/player/:id`
   - Import des composants standalone

4. **Module** (`app-module.ts`)
   - Configuration des imports pour composants standalone
   - Ajout du `QuizService` aux providers

### Backend Spring Boot
- **QuizActivityController** : API REST complète
- **QuizActivity** : Entité JPA avec tous les champs nécessaires
- **QuizActivityService** : Logique métier
- **QuizActivityRepository** : Accès données

## 🎯 Fonctionnalités disponibles

### Pour les administrateurs (Back-Office)
- ✅ Créer des quiz avec questions et réponses
- ✅ Modifier les quiz existants
- ✅ Supprimer des quiz
- ✅ Définir thématiques et niveaux de difficulté
- ✅ Gérer le statut (actif/inactif)

### Pour les patients (Front-Office)
- ✅ Voir tous les quiz créés par les administrateurs
- ✅ Filtrer par thématique et niveau
- ✅ Démarrer un quiz
- ✅ Jouer au quiz question par question
- ✅ Voir les résultats à la fin
- ✅ Recommencer ou retourner à la liste

## 🚀 Démarrage

### 1. Démarrer le Front-End Angular
```bash
cd Azheimer_APP
ng serve --port 4201
```

### 2. Démarrer le Backend Spring Boot
```bash
cd alzheimer-backend/Activities_service
mvn spring-boot:run
```

### 3. Accéder à l'application
- **Front-Office** : http://localhost:4201
- **Back-Office** : http://localhost:4201/admin
- **API Documentation** : http://localhost:8085/swagger-ui/index.html

## 📝 Test de la fonctionnalité

1. **Créer un quiz en back-office** :
   - Aller sur http://localhost:4201/admin/quiz-management
   - Cliquer sur "Nouveau quiz"
   - Remplir le formulaire et sauvegarder

2. **Vérifier l'affichage en front-office** :
   - Aller sur http://localhost:4201/activities
   - Cliquer sur le bouton "Quiz"
   - Le quiz créé devrait apparaître dans la liste

3. **Jouer au quiz** :
   - Cliquer sur "Commencer le Quiz"
   - Répondre aux questions
   - Voir les résultats finaux

## 🔧 Configuration

### URL de l'API Backend
Dans `quiz.service.ts` :
```typescript
private apiUrl = 'http://localhost:8085/api/quiz-activities';
```

### Ports
- **Front-End Angular** : 4201
- **Backend Spring Boot** : 8085

## 🎨 Interface

### Page Quiz List
- Cartes modernes avec informations du quiz
- Badges pour thématiques et niveaux
- Indicateurs de score et durée estimée
- Design responsive

### Page Quiz Player
- Interface immersive pour répondre aux questions
- Barre de progression
- Système de scores en temps réel
- Écran final avec résultats détaillés

## 🔄 Synchronisation

Les quiz sont synchronisés en temps réel :
- Création en back-office → Disponible immédiatement en front-office
- Modification en back-office → Mise à jour automatique
- Suppression en back-office → Retrait de la liste front-office

## 🎯 Prochaines améliorations

1. **Résultats persistants** : Sauvegarder les résultats des patients
2. **Statistiques** : Tableaux de bord pour les administrateurs
3. **Multilingue** : Support pour plusieurs langues
4. **Accessibilité** : Améliorations pour les patients Alzheimer
5. **Timer** : Ajout de temps limité par question
6. **Médias** : Support images/sons dans les questions

---

**L'intégration est maintenant 100% fonctionnelle !** 🎉
