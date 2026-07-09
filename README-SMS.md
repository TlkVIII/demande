Envoi de SMS via Twilio

1) Installer les dépendances et lancer le serveur local :

```bash
cd projetsitedemande2
npm install
npm start
```

2) Définir les variables d'environnement (Linux / macOS) :

```bash
export TWILIO_ACCOUNT_SID=ACxxxx
export TWILIO_AUTH_TOKEN=your_auth_token
export TWILIO_FROM=+1555xxxxxxx
```

Sur Windows PowerShell :

```powershell
$env:TWILIO_ACCOUNT_SID = 'ACxxxx'
$env:TWILIO_AUTH_TOKEN = 'your_auth_token'
$env:TWILIO_FROM = '+1555xxxxxxx'
npm start
```

3) Le client (navigateur) appelle `POST /send-sms` pour déclencher l'envoi. Le serveur doit être accessible depuis la page (localhost:3000 par défaut).

Remarque : Twilio requiert un numéro expéditeur valide et parfois un compte configuré pour les numéros locaux. Tu peux aussi utiliser une autre API SMS (Twilio, Vonage, etc.) en adaptant `server.js`.
