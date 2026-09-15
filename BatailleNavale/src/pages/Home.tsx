import "./Home.css";

function Home() {
  const handleCreateGame = () => {
    // Implémentation à venir
    console.log("Créer une partie");
  };

  const handleCurrentGames = () => {
    // Implémentation à venir
    console.log("Voir les parties en cours");
  };

  const handleHistory = () => {
    // Implémentation à venir
    console.log("Voir l'historique");
  };

  return (
    <main className="home">
      <div className="home-background" />

      <section className="home-container">
        <header className="home-header">
          <span className="game-badge">GAME HUB</span>

          <h1>
            Prêt à <span>jouer ?</span>
          </h1>

          <p>
            Créez une partie, rejoignez une partie en cours
            ou consultez votre historique.
          </p>
        </header>

        <section className="game-actions">
          <button
            className="action-card action-card-primary"
            onClick={handleCreateGame}
          >
            <div className="action-icon">＋</div>

            <div className="action-content">
              <h2>Créer une partie</h2>
              <p>Lancez une nouvelle partie et invitez vos joueurs.</p>
            </div>

            <span className="action-arrow">→</span>
          </button>

          <button
            className="action-card"
            onClick={handleCurrentGames}
          >
            <div className="action-icon">◉</div>

            <div className="action-content">
              <div className="action-title">
                <h2>Parties en cours</h2>
                <span className="online-indicator">EN DIRECT</span>
              </div>

              <p>
                Retrouvez les parties actuellement disponibles.
              </p>
            </div>

            <span className="action-arrow">→</span>
          </button>

          <button
            className="action-card"
            onClick={handleHistory}
          >
            <div className="action-icon">◷</div>

            <div className="action-content">
              <h2>Historique</h2>
              <p>Consultez vos anciennes parties et leurs résultats.</p>
            </div>

            <span className="action-arrow">→</span>
          </button>
        </section>

        <footer className="home-footer">
          <span>GAME HUB</span>
          <span>•</span>
          <span>Votre espace de jeu</span>
        </footer>
      </section>
    </main>
  );
}

export default Home;