// Fonction pour charger le contenu d'une page
function loadPage(pageName) {
  const contentContainer = document.getElementById('content-container');

  // Afficher un message de chargement
  contentContainer.innerHTML = '<p>Chargement...</p>';

  // Charger le contenu depuis le dossier pages
  fetch(`/pages/${pageName}.html`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      return response.text();
    })
    .then(html => {
      contentContainer.innerHTML = html;

    })
    .catch(error => {
      contentContainer.innerHTML = `
        <div class="alert alert-danger">
          <h3>Erreur de chargement</h3>
          <p>${error.message}</p>
        </div>
      `;
    });
}

// Ajouter les écouteurs d'évenements aux boutons
document.addEventListener('DOMContentLoaded', function() {
  const btnIndex = document.getElementById('btn-index');

  if (btnIndex) {
    btnIndex.addEventListener('click', () => loadPage('index'));
  }

  // Charger la page index par défaut au démarrage
  loadPage('index');
});
