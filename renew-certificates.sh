#!/bin/bash

# Script de renouvellement automatique des certificats Let's Encrypt
# À utiliser avec cron pour automatiser le processus

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Renouvellement des certificats Let's Encrypt${NC}"

# Vérification que Docker Compose est disponible
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Tentative de renouvellement
echo -e "${YELLOW}📜 Tentative de renouvellement...${NC}"
docker-compose run --rm certbot renew

# Récupération du code de sortie
CERTBOT_EXIT_CODE=$?

if [ $CERTBOT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Renouvellement réussi${NC}"
    
    # Rechargement de Nginx pour prendre en compte les nouveaux certificats
    echo -e "${YELLOW}🔄 Rechargement de Nginx...${NC}"
    docker-compose restart nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx rechargé avec succès${NC}"
        echo -e "${GREEN}🎉 Renouvellement terminé !${NC}"
    else
        echo -e "${RED}❌ Erreur lors du rechargement de Nginx${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}ℹ️  Aucun certificat à renouveler${NC}"
fi

# Affichage des informations sur les certificats
echo -e "\n${YELLOW}📋 État des certificats :${NC}"
docker-compose run --rm certbot certificates

echo -e "\n${GREEN}✨ Script terminé${NC}" 