#!/bin/bash

# Script d'initialisation Let's Encrypt
# Usage: ./init-letsencrypt.sh yourdomain.com

if [ $# -eq 0 ]; then
    echo "Usage: $0 <domain>"
    echo "Example: $0 example.com"
    exit 1
fi

DOMAIN=$1
EMAIL="your-email@example.com"  # Remplacez par votre email
STAGING=0  # Mettez à 1 pour tester avec l'environnement de staging

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Initialisation Let's Encrypt pour $DOMAIN${NC}"

# Vérification que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

# Vérification que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Mise à jour de la configuration Nginx avec le bon domaine
echo -e "${YELLOW}📝 Mise à jour de la configuration Nginx...${NC}"
sed -i.bak "s/your-domain.com/$DOMAIN/g" nginx/conf.d/default.conf
sed -i.bak "s/server_name _;/server_name $DOMAIN;/g" nginx/conf.d/default.conf

# Création des dossiers nécessaires
echo -e "${YELLOW}📁 Création des dossiers...${NC}"
mkdir -p data/certbot/conf
mkdir -p data/certbot/www

# Téléchargement des paramètres SSL recommandés
if [ ! -f "data/certbot/conf/options-ssl-nginx.conf" ]; then
    echo -e "${YELLOW}⬇️  Téléchargement des paramètres SSL...${NC}"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > data/certbot/conf/options-ssl-nginx.conf
fi

if [ ! -f "data/certbot/conf/ssl-dhparams.pem" ]; then
    echo -e "${YELLOW}⬇️  Téléchargement des paramètres DH...${NC}"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > data/certbot/conf/ssl-dhparams.pem
fi

# Création d'un certificat temporaire pour démarrer Nginx
echo -e "${YELLOW}🔑 Création d'un certificat temporaire...${NC}"
mkdir -p data/certbot/conf/live/$DOMAIN
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout data/certbot/conf/live/$DOMAIN/privkey.pem \
    -out data/certbot/conf/live/$DOMAIN/fullchain.pem \
    -subj "/CN=$DOMAIN" > /dev/null 2>&1

# Démarrage de Nginx
echo -e "${YELLOW}🚀 Démarrage de Nginx...${NC}"
docker-compose up -d nginx

# Suppression du certificat temporaire
echo -e "${YELLOW}🗑️  Suppression du certificat temporaire...${NC}"
rm -rf data/certbot/conf/live/$DOMAIN

# Demande du vrai certificat
echo -e "${YELLOW}📜 Demande du certificat Let's Encrypt...${NC}"

if [ $STAGING -eq 1 ]; then
    STAGING_ARG="--staging"
    echo -e "${YELLOW}⚠️  Mode staging activé${NC}"
else
    STAGING_ARG=""
fi

docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    $STAGING_ARG \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificat obtenu avec succès !${NC}"
    
    # Rechargement de Nginx avec le vrai certificat
    echo -e "${YELLOW}🔄 Rechargement de Nginx...${NC}"
    docker-compose restart nginx
    
    echo -e "${GREEN}🎉 Configuration HTTPS terminée !${NC}"
    echo -e "${GREEN}🌐 Votre site est maintenant accessible en HTTPS : https://$DOMAIN${NC}"
    
    # Affichage des informations importantes
    echo -e "\n${YELLOW}📋 Informations importantes :${NC}"
    echo -e "• Le certificat expire dans 90 jours"
    echo -e "• Le renouvellement automatique est configuré"
    echo -e "• Vérifiez votre configuration sur : https://www.ssllabs.com/ssltest/"
    
else
    echo -e "${RED}❌ Échec de l'obtention du certificat${NC}"
    echo -e "${YELLOW}💡 Vérifiez que :${NC}"
    echo -e "• Le domaine $DOMAIN pointe vers ce serveur"
    echo -e "• Les ports 80 et 443 sont ouverts"
    echo -e "• Aucun autre service n'utilise ces ports"
    exit 1
fi 