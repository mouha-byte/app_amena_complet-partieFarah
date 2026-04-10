# ============================================================
#  MindCare Backend - Script de Test Complet
#  Teste TOUS les endpoints CRUD pour les 3 microservices
#  Usage : powershell -ExecutionPolicy Bypass -File .\test-backend.ps1
# ============================================================

$ErrorActionPreference = "Continue"
$ACT  = "http://localhost:8085"
$MOV  = "http://localhost:8082"
$USR  = "http://localhost:8086"
$pass = 0; $fail = 0; $total = 0

function Sec($t) { Write-Host ""; Write-Host ("=" * 60) -ForegroundColor Cyan; Write-Host "  $t" -ForegroundColor Cyan; Write-Host ("=" * 60) -ForegroundColor Cyan }
function Step($m,$u,$d) { $script:total++; Write-Host -NoNewline "  [$m] " -ForegroundColor Yellow; Write-Host -NoNewline "$u " -ForegroundColor White; Write-Host -NoNewline "- $d ... " -ForegroundColor Gray }
function Ok($x) { $script:pass++; Write-Host "OK $x" -ForegroundColor Green }
function Nok($x) { $script:fail++; Write-Host "FAIL $x" -ForegroundColor Red }

function Call($m, $u, $b, $d, $f) {
    Step $m $u $d
    try {
        $p = @{ Method=$m; Uri=$u; ContentType="application/json"; ErrorAction="Stop" }
        if ($b) { $p.Body = ($b | ConvertTo-Json -Depth 10) }
        $r = Invoke-RestMethod @p
        if ($f -and $r -and (Get-Member -InputObject $r -Name $f -ErrorAction SilentlyContinue)) {
            Ok "[$f=$($r.$f)]"
        } elseif ($r -is [array]) {
            Ok "[count=$($r.Count)]"
        } else { Ok "" }
        return $r
    } catch {
        Nok $_.Exception.Message
        return $null
    }
}

function CleanAll($url, $endpoint, $label) {
    Step "GET" "$url/$endpoint" "Nettoyer $label"
    try {
        $list = Invoke-RestMethod -Method GET -Uri "$url/$endpoint" -ErrorAction Stop
        if ($list -is [array] -and $list.Count -gt 0) {
            Ok "[found=$($list.Count)]"
            foreach ($item in $list) {
                $iid = $item.id
                Step "DEL" "$url/$endpoint/$iid" "Supprimer $label #$iid"
                try { Invoke-RestMethod -Method DELETE -Uri "$url/$endpoint/$iid" -ErrorAction Stop; Ok "" } catch { Nok "" }
            }
        } else { Ok "[vide]" }
    } catch { Nok "" }
}

# ============================================================
#  PHASE 0 : HEALTH CHECK
# ============================================================
Sec "PHASE 0 - HEALTH CHECK"
Call "GET" "$ACT/health" $null "Activities service alive"
Call "GET" "$ACT/api/test/hello" $null "Test hello endpoint"
Call "GET" "$ACT/" $null "Home endpoint"
Call "GET" "$ACT/api" $null "API status"

# ============================================================
#  PHASE 1 : NETTOYAGE COMPLET
# ============================================================
Sec "PHASE 1 - NETTOYAGE COMPLET"
CleanAll $ACT "api/game-results" "resultats"
CleanAll $ACT "api/quiz" "quiz"
CleanAll $ACT "api/photo-activities" "photos"
CleanAll $MOV "safezones" "safezones"

Sec "VERIFICATION - Bases vides"
Call "GET" "$ACT/api/quiz" $null "Quiz vides"
Call "GET" "$ACT/api/photo-activities" $null "Photos vides"
Call "GET" "$ACT/api/game-results" $null "Resultats vides"

# ============================================================
#  PHASE 2 : CRUD QUIZ
# ============================================================
Sec "PHASE 2 - CRUD QUIZ"

