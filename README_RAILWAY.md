Railway deployment guide

## Problème SMTP sur Railway

Sur les plans **Free / Trial / Hobby**, Railway **bloque les connexions SMTP** (ports 25, 465, 587).
C’est pour ça que Gmail renvoie une erreur `SMTP connection timeout` même avec les bons identifiants.

**Solution recommandée (gratuite) : Resend** — envoi par API HTTPS (port 443), jamais bloqué.

## Configuration Resend (5 minutes)

1. Crée un compte sur https://resend.com (gratuit : 3000 emails/mois)
2. Va dans **API Keys** → **Create API Key**
3. Dans Railway → **Variables**, ajoute :
   - `RESEND_API_KEY` = ta clé `re_...`
   - `RESEND_FROM` = `Réservation <onboarding@resend.dev>`
   - `DEFAULT_TO_EMAIL` = l’adresse qui reçoit les notifications
4. **Important (sans domaine vérifié)** : Resend n’envoie qu’à l’adresse email de ton compte Resend.
   Inscris-toi avec la même adresse que `DEFAULT_TO_EMAIL`, ou vérifie un domaine dans Resend.
5. Redéploie le service Railway après avoir ajouté les variables.

Tu peux laisser les variables SMTP Gmail — elles seront ignorées tant que `RESEND_API_KEY` est définie.

## Déploiement Railway

1. Push le repo sur GitHub
2. Railway → **New Project** → **Deploy from GitHub**
3. Configure les variables d’environnement (voir ci-dessus)
4. Railway fournit une URL publique (ex. `https://demande-production.up.railway.app`)
5. Vérifie que `PROD_BACKEND` dans `script.js` pointe vers cette URL

## Test

- Ouvre le site, confirme une activité
- Consulte les logs Railway (Deployments → Logs) en cas d’erreur

## Développement local

En local, tu peux utiliser Gmail SMTP sans Resend :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ton@gmail.com
SMTP_PASS=mot_de_passe_application
SMTP_FROM=ton@gmail.com
DEFAULT_TO_EMAIL=destinataire@example.com
```

Lance `npm start` puis teste avec `node tools/send_test_email.js`.

## Upgrade Railway Pro (alternative payante)

Le plan Pro débloque SMTP. Railway recommande quand même Resend pour les analytics et la fiabilité.
