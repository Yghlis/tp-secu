# 🚀 Guide de Déploiement - TP Sécurité

Ce guide vous accompagne dans le déploiement complet de votre application NestJS avec HTTPS via Let's Encrypt.

## 📋 Prérequis

- **Serveur** : Ubuntu/Debian avec accès root
- **Docker** et **Docker Compose** installés
- **Nom de domaine** pointant vers votre serveur
- **Ports ouverts** : 80 (HTTP) et 443 (HTTPS)

## 🛠️ Installation Rapide

### 1. Cloner le projet
```bash
git clone <your-repo-url>
cd tp-secu
```

### 2. Configuration de l'environnement
```bash
# Copier et configurer les variables d'environnement
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

Configurez les variables suivantes :
```env
POSTGRES_USER=votre_utilisateur
POSTGRES_PASSWORD=votre_mot_de_passe_securise
POSTGRES_DB=votre_base_de_donnees
```

### 3. Configuration HTTPS avec Let's Encrypt

#### Automatique (Recommandé)
```bash
# Remplacez example.com par votre domaine
./init-letsencrypt.sh example.com
```

#### Manuel
```bash
# 1. Éditer la configuration Nginx
nano nginx/conf.d/default.conf
# Remplacer 'your-domain.com' par votre domaine

# 2. Éditer le script d'initialisation
nano init-letsencrypt.sh
# Changer EMAIL="your-email@example.com"

# 3. Lancer l'initialisation
./init-letsencrypt.sh votre-domaine.com
```

## 🔧 Commandes Utiles

### Gestion des services
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Redémarrer un service spécifique
docker-compose restart nginx

# Arrêter tous les services
docker-compose down
```

### Gestion des certificats SSL
```bash
# Renouveler manuellement
./renew-certificates.sh

# Vérifier l'état des certificats
docker-compose run --rm certbot certificates

# Tester le renouvellement (dry-run)
docker-compose run --rm certbot renew --dry-run
```

### Base de données
```bash
# Accéder à la base de données
docker-compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB

# Backup de la base
docker-compose exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

# Restaurer un backup
cat backup.sql | docker-compose exec -T db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

## 🔄 Renouvellement Automatique SSL

### Configuration Cron
Ajoutez cette ligne à votre crontab pour un renouvellement automatique :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne (renouvellement tous les jours à 2h du matin)
0 2 * * * cd /chemin/vers/votre/projet && ./renew-certificates.sh >> /var/log/ssl-renew.log 2>&1
```

## 🌐 Accès aux Services

Une fois déployé, vos services seront accessibles via :

- **Application principale** : `https://votre-domaine.com`
- **API Documentation** : `https://votre-domaine.com/api`
- **MailDev** (dev uniquement) : `http://votre-serveur:1080`

## 🛡️ Sécurité

### Headers de sécurité configurés
- **HSTS** : Force HTTPS pendant 2 ans
- **X-Frame-Options** : Protège contre le clickjacking
- **X-Content-Type-Options** : Empêche le MIME sniffing
- **Content Security Policy** : Politique de sécurité du contenu
- **Referrer Policy** : Contrôle les informations de référence

### SSL/TLS
- **Protocoles** : TLS 1.2 et 1.3 uniquement
- **Chiffrement** : Suites de chiffrement modernes et sécurisées
- **Renouvellement** : Automatique via Let's Encrypt

## 🔍 Monitoring et Debug

### Vérifier les logs
```bash
# Logs de l'application
docker-compose logs nest-app

# Logs de Nginx
docker-compose logs nginx

# Logs de la base de données
docker-compose logs db
```

### Tester la configuration SSL
```bash
# Test en ligne de commande
curl -I https://votre-domaine.com

# Test complet SSL Labs
# Visitez : https://www.ssllabs.com/ssltest/
```

### Healthchecks
```bash
# Vérifier la santé de l'application
curl https://votre-domaine.com/api/health

# Vérifier les conteneurs
docker-compose ps
```

## 🚨 Dépannage

### Problème : Certificat SSL non généré
```bash
# Vérifier les logs Certbot
docker-compose logs certbot

# Vérifier que le domaine pointe vers le serveur
nslookup votre-domaine.com

# Tester en mode staging d'abord
# Éditez init-letsencrypt.sh et mettez STAGING=1
```

### Problème : Nginx ne démarre pas
```bash
# Vérifier la syntaxe de la configuration
docker-compose exec nginx nginx -t

# Vérifier les logs
docker-compose logs nginx
```

### Problème : Application inaccessible
```bash
# Vérifier que l'app fonctionne
docker-compose exec nest-app curl localhost:3000/api/health

# Vérifier la connectivité réseau
docker-compose exec nginx curl nest-app:3000/api/health
```

## 📊 Performance

### Optimisations incluses
- **Mise en cache** : Assets statiques cachés 1 an
- **Compression** : Gzip activé par défaut
- **HTTP/2** : Activé pour de meilleures performances
- **Multi-stage Docker** : Images optimisées pour la production

### Monitoring recommandé
- **Uptime** : UptimeRobot, Pingdom
- **Performance** : New Relic, DataDog
- **Logs** : ELK Stack, Grafana

## 🔄 Mise à jour

Pour mettre à jour l'application :

```bash
# 1. Récupérer les dernières modifications
git pull origin main

# 2. Rebuild et redéployer
docker-compose down
docker-compose up --build -d

# 3. Vérifier que tout fonctionne
docker-compose ps
curl https://votre-domaine.com/api/health
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `docker-compose logs`
2. Consultez la documentation officielle
3. Vérifiez les issues GitHub du projet

---

**🎉 Félicitations ! Votre application est maintenant déployée avec HTTPS !** 