$q1 = Call "POST" "$ACT/api/quiz" @{
    title="Quiz Memoire"; description="Test de memoire visuelle"; type="QUIZ"
    level="EASY"; theme="MEMORY"; difficulty="EASY"
    questions=@(
        @{ text="Quel animal est sur image?"; optionA="Chat"; optionB="Chien"; optionC="Oiseau"; correctAnswer="A"; score=10 },
        @{ text="Combien de cercles?"; optionA="3"; optionB="5"; optionC="7"; correctAnswer="B"; score=10 },
        @{ text="Quelle couleur dominante?"; optionA="Rouge"; optionB="Bleu"; optionC="Vert"; correctAnswer="C"; score=10 }
    )
} "Creer Quiz 1 EASY-MEMORY 3 questions" "id"

$q2 = Call "POST" "$ACT/api/quiz" @{
    title="Quiz Logique"; description="Raisonnement avance"; type="QUIZ"
    level="HARD"; theme="LOGIC"; difficulty="HARD"
    questions=@(
        @{ text="Suite: 2,4,8,?"; optionA="10"; optionB="12"; optionC="16"; correctAnswer="C"; score=15 },
        @{ text="Si A>B et B>C alors?"; optionA="A>C"; optionB="C>A"; optionC="A=C"; correctAnswer="A"; score=15 }
    )
} "Creer Quiz 2 HARD-LOGIC 2 questions" "id"

$q3 = Call "POST" "$ACT/api/quiz" @{
    title="Quiz Langage"; description="Comprehension du langage"; type="QUIZ"
    level="MEDIUM"; theme="LANGUAGE"; difficulty="MEDIUM"
    questions=@(
        @{ text="Synonyme de rapide?"; optionA="Lent"; optionB="Vif"; optionC="Grand"; correctAnswer="B"; score=10 }
    )
} "Creer Quiz 3 MEDIUM-LANGUAGE 1 question" "id"

Call "GET" "$ACT/api/quiz" $null "Lister tous les quiz - attendu 3"
if ($q1) { Call "GET" "$ACT/api/quiz/$($q1.id)" $null "Lire quiz par ID" "title" }
Call "GET" "$ACT/api/quiz/search?title=Logique" $null "Rechercher par titre Logique"
Call "GET" "$ACT/api/quiz/theme/MEMORY" $null "Filtrer theme MEMORY"
Call "GET" "$ACT/api/quiz/difficulty/HARD" $null "Filtrer difficulte HARD"

if ($q3) {
    Call "PUT" "$ACT/api/quiz/$($q3.id)" @{
        title="Quiz Langage MODIFIE"; description="Mis a jour par script"; type="QUIZ"
        level="HARD"; theme="LANGUAGE"; difficulty="HARD"
        questions=@(
            @{ text="Synonyme de rapide?"; optionA="Lent"; optionB="Vif"; optionC="Grand"; correctAnswer="B"; score=20 },
            @{ text="Antonyme de chaud?"; optionA="Tiede"; optionB="Froid"; optionC="Brulant"; correctAnswer="B"; score=20 }
        )
    } "Modifier quiz 3 - titre + difficulte + questions" "title"
}

if ($q3) {
    Call "DELETE" "$ACT/api/quiz/$($q3.id)" $null "Supprimer quiz 3"
    Call "GET" "$ACT/api/quiz" $null "Verifier suppression - attendu 2"
}

# ============================================================
#  PHASE 3 : CRUD PHOTO ACTIVITIES
# ============================================================
Sec "PHASE 3 - CRUD PHOTO ACTIVITIES"

$p1 = Call "POST" "$ACT/api/photo-activities" @{
    title="Photo Animaux"; description="Reconnaitre les animaux"
    imageUrl="https://via.placeholder.com/300?text=Animaux"; type="IMAGE_RECOGNITION"; difficulty="EASY"
} "Creer Photo 1 EASY" "id"

