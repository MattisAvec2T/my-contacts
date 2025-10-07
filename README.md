# Projet MyContacts 👥

Ce mini-projet simule un annuaire de contact. Il utilise une API Express avec une base de données MongoDB et un client React.

---

## 🚀 Endpoints du serveur

La documentation complète de l’API est disponible via Swagger à l’endpoint :  
👉 **[`/api-docs`](https://my-contacts-hzol.onrender.com/api/docs)**

### 🔐 Auth Routes (`/auth`)

| Méthode | Endpoint | Description |
|----------|-----------|--------------|
| `POST` | `/auth/register` | Inscription d’un nouvel utilisateur |
| `POST` | `/auth/login` | Connexion d’un utilisateur existant |

### 👥 Contact Routes (`/contact`)

> ⚠️ Toutes les routes dans `/contact` nécessite l'authentification de l'utilisateur.

| Méthode | Endpoint | Description |
|----------|-----------|--------------|
| `GET` | `/contact/` | Récupère tous les contacts de l’utilisateur connecté |
| `POST` | `/contact/` | Crée un nouveau contact |
| `PATCH` | `/contact/:id` | Met à jour un contact existant |
| `DELETE` | `/contact/:id` | Supprime un contact existant |

---

## 📦 Installation & Usage

> Le projet est en ligne sur [Render](https://my-contacts-hzol.onrender.com/)
> - URL client : https://my-contacts-f7ae.onrender.com
> - URL server : https://my-contacts-hzol.onrender.com (doit être préchargé car est host sur Render)

### Cloner le répo
```bash
git clone https://github.com/MattisAvec2T/my-contacts
```

### Création de l'environnement

À exécuter dans `~/my-contacts/`
```bash
#Creation du fichier .env cote client
cat <<EOF > client/.env

VITE_SERVER_API_URL=http://localhost:3000

EOF
```
```bash
#Creation du fichier .env cote server
cat <<EOF > server/.env

PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=CleVraimentTresSecrete
JWT_EXPIRES=2000000
SERVER_URL=http://localhost:3000

EOF
```
> Adapter les valeurs selon l'environnement que vous utilisez.

### Lancement en local
```bash
# Lancement du serveur
cd server
npm install
npm run start
```
```bash
# Lancement du client
cd client
npm install
npm run dev
```

---

## 🔐 Tests

### Lancer les tests

> S'assurer d'être dans le dossier `~/my-contacts/server/`

```bash
# Exécuter tous les tests
npm test
```

```bash
# Mode watch (re-exécute les tests à chaque modification)
npm run test:watch
```

```bash
# Générer un rapport de couverture
npm run test:coverage
```

### Structure des tests

```
tests/
├── unit/
│   ├── controllers/
│   │   ├── auth.controller.test.js
│   │   └── contact.controller.test.js
│   ├── middlewares/
│   │   ├── auth.middleware.test.js
│   │   ├── validator.middleware.test.js
│   │   └── error.middleware.test.js
│   ├── services/
│   │   └── auth.service.test.js
│   └── repositories/
│       ├── user.repository.test.js
│       └── contact.repository.test.js
├── helpers/
│   └── test-utils.js
└── setup.js
```