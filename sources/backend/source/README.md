<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

---
---


# Description des fichiers



## Les fichiers sources

```
src/
	├── app.module.ts
	└── main.ts
```

- **`app.module.ts`** Le point d'entrée de votre application, où vous importez tous les modules et les providers nécessaires.
- **`main.ts`**: Le fichier d'amorçage de l'application, où vous démarrez le serveur.

## Common

Ce dossier contient les élèments communs du projets, utilisés a travers tout le projet.

Les diffénts dossiers sont a créer en fonction des besoins

```
common/
	├── providers/
	├── middleware/
	├── filters/
	├── guards/
	├── decorators/
	├── exceptions/
	└── pipes/
```

- `**providers**`:
- **`middleware`**:
- **`filters`**: Les filtres, qui sont utilisés pour intercepter les requêtes avant qu'elles n'atteignent les contrôleurs.
- **`guards`**: Les gardes, qui sont utilisés pour protéger les routes en fonction de certaines conditions.
- **`decorators`**:
- `**exceptions**`:
- **`pipes`**: Les pipes, qui sont utilisés pour valider et transformer les données entrantes avant qu'elles n'atteignent les contrôleurs.

## Config

Ce dossier contient les fichiers de configuration de votre application.

```
config/
	├── configuration.ts
	└── database.ts
```

- **`configuration.ts`**: Le fichier de configuration global, qui contient les variables d'environnement et autres paramètres.
- **`database.ts`**: Le fichier de configuration de la base de données, qui contient les informations de connexion.

## Modules

Ce dossier contient tous les modules de l’application, qui representent les fonctionnalités principales.

```
modules/
	├── auth/
	├── users/
	├── posts/
	└── comments/
```

- **`auth`**: Le module d'authentification, qui gère la connexion et la déconnexion des utilisateurs…

## Shared

Ce dossier contient des éléments partagés qui **peuvent être utilisés à travers différents modules et fonctionnalités** de votre application.

```
shared/
	├── constants.ts
	├── decorators.ts
	├── enums.ts
	├── interfaces.ts
	└── utils.ts
```

- **`constants.ts`**: Les constantes, qui sont utilisées pour stocker des valeurs qui ne changent pas.
- **`decorators.ts`**: Les décorateurs, qui sont utilisés pour ajouter des fonctionnalités supplémentaires aux classes, méthodes et propriétés.
- **`enums.ts`**: Les énumérations, qui sont utilisées pour représenter des ensembles de valeurs prédéfinies.
- **`interfaces.ts`**: Les interfaces, qui sont utilisées pour définir des types et des structures de données complexes.
- **`utils.ts`**: Les utilitaires, qui sont des fonctions réutilisables qui peuvent être utilisées à travers différents modules et fonctionnalités de votre application.


----

C reate = [PUT]
R ead = [GET]
U pdate = [POST]
D elete = [DELETE]

- users
	- [GET] Récupération de la liste des utilisateurs ✅
    - [PUT] Creation d’un utilisateur ✅
- users/{id}
    - [GET] 🔒 Recuperation d’un utilisateur 
    - [POST] 🔒 Edition d’un utilisateur 
    - [DELETE] 🔒 Suppression d’un utilisateur 
- users/{id}/friend
    - [POST] 🔒 Ajout d'un ami
    - [DELETE] 🔒 Suppression d'un ami
    - [GET] 🔒 Récupération de la liste des amis
- users/{id}/block
    - [POST] 🔒 Ajout d'un utilisateur à la liste des utilisateurs bloqués
    - [DELETE] 🔒 Suppression d'un utilisateur de la liste des utilisateurs bloqués
    - [GET] 🔒 Récupération de la liste des utilisateurs bloqués
- users/{id}/stats
    - [GET] 🔒 Récupération des statistiques d'un utilisateur
    - [POST] 🔒 Mise à jour des statistiques d'un utilisateur
- users/{id}/messages
    - [GET] 🔒 Récupération de la liste des conversations privées
    - [PUT] 🔒 Création d'une conversation privée
- users/leaderboard
	- [GET] Recuperation de la liste des utilisateurs avec des informations de jeu
---
- auth/login
    - [POST] Connexion d'un utilisateur ✅
- auth/logout 🔒 (surement pas besoin de route)
    - [POST] Déconnexion de l'utilisateur
---
- tchat/channel
    - [PUT] 🔒 Création d'un canal de discussion
    - [GET] 🔒 Récupération des informations d'un canal de discussion
    - [POST] 🔒 Modification des informations d'un canal de discussion
        - Modification uniquement par le propritetaire du canal
    - [DELETE] 🔒 Suppression d'un canal de discussion
        - Modification uniquement par le propritetaire du canal
- tchat/channels/{id}/join
    - [POST] 🔒 Rejoindre un canal de discussion
- tchat/channels/{id}/leave
    - [POST] 🔒 Quitter un canal de discussion
- tchat/channel/{id}/message
    - [PUT] 🔒 Envoi d'un message sur un canal de discussion
    - [GET] 🔒 Récupération de la liste des messages d'un canal de discussion
- tchat/channels
    - [GET] 🔒 Récupération de la liste des canaux de discussion
---
- game/matchmaking
    - [POST] 🔒 Ajout d'un utilisateur dans la file d'attente de matchmaking
    - [DELETE] 🔒 Suppression d'un utilisateur de la file d'attente de matchmaking
- game/match
    - [PUT] 🔒 Création d'une partie avec les joueurs dans la file d'attente de matchmaking
    - [GET] Récupération des informations d'une partie
    - [PUT] 🔒 Mise à jour des informations d'une partie
    - [DELETE] 🔒 Suppression d'une partie.
- game/matches
    - [GET] Récupération de la liste des parties avec le score et le classement des joueurs



--- 
Pour compiler les images a nouveau dans le frontend
```shell
npm run build
```