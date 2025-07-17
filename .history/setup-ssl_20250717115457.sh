#!/bin/bash

echo "🔒 Configuration SSL Let's Encrypt pour astofinito.store"
echo "======================================================="

# Configuration
DOMAIN="astofinito.store"
WWW_DOMAIN="www.astofinito.store"
EMAIL="your-email@example.com"  # CHANGEZ PAR VOTRE EMAIL

echo "📋 Configuration:"
echo "   - Domaine principal: $DOMAIN"
echo "   - Domaine www: $WWW_DOMAIN" 
echo "   - Email: $EMAIL"
echo ""

# Vérification que le domaine pointe vers ce serveur
echo "🔍 Vérification DNS..."
CURRENT_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN)

echo "   - IP du serveur: $CURRENT_IP"
echo "   - IP du domaine: $DOMAIN_IP"

if [ "$CURRENT_IP" != "$DOMAIN_IP" ]; then
    echo "⚠️  ATTENTION: Le domaine ne pointe pas vers ce serveur!"
    echo "   Configurez votre DNS pour pointer $DOMAIN vers $CURRENT_IP"
    echo "   Voulez-vous continuer quand même? (y/N)"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Arrêt du script"
        exit 1
    fi
fi

# Arrêt des services Docker pour libérer les ports
echo "⏹️  Arrêt temporaire des services Docker..."
docker-compose down

# Installation de Certbot
echo "📦 Installation de Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Test de connectivité
echo "🌐 Test de connectivité vers Let's Encrypt..."
if ! curl -s https://acme-v02.api.letsencrypt.org/directory > /dev/null; then
    echo "❌ Impossible de contacter Let's Encrypt"
    exit 1
fi
echo "✅ Connectivité OK"

# Création d'une config Nginx temporaire pour la validation
echo "⚙️  Création de la configuration Nginx temporaire..."
mkdir -p /tmp/nginx-temp
cat > /tmp/nginx-temp/temp.conf << EOL
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 "Validation en cours...";
        add_header Content-Type text/plain;
    }
}
EOL

# Démarrage de Nginx temporaire
echo "🚀 Démarrage de Nginx temporaire..."
docker run -d --name nginx-temp \
    -p 80:80 \
    -v /tmp/nginx-temp:/etc/nginx/conf.d \
    -v ./data/certbot/www:/var/www/certbot \
    nginx:alpine

sleep 5

# Test que Nginx répond
if ! curl -s http://localhost > /dev/null; then
    echo "❌ Nginx temporaire ne répond pas"
    docker logs nginx-temp
    exit 1
fi

echo "✅ Nginx temporaire démarré"

# Obtention du certificat SSL
echo "🔐 Obtention du certificat SSL..."
echo "   Cela peut prendre quelques minutes..."

# Dry run d'abord pour tester
echo "🧪 Test de validation (dry-run)..."
if certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --dry-run \
    -d $DOMAIN \
    -d $WWW_DOMAIN; then
    echo "✅ Test de validation réussi"
else
    echo "❌ Test de validation échoué"
    docker stop nginx-temp && docker rm nginx-temp
    exit 1
fi

# Obtention réelle du certificat
echo "🎯 Obtention du certificat réel..."
if certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d $WWW_DOMAIN; then
    echo "✅ Certificat SSL obtenu avec succès!"
else
    echo "❌ Échec de l'obtention du certificat"
    docker stop nginx-temp && docker rm nginx-temp
    exit 1
fi

# Arrêt du Nginx temporaire
echo "🛑 Arrêt du Nginx temporaire..."
docker stop nginx-temp && docker rm nginx-temp
rm -rf /tmp/nginx-temp

# Vérification des certificats
echo "🔍 Vérification des certificats..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificat trouvé: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep "Subject:"
else
    echo "❌ Certificat non trouvé"
    exit 1
fi

# Mise à jour des permissions pour Docker
echo "🔑 Configuration des permissions..."
chmod -R 755 /etc/letsencrypt/
chown -R root:root /etc/letsencrypt/

# Redémarrage des services Docker avec HTTPS
echo "🚀 Redémarrage des services avec HTTPS..."
docker-compose up -d

echo "⏳ Attente du démarrage (30s)..."
sleep 30

# Vérification que tout fonctionne
echo "🧪 Tests finaux..."
if curl -s https://$DOMAIN/api/health > /dev/null; then
    echo "✅ HTTPS fonctionne!"
else
    echo "⚠️  HTTPS ne répond pas encore, vérifiez les logs:"
    docker-compose logs nginx
fi

# Configuration du renouvellement automatique
echo "🔄 Configuration du renouvellement automatique..."
echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook \"docker-compose -f $(pwd)/docker-compose.yml restart nginx\"" | crontab -

echo ""
echo "🎉 Configuration SSL terminée!"
echo "🌍 Votre site est accessible sur:"
echo "   - https://$DOMAIN"
echo "   - https://$WWW_DOMAIN"
echo ""
echo "📋 Informations importantes:"
echo "   - Certificats stockés dans: /etc/letsencrypt/live/$DOMAIN/"
echo "   - Renouvellement automatique configuré (cron daily à 12h)"
echo "   - Validité du certificat: 90 jours"
echo ""
echo "🔍 Pour vérifier le statut SSL:"
echo "   curl -I https://$DOMAIN"
echo "   openssl s_client -connect $DOMAIN:443 -servername $DOMAIN" 