$p2 = Call "POST" "$ACT/api/photo-activities" @{
    title="Photo Objets"; description="Identifier les objets"
    imageUrl="https://via.placeholder.com/300?text=Objets"; type="IMAGE_RECOGNITION"; difficulty="MEDIUM"
} "Creer Photo 2 MEDIUM" "id"

$p3 = Call "POST" "$ACT/api/photo-activities" @{
    title="Photo Visages"; description="Reconnaitre les emotions"
    imageUrl="https://via.placeholder.com/300?text=Visages"; type="IMAGE_RECOGNITION"; difficulty="HARD"
} "Creer Photo 3 HARD" "id"

Call "GET" "$ACT/api/photo-activities" $null "Lister photos - attendu 3"
if ($p1) { Call "GET" "$ACT/api/photo-activities/$($p1.id)" $null "Lire photo par ID" "title" }
Call "GET" "$ACT/api/photo-activities/search?title=Objets" $null "Rechercher Objets"
Call "GET" "$ACT/api/photo-activities/difficulty/HARD" $null "Filtrer difficulte HARD"

if ($p2) {
    Call "PUT" "$ACT/api/photo-activities/$($p2.id)" @{
        title="Photo Objets MODIFIEE"; description="Mise a jour"
        imageUrl="https://via.placeholder.com/300?text=Updated"; type="IMAGE_RECOGNITION"; difficulty="HARD"
    } "Modifier photo 2" "title"
}

if ($p3) {
    Call "DELETE" "$ACT/api/photo-activities/$($p3.id)" $null "Supprimer photo 3"
    Call "GET" "$ACT/api/photo-activities" $null "Verifier suppression - attendu 2"
}

# ============================================================
#  PHASE 4 : CRUD GAME RESULTS + SCORE INTELLIGENT + RISQUE
# ============================================================
Sec "PHASE 4 - GAME RESULTS + SCORE + RISQUE ALZHEIMER"

$qid1 = if ($q1) { $q1.id } else { 1 }
$qid2 = if ($q2) { $q2.id } else { 2 }

# Scenario 1: Patient performant -> LOW risk
$r1 = Call "POST" "$ACT/api/game-results" @{
    patientId=1; patientName="Alice Dupont"; patientEmail="alice@test.com"
    activityType="QUIZ"; activityId=$qid1; activityTitle="Quiz Memoire"
    score=90; maxScore=100; difficulty="EASY"
    totalQuestions=10; correctAnswers=9; timeSpentSeconds=60
} "Resultat 1 - Performant 9sur10 EASY 60s" "riskLevel"

# Scenario 2: Moyen -> MEDIUM risk
$r2 = Call "POST" "$ACT/api/game-results" @{
    patientId=1; patientName="Alice Dupont"; patientEmail="alice@test.com"
    activityType="QUIZ"; activityId=$qid1; activityTitle="Quiz Memoire"
    score=50; maxScore=100; difficulty="MEDIUM"
    totalQuestions=10; correctAnswers=5; timeSpentSeconds=200
} "Resultat 2 - Moyen 5sur10 MEDIUM 200s" "riskLevel"

# Scenario 3: Mauvais -> HIGH risk
$r3 = Call "POST" "$ACT/api/game-results" @{
    patientId=2; patientName="Bob Martin"; patientEmail="bob@test.com"
    activityType="QUIZ"; activityId=$qid2; activityTitle="Quiz Logique"
    score=20; maxScore=100; difficulty="HARD"
    totalQuestions=10; correctAnswers=2; timeSpentSeconds=400
} "Resultat 3 - Mauvais 2sur10 HARD 400s" "riskLevel"

# Scenario 4: Critique -> CRITICAL risk + alerte
$r4 = Call "POST" "$ACT/api/game-results" @{
    patientId=2; patientName="Bob Martin"; patientEmail="bob@test.com"
    activityType="QUIZ"; activityId=$qid2; activityTitle="Quiz Logique"
    score=10; maxScore=100; difficulty="HARD"
    totalQuestions=10; correctAnswers=1; timeSpentSeconds=600
} "Resultat 4 - CRITIQUE 1sur10 HARD 600s" "riskLevel"

