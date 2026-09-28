# Bataille Navale

Le front React utilise le serveur générique situé dans `../../game-server`.
Les comptes, les parties et les états de jeu sont stockés côté serveur ; le
navigateur ne conserve que le jeton de session (`Bearer`).

## Démarrage local

Dans un terminal :

```sh
cd ../../game-server
deno task dev
```

Dans un second terminal :

```sh
npm install
npm run dev
```

Le front attend le serveur sur `http://localhost:8000`. Pour utiliser une
autre adresse, créez un fichier `.env.local` dans ce dossier :

```sh
VITE_GAME_SERVER_URL=http://localhost:8000
```

Un joueur crée une partie, invite le compte de son adversaire, puis le
créateur démarre. Les deux joueurs placent leur flotte à tour de rôle ; les
tirs et le résultat sont ensuite synchronisés par le serveur.
