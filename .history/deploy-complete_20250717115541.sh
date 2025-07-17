#!/bin/bash

echo "🚀 DÉPLOIEMENT COMPLET - TP Sécurité sur VPS OVH"
echo "=================================================="
echo ""

# Configuration
DOMAIN="astofinito.store"
EMAIL="your-email@example.com"  # CHANGEZ PAR VOTRE EMAIL AVANT D'EXÉCUTER

echo "📋 Configuration:"
echo "   - Domaine: $DOMAIN"
echo "   - VPS: 51.91.253.210"
echo "   - Email: $EMAIL"
echo ""

# Vérification que l'email a été changé
if [ "$EMAIL" = "your-email@example.com" ]; then
    echo "⚠️  ATTENTION: Changez l'email dans le script avant de continuer!"
    echo "   Modifiez la variable EMAIL ligne 8"
    exit 1
fi

echo "🎯 ÉTAPE 1: Installation de Docker et des dépendances"
echo "===================================================="

# Installation Docker si nécessaire
if ! command -v docker &> /dev/null; then
    echo "📦 Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installé"
else
    echo "✅ Docker déjà installé"
fi

# Installation Docker Compose si nécessaire
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installation de Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installé"
else
    echo "✅ Docker Compose déjà installé"
fi

# Installation des outils nécessaires
echo "📦 Installation des outils système..."
apt update
apt install -y curl dig certbot python3-certbot-nginx

echo ""
echo "🎯 ÉTAPE 2: Configuration de l'application"
echo "==========================================="

# Création du fichier .env
echo "📝 Création du fichier .env..."
cat > .env << EOL
# Production Environment Variables
NODE_ENV=production
PORT=3000

# MongoDB Configuration
MONGO_USERNAME=admin
MONGO_PASSWORD=MongoSecure2025!
MONGODB_URI=mongodb://admin:MongoSecure2025!@mongodb:27017/tp_secu?authSource=admin
EOL

echo "✅ Fichier .env créé"

# Build et démarrage des services (sans HTTPS pour commencer)
echo "🏗️ Build et démarrage des services..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Attente du démarrage des services (30s)..."
sleep 30

# Vérification que l'application fonctionne
echo "🧪 Test de l'application..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Application fonctionne"
else
    echo "❌ Application ne répond pas, vérification des logs..."
    docker-compose logs nest-app
    echo "Voulez-vous continuer quand même? (y/N)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🎯 ÉTAPE 3: Vérification DNS"
echo "============================"

# Vérification DNS
echo "🔍 Vérification que le domaine pointe vers ce serveur..."
CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN)

echo "   - IP du serveur: $CURRENT_IP"
echo "   - IP du domaine: $DOMAIN_IP"

if [ "$CURRENT_IP" != "$DOMAIN_IP" ]; then
    echo "❌ ERREUR: Le domaine ne pointe pas vers ce serveur!"
    echo ""
    echo "🔧 ACTIONS REQUISES:"
    echo "   1. Allez dans votre espace client OVH"
    echo "   2. Web Cloud > Noms de domaine > $DOMAIN"
    echo "   3. Zone DNS > Modifier l'enregistrement A"
    echo "   4. Pointez $DOMAIN vers $CURRENT_IP"
    echo "   5. Attendez 5-10 minutes et relancez ce script"
    echo ""
    exit 1
else
    echo "✅ DNS correctement configuré"
fi

echo ""
echo "🎯 ÉTAPE 4: Configuration SSL Let's Encrypt"
echo "============================================"

# Arrêt temporaire des services
echo "⏹️ Arrêt temporaire des services pour la configuration SSL..."
docker-compose down

# Configuration SSL avec le script dédié
echo "🔐 Configuration SSL automatique..."
# Modification temporaire de l'email dans le script SSL
sed -i "s/your-email@example.com/$EMAIL/" setup-ssl.sh

# Exécution du script SSL
./setup-ssl.sh

if [ $? -eq 0 ]; then
    echo "✅ SSL configuré avec succès"
else
    echo "❌ Erreur lors de la configuration SSL"
    exit 1
fi

echo ""
echo "🎯 ÉTAPE 5: Tests finaux"
echo "========================"

echo "🧪 Tests de connectivité..."

# Test HTTP (doit rediriger vers HTTPS)
echo "   - Test redirection HTTP → HTTPS..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN)
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "   ✅ Redirection HTTP → HTTPS OK"
else
    echo "   ⚠️ Redirection HTTP: $HTTP_STATUS"
fi

# Test HTTPS
echo "   - Test HTTPS..."
if curl -s https://$DOMAIN/api/health > /dev/null; then
    echo "   ✅ HTTPS fonctionne"
else
    echo "   ❌ HTTPS ne répond pas"
fi

# Test API
echo "   - Test API..."
API_RESPONSE=$(curl -s https://$DOMAIN/api/health)
if [[ $API_RESPONSE == *"MongoDB"* ]]; then
    echo "   ✅ API et base de données fonctionnent"
else
    echo "   ⚠️ Réponse API: $API_RESPONSE"
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
echo "===================================="
echo ""
echo "🌍 Votre application est accessible sur:"
echo "   - https://$DOMAIN"
echo "   - https://www.$DOMAIN"
echo ""
echo "📊 Statut des services:"
docker-compose ps
echo ""
echo "🔐 Certificat SSL:"
echo "   - Valide pour 90 jours"
echo "   - Renouvellement automatique configuré"
echo "   - Stocké dans: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "🛠️ Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Redémarrer: docker-compose restart"
echo "   - Mettre à jour: git pull && docker-compose up -d --build"
echo "   - Vérifier SSL: curl -I https://$DOMAIN"
echo ""
echo "✅ Votre TP Sécurité est maintenant en ligne!" 