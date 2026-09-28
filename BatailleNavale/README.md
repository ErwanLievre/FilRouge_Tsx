# Bataille Navale

Jeu de bataille navale pour deux joueurs sur le même écran, réalisé avec React,
TypeScript et Vite. Les joueurs partagent l'écran et jouent à tour de rôle : ils
placent leur flotte, puis tirent sur le plateau adverse. Le premier qui coule
tous les bateaux de l'autre gagne.

## Règles et déroulement

- Connectez-vous ou créez un compte, puis ouvrez **Parties** et choisissez
  **Nouvelle partie**.
- La partie se joue sur deux plateaux de 8 lignes et 12 colonnes.
- Chaque joueur place 8 bateaux, de tailles 2, 2, 3, 3, 3, 4, 4 et 5 cases.
  Choisissez une orientation horizontale ou verticale, puis cliquez sur une
  case pour placer le bateau. Les bateaux peuvent se toucher, mais ne peuvent
  pas se chevaucher ni dépasser du plateau.
- Le joueur 1 place sa flotte en premier. Ensuite, passez l'écran au joueur 2
  et cliquez sur **Je suis le Joueur 2, je suis prêt**. Le plateau du joueur 1
  est caché pendant le placement de la seconde flotte.
- Une fois les deux flottes placées, les joueurs tirent chacun leur tour sur
  une case du plateau adverse. Les tirs déjà effectués ne peuvent pas être
  rejoués. Les cases indiquent les tirs manqués, les bateaux touchés et les
  bateaux coulés.
- La partie se termine quand toute la flotte d'un joueur a été coulée. Les
  parties terminées apparaissent dans **Historique** ; une partie en cours peut
  être arrêtée depuis **Parties**.

## Lancer l'application

Installez les dépendances et lancez le serveur de développement depuis le
dossier du projet :

```sh
npm install
npm run dev
```

Vite affiche l'adresse locale à ouvrir dans le navigateur (généralement
`http://localhost:5173`).

## Données

Les comptes et les parties sont enregistrés dans le stockage local du
navigateur. Les données restent donc sur le navigateur utilisé et ne sont pas
synchronisées entre appareils. Effacer les données du navigateur supprimera
également les comptes et parties enregistrés.
