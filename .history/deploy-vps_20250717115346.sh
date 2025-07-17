#!/bin/bash

echo "🚀 Déploiement TP Sécurité sur VPS OVH"
echo "=====================================\n"

# Configuration
DOMAIN="astofinito.store"
EMAIL="your-email@example.com"  # Remplacez par votre email

echo "📋 Configuration:"
echo "   - Domaine: $DOMAIN"
echo "   - VPS: 51.91.253.210"
echo "   - Email: $EMAIL\n"

# Installation Docker si nécessaire
echo "🐳 Installation Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Docker installé"

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

# Build et démarrage des services
echo "🏗️ Build et démarrage des services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Attente du démarrage des services (30s)..."
sleep 30

# Vérification du statut
echo "🔍 Vérification du statut..."
docker-compose ps

# Test de l'API
echo "🧪 Test de l'API..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ API fonctionne"
else
    echo "❌ API ne répond pas"
    docker-compose logs nest-app
fi

echo "\n🎉 Déploiement terminé !"
echo "📍 Votre application est accessible sur:"
echo "   - HTTP: http://51.91.253.210"
echo "   - Avec domaine: http://$DOMAIN (après configuration DNS)"
echo "\n📝 Prochaines étapes:"
echo "   1. Configurez votre DNS: $DOMAIN → 51.91.253.210"
echo "   2. Configurez HTTPS avec Let's Encrypt"
echo "   3. Testez votre application" 