# Afficher les scores
Write-Host ""
Write-Host "  --- Scores ponderes et niveaux de risque ---" -ForegroundColor Magenta
if ($r1) { Write-Host "    R1: weighted=$([math]::Round($r1.weightedScore,1)) risk=$($r1.riskLevel) alert=$($r1.alertSent)" -ForegroundColor White }
if ($r2) { Write-Host "    R2: weighted=$([math]::Round($r2.weightedScore,1)) risk=$($r2.riskLevel) alert=$($r2.alertSent)" -ForegroundColor White }
if ($r3) { Write-Host "    R3: weighted=$([math]::Round($r3.weightedScore,1)) risk=$($r3.riskLevel) alert=$($r3.alertSent)" -ForegroundColor White }
if ($r4) { Write-Host "    R4: weighted=$([math]::Round($r4.weightedScore,1)) risk=$($r4.riskLevel) alert=$($r4.alertSent)" -ForegroundColor White }
Write-Host ""

Call "GET" "$ACT/api/game-results" $null "Lister tous resultats - attendu 4"
if ($r1) { Call "GET" "$ACT/api/game-results/$($r1.id)" $null "Lire resultat par ID" "weightedScore" }
Call "GET" "$ACT/api/game-results/patient/1" $null "Resultats patient 1 Alice"
Call "GET" "$ACT/api/game-results/patient/2" $null "Resultats patient 2 Bob"
Call "GET" "$ACT/api/game-results/activity/QUIZ/$qid1" $null "Resultats pour Quiz $qid1"
Call "GET" "$ACT/api/game-results/patient/1/activity/QUIZ/stats" $null "Stats patient 1 QUIZ" "totalGames"

# Update
if ($r2) {
    Call "PUT" "$ACT/api/game-results/$($r2.id)" @{
        patientId=1; patientName="Alice Dupont"; patientEmail="alice@test.com"
        activityType="QUIZ"; activityId=$qid1; activityTitle="Quiz Memoire"
        score=80; maxScore=100; difficulty="MEDIUM"
        totalQuestions=10; correctAnswers=8; timeSpentSeconds=150
    } "Modifier resultat 2 - 5sur10 vers 8sur10" "riskLevel"
}

# Delete
if ($r4) { Call "DELETE" "$ACT/api/game-results/$($r4.id)" $null "Supprimer resultat 4 CRITIQUE" }

# ============================================================
#  PHASE 5 : ANALYSE DE RISQUE ALZHEIMER
# ============================================================
Sec "PHASE 5 - ANALYSE RISQUE ALZHEIMER - TENDANCE"
Call "GET" "$ACT/api/game-results/patient/1/risk-analysis" $null "Analyse patient 1 Alice" "trend"
Call "GET" "$ACT/api/game-results/patient/2/risk-analysis" $null "Analyse patient 2 Bob" "trend"

# ============================================================
#  PHASE 6 : CRUD SAFE ZONES (movement_service:8082)
# ============================================================
Sec "PHASE 6 - CRUD SAFE ZONES port 8082"

$z1 = Call "POST" "$MOV/safezones" @{
    name="Maison Alice"; latitude=36.8065; longitude=10.1815; radius=100; patientId=1
} "Creer SafeZone 1" "id"

$z2 = Call "POST" "$MOV/safezones" @{
    name="Hopital Central"; latitude=36.8500; longitude=10.1650; radius=500; patientId=1
} "Creer SafeZone 2" "id"

$z3 = Call "POST" "$MOV/safezones" @{
    name="Maison Bob"; latitude=36.7200; longitude=10.2000; radius=150; patientId=2
} "Creer SafeZone 3" "id"

Call "GET" "$MOV/safezones" $null "Lister safezones - attendu 3"
if ($z1) { Call "GET" "$MOV/safezones/$($z1.id)" $null "Lire safezone par ID" "name" }
Call "GET" "$MOV/safezones/patient/1" $null "SafeZones patient 1"

