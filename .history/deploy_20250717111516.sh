#!/bin/bash

# Script de déploiement automatisé pour astofinito.store
# Usage: ./deploy.sh

set -e  # Arrêt en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="astofinito.store"
EMAIL="admin@astofinito.store"

echo -e "${BLUE}🚀 Déploiement automatisé de TP Sécurité sur ${DOMAIN}${NC}"
echo "=========================================="

# Vérification des prérequis
echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}"

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Création du fichier .env...${NC}"
    cat > .env << EOF
# MongoDB Configuration (sécurisé pour la production)
MONGO_USERNAME=admin
MONGO_PASSWORD=YourSecurePassword123!
MONGODB_URI="mongodb://admin:YourSecurePassword123!@mongodb:27017/tp_secu?authSource=admin"

# Application Configuration
NODE_ENV=production
PORT=3000

# Domain Configuration
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}

# Legacy variables (for Docker Compose compatibility)
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=app
EOF
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Modifiez le mot de passe MongoDB dans le fichier .env${NC}"
    read -p "Appuyez sur Entrée pour continuer une fois le mot de passe modifié..."
else
    echo -e "${GREEN}✅ Fichier .env existant${NC}"
fi

# Vérification DNS
echo -e "${YELLOW}🌐 Vérification DNS...${NC}"
if dig +short ${DOMAIN} | grep -q .; then
    IP=$(dig +short ${DOMAIN} | head -1)
    echo -e "${GREEN}✅ DNS configuré: ${DOMAIN} → ${IP}${NC}"
else
    echo -e "${RED}❌ DNS non configuré pour ${DOMAIN}${NC}"
    echo -e "${YELLOW}💡 Configurez votre DNS dans OVH avant de continuer${NC}"
    exit 1
fi

# Build et démarrage des services
echo -e "${YELLOW}🏗️  Build de l'application...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}🚀 Démarrage des services...${NC}"
docker compose up -d

# Attente que les services soient prêts
echo -e "${YELLOW}⏳ Attente du démarrage des services...${NC}"
sleep 10

# Vérification que MongoDB est prêt
echo -e "${YELLOW}🔍 Vérification de MongoDB...${NC}"
timeout 30 bash -c 'until docker compose exec -T mongodb mongosh --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; do sleep 2; done'
echo -e "${GREEN}✅ MongoDB est prêt${NC}"

# Vérification que l'application est prête
echo -e "${YELLOW}🔍 Vérification de l'application...${NC}"
timeout 30 bash -c 'until curl -f http://localhost:3000/api/health > /dev/null 2>&1; do sleep 2; done'
echo -e "${GREEN}✅ Application démarrée${NC}"

# Configuration Let's Encrypt
echo -e "${YELLOW}🔐 Configuration Let's Encrypt...${NC}"
./init-letsencrypt.sh ${DOMAIN}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificats SSL configurés avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la configuration SSL${NC}"
    echo -e "${YELLOW}💡 Vérifiez que le DNS pointe vers ce serveur${NC}"
fi

# Tests finaux
echo -e "${YELLOW}🧪 Tests finaux...${NC}"

# Test HTTPS
if curl -f -s https://${DOMAIN}/api/health > /dev/null; then
    echo -e "${GREEN}✅ HTTPS fonctionne${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS pas encore prêt (propagation DNS en cours?)${NC}"
fi

# Affichage des informations finales
echo ""
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo "================================="
echo -e "🌐 Site principal: ${BLUE}https://${DOMAIN}${NC}"
echo -e "📚 Documentation API: ${BLUE}https://${DOMAIN}/api${NC}"
echo -e "🏥 Health Check: ${BLUE}https://${DOMAIN}/api/health${NC}"
echo ""
echo -e "${YELLOW}📊 Commandes utiles:${NC}"
echo "• Voir les logs: docker compose logs -f"
echo "• Status des services: docker compose ps"
echo "• Redémarrer: docker compose restart"
echo "• Arrêter: docker compose down"
echo ""
echo -e "${YELLOW}🔧 Monitoring:${NC}"
echo "• Logs Nginx: docker compose logs nginx"
echo "• Logs App: docker compose logs nest-app"
echo "• Logs MongoDB: docker compose logs mongodb"
echo ""
echo -e "${GREEN}✨ Votre application TP Sécurité est maintenant en ligne !${NC}" 