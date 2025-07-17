# 🌐 Vérification DNS pour astofinito.store

## ✅ Configuration requise chez OVH

Dans votre interface OVH, configurez ces enregistrements DNS :

```
Type    Nom     Valeur              TTL     Statut
A       @       188.165.53.185      300     ✅ Obligatoire
A       www     188.165.53.185      300     ✅ Obligatoire
AAAA    @       2001:41d0:301::21   300     📝 Optionnel (IPv6)
AAAA    www     2001:41d0:301::21   300     📝 Optionnel (IPv6)
```

## 🔍 Commandes de vérification

### Sur votre machine locale, testez :

```bash
# Vérification de base
dig astofinito.store +short

# Vérification www
dig www.astofinito.store +short

# Vérification IPv6 (optionnel)
dig astofinito.store AAAA +short

# Test avec nslookup
nslookup astofinito.store
nslookup www.astofinito.store
```

### Résultats attendus :

```bash
$ dig astofinito.store +short
188.165.53.185

$ dig www.astofinito.store +short  
188.165.53.185
```

## ⏰ Temps de propagation

- **TTL 300** = 5 minutes maximum
- **Propagation mondiale** = 24-48h maximum
- **Vérification en ligne** : https://dnschecker.org

## 🚨 Problèmes courants

### DNS ne répond pas :
```bash
# Vérifiez avec différents serveurs DNS
dig @8.8.8.8 astofinito.store +short
dig @1.1.1.1 astofinito.store +short
dig @208.67.222.222 astofinito.store +short
```

### Ancien cache DNS :
```bash
# Videz le cache DNS local
sudo dscacheutil -flushcache  # macOS
sudo systemctl restart systemd-resolved  # Ubuntu
ipconfig /flushdns  # Windows
```

## ✅ Checklist pré-déploiement

- [ ] Enregistrement A configuré pour `@`
- [ ] Enregistrement A configuré pour `www`
- [ ] DNS répond avec la bonne IP : `188.165.53.185`
- [ ] Test depuis plusieurs sources
- [ ] Attendre 5-10 minutes après modification

## 🎯 Une fois le DNS confirmé

Lancez le déploiement sur votre serveur :

```bash
# Connectez-vous à votre serveur
ssh root@188.165.53.185

# Clonez le projet
git clone <your-repo-url>
cd tp-secu

# Lancez le déploiement automatique
./deploy.sh
```

## 📞 Support

Si le DNS ne fonctionne pas :

1. **Vérifiez** dans l'interface OVH que les enregistrements sont bien sauvegardés
2. **Attendez** 5-10 minutes après toute modification
3. **Testez** avec `dig astofinito.store +short`
4. **Vérifiez** avec dnschecker.org

---

**🎯 Objectif : `dig astofinito.store +short` doit retourner `188.165.53.185`** 