if ($z2) {
    Call "PUT" "$MOV/safezones/$($z2.id)" @{
        name="Hopital Central MODIFIE"; latitude=36.8500; longitude=10.1650; radius=800; patientId=1
    } "Modifier safezone 2 - radius 500 vers 800" "name"
}

if ($z3) {
    Call "DELETE" "$MOV/safezones/$($z3.id)" $null "Supprimer safezone 3"
    Call "GET" "$MOV/safezones" $null "Verifier suppression - attendu 2"
}

# ============================================================
#  PHASE 7 : CRUD USERS + PATIENTS (users_service:8086)
# ============================================================
Sec "PHASE 7 - CRUD USERS port 8086"

$u1 = Call "POST" "$USR/users" @{
    username="dr_smith"; email="smith@mindcare.com"; password="pass123"; role="ADMIN"; firstName="John"; lastName="Smith"
} "Creer User 1 Admin" "id"

$u2 = Call "POST" "$USR/users" @{
    username="nurse_jane"; email="jane@mindcare.com"; password="pass456"; role="NURSE"; firstName="Jane"; lastName="Doe"
} "Creer User 2 Nurse" "id"

Call "GET" "$USR/users" $null "Lister users"
if ($u1) { Call "GET" "$USR/users/$($u1.id)" $null "Lire user par ID" "username" }

if ($u2) {
    Call "PUT" "$USR/users/$($u2.id)" @{
        username="nurse_jane_v2"; email="jane.v2@mindcare.com"; password="newpass"; role="NURSE"; firstName="Jane"; lastName="Doe-Updated"
    } "Modifier user 2" "username"
}

Sec "PHASE 7b - CRUD PATIENTS port 8086"

$pt1 = Call "POST" "$USR/patients" @{
    firstName="Alice"; lastName="Dupont"; email="alice@test.com"; dateOfBirth="1945-03-15"; gender="F"; phone="0612345678"
} "Creer Patient 1" "id"

$pt2 = Call "POST" "$USR/patients" @{
    firstName="Bob"; lastName="Martin"; email="bob@test.com"; dateOfBirth="1950-07-22"; gender="M"; phone="0698765432"
} "Creer Patient 2" "id"

Call "GET" "$USR/patients" $null "Lister patients"
if ($pt1) { Call "GET" "$USR/patients/$($pt1.id)" $null "Lire patient par ID" "firstName" }

if ($pt1) {
    Call "PUT" "$USR/patients/$($pt1.id)" @{
        firstName="Alice"; lastName="Dupont-Modifie"; email="alice.v2@test.com"; dateOfBirth="1945-03-15"; gender="F"; phone="0600000000"
    } "Modifier patient 1" "lastName"
}

if ($pt2) { Call "DELETE" "$USR/patients/$($pt2.id)" $null "Supprimer patient 2" }

# ============================================================
#  RESUME
# ============================================================
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  RESUME DES TESTS" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total   : $total tests" -ForegroundColor White
Write-Host "  Reussis : $pass " -ForegroundColor Green
Write-Host "  Echoues : $fail " -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Green" })
Write-Host ""

$pct = if ($total -gt 0) { [math]::Round(($pass / $total) * 100, 1) } else { 0 }
if ($fail -eq 0) {
    Write-Host "  TOUS LES TESTS PASSENT - $pct pourcent" -ForegroundColor Green
} else {
    Write-Host "  $fail tests en echec - $pct pourcent de reussite" -ForegroundColor Yellow
    Write-Host "  Verifiez que les 3 backends sont demarres :" -ForegroundColor Yellow
    Write-Host "    - Activities_service sur le port 8085" -ForegroundColor Gray
    Write-Host "    - movement_service   sur le port 8082" -ForegroundColor Gray
    Write-Host "    - users_service      sur le port 8086" -ForegroundColor Gray
}
Write-Host ""
