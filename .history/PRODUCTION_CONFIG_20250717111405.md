# 🚀 Configuration Production - astofinito.store

## 📋 Variables d'environnement à configurer

### Sur votre serveur `188.165.53.185`, créez le fichier `.env` avec :

```env
# MongoDB Configuration (sécurisé pour la production)
MONGO_USERNAME=admin
MONGO_PASSWORD=YourSecurePassword123!
MONGODB_URI="mongodb://admin:YourSecurePassword123!@mongodb:27017/tp_secu?authSource=admin"

# Application Configuration
NODE_ENV=production
PORT=3000

# Domain Configuration
DOMAIN=astofinito.store
EMAIL=admin@astofinito.store

# Legacy variables (for Docker Compose compatibility)
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=app
```

## 🌐 Configuration DNS

Vérifiez que votre DNS OVH pointe vers votre serveur :

```
Type    Nom             Valeur              TTL
A       @               188.165.53.185      300
A       www             188.165.53.185      300
AAAA    @               2001:41d0:301::21   300 (optionnel)
AAAA    www             2001:41d0:301::21   300 (optionnel)
```

## 🔧 Commandes de déploiement

### 1. Sur votre serveur, clonez le projet :
```bash
git clone <your-repo-url>
cd tp-secu
```

### 2. Créez le fichier `.env` avec le contenu ci-dessus

### 3. Lancez l'initialisation Let's Encrypt :
```bash
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh astofinito.store
```

### 4. OU démarrez tout en une seule commande :
```bash
docker compose up -d
```

## 🎯 URLs d'accès une fois déployé

- **Site principal** : https://astofinito.store
- **API Health** : https://astofinito.store/api/health
- **Documentation API** : https://astofinito.store/api
- **MongoDB** : Port 27017 (interne uniquement)

## ⚡ Test rapide

Une fois déployé, testez avec :

```bash
# Test de l'API
curl https://astofinito.store/api/health

# Test de création d'utilisateur
curl -X POST https://astofinito.store/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@astofinito.store","password":"password123"}'

# Test SSL
openssl s_client -connect astofinito.store:443 -servername astofinito.store
```

## 🔒 Sécurité incluse

- **HTTPS** : Force SSL avec HSTS
- **Headers sécurisés** : CSP, X-Frame-Options, etc.
- **Mots de passe** : Hashage bcrypt
- **MongoDB** : Authentification activée
- **Certificats** : Renouvellement automatique Let's Encrypt

## 📊 Monitoring

```bash
# Vérifier les services
docker compose ps

# Voir les logs
docker compose logs nginx
docker compose logs nest-app
docker compose logs mongodb

# Status des certificats
docker compose run --rm certbot certificates
```

---

**🎉 Configuration prête pour astofinito.store !** 