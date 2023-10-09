Dossier source du frontend, contenant le code de l'application React.
Une fois compilé, via `npm run build`, le code est copié dans le dossier `client` du backend.

## Structure du dossier React
```
src/
├── components/             // Répertoire pour les composants réutilisables
│   ├── common/				// Répertoire pour les composants de base
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Input.module.css
│   │   └── ...
│   ├── modules/			// Répertoire pour les composants propres à l'application
│   │   ├── ProductTable/
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductTable.module.css
│   │   ├── AuthForm/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── AuthForm.module.css
│   │   └── ...
│   ├── layouts/                // Répertoire pour les elements récurrentes de mise en page
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.module.css
│   │   ├── Footer/
│   │   │   ├── Footer.tsx
│   │   │   ├── Footer.module.css
│   │   └── ...
├── hooks/                  // Répertoire pour les hooks personnalisés
│   ├── useAuth/
│   │   ├── useAuth.ts
│   ├── useModal/
│   │   ├── useModal.ts
│   └── ...
├── pages/                  // Répertoire pour les pages
│   ├── HomePage/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.module.css
│   ├── LoginPage/
│   │   ├── LoginPage.tsx
│   │   ├── LoginPage.module.css
│   └── ...
├── services/               // Répertoire pour les services
│   ├── auth.ts
│   ├── game.ts
│   └── ...
├── types/                  // Répertoire pour les interfaces et types
│   ├── AuthTypes.ts
│   ├── ButtonTypes.ts
│   ├── InputTypes.ts
│   └── ...
├── lib/					// Répertoire pour les fonctions utilitaires  (Creer au besoin)
├── App.tsx                 // Point d'entrée de l'application
├── index.tsx               // Point d'entrée pour le rendu dans le DOM
├── routes.tsx              // Configuration des routes de l'application
└── ...
```