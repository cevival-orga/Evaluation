// Variables globales
let pixelSize = 32; // taille des pixels (plus grand = plus pixelisé)
const MAX_LIVES = 7;
let lives = MAX_LIVES;
let itemImg = null;
let pixelCanvas = null;
let pixelCtx = null;
let originalImage = null;
let currentItem = null;
let currentItemName = null;
let allItems = []; // Liste de tous les items pour l'autocomplétion
let wrongGuesses = []; // Liste des mauvaises réponses

function iconUrl64(iconName) {
  if (!iconName) return "";
  const fileName = String(iconName).replace(/ /g, "_"); // replace spaces
  return `images/64px-images/64px-${fileName}.webp`;
}

function iconUrl192(iconName) {
  if (!iconName) return "";
  const fileName = String(iconName).replace(/ /g, "_"); // replace spaces
  return `images/192px-images/192px-${fileName}.webp`;
}

// Fonction pour pixeliser une image
function pixelateImage(pixelationLevel) {
  if (!pixelCanvas || !pixelCtx || !originalImage) return;

  const width = pixelCanvas.width;
  const height = pixelCanvas.height;

  // Efface le canvas
  pixelCtx.clearRect(0, 0, width, height);

  if (pixelationLevel <= 1) {
    // Pas de pixelisation, affiche l'image normale
    pixelCtx.imageSmoothingEnabled = true;
    pixelCtx.drawImage(originalImage, 0, 0, width, height);
    return;
  }

  // Dessine l'image en petite taille puis la redimensionne pour l'effet pixel
  const smallWidth = Math.max(1, Math.floor(width / pixelationLevel));
  const smallHeight = Math.max(1, Math.floor(height / pixelationLevel));

  // Utiliser un canvas offscreen pour éviter un petit rendu en haut à gauche
  const offscreen = document.createElement("canvas");
  offscreen.width = smallWidth;
  offscreen.height = smallHeight;
  const octx = offscreen.getContext("2d");
  octx.imageSmoothingEnabled = false;

  // Dessiner l'image originale réduite dans l'offscreen
  octx.drawImage(originalImage, 0, 0, smallWidth, smallHeight);

  // Désactiver le lissage et peindre l'offscreen étiré sur le canvas principal
  pixelCtx.imageSmoothingEnabled = false;
  pixelCtx.drawImage(
    offscreen,
    0,
    0,
    smallWidth,
    smallHeight,
    0,
    0,
    width,
    height
  );
}

// Fonction pour charger et choisir un item aléatoire
async function getRandomItemImageUrl() {
  try {
    const response = await fetch("data/datas.json");
    const datas = await response.json();
    const resChoice = await fetch("data/daily.json")
    const data_choice = await resChoice.json();

    // Charge l'item depuis daily.kson
    const ItemName = data_choice['splash'];

    // Stocke l'item actuel
    currentItem = {
      name: ItemName,
      data: datas[ItemName],
    };

    // Retourne l'objet avec le nom et l'URL
    const iconName = datas[ItemName].icon.replace(/ /g, "_");
    return {
      item: ItemName,
      url: iconUrl192(iconName),
    };
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return null;
  }
}

// Fonction pour charger une image aléatoire dans l'élément splash-image
async function loadRandomImage() {
  const result = await getRandomItemImageUrl();

  if (result) {
    // Stocke le nom de l'item
    currentItemName = result.item;

    // Charge l'image originale
    originalImage = new Image();
    originalImage.crossOrigin = "anonymous";
    originalImage.onload = function () {
      // Applique la pixelisation initiale
      pixelateImage(pixelSize);
      console.log("Image chargée et pixelisée:", result.item);
    };
    originalImage.src = result.url;
  }
}

// Fonction pour charger la liste des items
async function loadItemsList() {
  try {
    const response = await fetch("data/datas.json");
    const datas = await response.json();
    allItems = Object.keys(datas);
  } catch (error) {
    console.error("Erreur lors du chargement de la liste des items:", error);
  }
}

// Fonction pour filtrer et afficher les suggestions
function showSuggestions(input, suggestionsDiv) {
  const searchValue = input.value.trim().toLowerCase();

  // Vide les suggestions si l'input est vide
  if (searchValue === "") {
    suggestionsDiv.innerHTML = "";
    suggestionsDiv.style.display = "none";
    return;
  }

  // Filtre les items qui correspondent à la recherche ET qui ne sont pas dans wrongGuesses
  const filtered = allItems.filter(
    (item) =>
      item.toLowerCase().includes(searchValue) && !wrongGuesses.includes(item)
  );

  // Limite à 10 suggestions maximum
  const suggestions = filtered.slice(0, 10);

  // Affiche les suggestions
  if (suggestions.length > 0) {
    suggestionsDiv.innerHTML = suggestions
      .map(
        (item) =>
          `<div class="suggestion-item"><img style="margin-right: 8px; vertical-align: middle; object-fit: contain;" src="${iconUrl64(
            item
          )}" alt="${item}" class="guess-img">${item}</div>`
      )
      .join("");
    suggestionsDiv.style.display = "block";

    // Ajoute les événements de clic sur chaque suggestion
    const suggestionItems = suggestionsDiv.querySelectorAll(".suggestion-item");
    suggestionItems.forEach((item) => {
      item.addEventListener("click", () => {
        input.value = item.textContent;
        suggestionsDiv.innerHTML = "";
        suggestionsDiv.style.display = "none";
      });
    });
  } else {
    suggestionsDiv.innerHTML = "";
    suggestionsDiv.style.display = "none";
  }
}

// Fonction pour mettre à jour l'affichage des vies
function updateLivesDisplay() {
  const livesSpan = document.getElementById("splash-lives");
  const livesHearts = document.getElementById("splash-lives-hearts");
  if (livesSpan) {
    livesSpan.textContent = lives;
  }
  if (livesHearts) {
    livesHearts.textContent =
      "❤️".repeat(Math.max(0, lives)) +
      "🤍".repeat(Math.max(0, MAX_LIVES - lives));
  }
}

// Fonction pour créer des confettis de victoire
function createConfetti() {
  const emojis = ["🎉", "✨", "🎊", "🎆", "👏", "🎁"];
  const confettiCount = 40;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 0.3 + "s";
    confetti.style.animationDuration = Math.random() * 2 + 2 + "s";
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
  }
}

// Fonction pour créer des particules de défaite
function createDefeatParticles() {
  const emojis = ["💀", "💔", "😭", "⚠️"];
  const particleCount = 25;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "defeat-particle";
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.animationDelay = Math.random() * 0.5 + "s";
    particle.style.animationDuration = Math.random() * 1.5 + 2 + "s";
    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 3500);
  }
}

// Fonction pour ajouter une tentative à l'affichage
async function addGuessToDisplay(itemName, isCorrect) {
  const guessesContainer = document.getElementById("splash-guesses");
  if (!guessesContainer) return;

  // Récupère les données pour obtenir l'icône
  try {
    const response = await fetch("data/datas.json");
    const datas = await response.json();
    const itemData = datas[itemName];

    if (!itemData) {
      console.error("Item non trouvé dans les données:", itemName);
      return;
    }

    // Crée l'élément de tentative
    const guessElement = document.createElement("div");
    guessElement.className = "guess-item";

    // Construit l'URL de l'image
    const iconName = itemData.icon.replace(/ /g, "_");
    const imageUrl = iconUrl64(iconName);

    // Icône et couleur selon le résultat
    const resultIcon = isCorrect ? "✓" : "✗";
    const resultClass = isCorrect ? "correct" : "wrong";

    guessElement.innerHTML = `
      <img src="${imageUrl}" alt="${itemName}" class="guess-img">
      <span class="guess-name">${itemName}</span>
      <span class="guess-result ${resultClass}">${resultIcon}</span>
    `;

    // Ajoute au début pour afficher le dernier guess en premier
    guessesContainer.prepend(guessElement);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tentative:", error);
  }
}

// Fonction pour vérifier la réponse
function checkAnswer() {
  const input = document.getElementById("splash-input");
  const submitBtn = document.getElementById("splash-submit");
  const guess = input.value.trim();

  // Vérifie si l'input n'est pas vide
  if (guess === "") {
    console.log("Veuillez entrer un item");
    return;
  }

  // Vérifie si le jeu est déjà terminé
  if (input.disabled) {
    return;
  }

  // Vérifie si l'item a déjà été tenté
  if (wrongGuesses.includes(guess)) {
    console.log("⚠️ Tu as déjà essayé cet item !");
    input.value = "";
    return;
  }

  // Vérifie si la réponse est correcte
  if (guess === currentItemName) {
    // Bonne réponse - révèle l'image complètement
    pixelateImage(1);
    addGuessToDisplay(guess, true);

    // Affiche la modal de victoire
    const resultModal = document.getElementById("splash-result");
    const resultTitle = document.getElementById("splash-result-title");
    const resultMessage = document.getElementById("splash-result-message");
    const resultLives = document.getElementById("splash-result-lives");

    if (resultModal && resultTitle && resultMessage && resultLives) {
      resultTitle.innerHTML =
        '<span style="font-size: 3rem;">🎉</span><br>Correct!';
      resultMessage.textContent = `The item was ${currentItemName}.`;
      resultLives.textContent = String(lives);
      resultModal.classList.remove("hidden");
      resultModal.classList.add("victory");

      // Lance les confettis de victoire
      createConfetti();
    }
    input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    console.log("🎉 Bravo ! Tu as trouvé le bon item : " + currentItemName);
  } else {
    // Mauvaise réponse - ajoute à la liste des mauvaises réponses
    wrongGuesses.push(guess);
    addGuessToDisplay(guess, false);

    // Perd une vie
    lives = Math.max(0, lives - 1);
    updateLivesDisplay();

    // Calcule la pixelisation en fonction des vies perdues (32 -> 4 en 7 vies pour max difficulté)
    const livesLost = MAX_LIVES - lives;
    pixelSize = Math.max(4, Math.floor(32 - livesLost * (28 / MAX_LIVES)));

    if (lives > 0) {
      // Il reste des vies - dé-pixelise progressivement
      pixelateImage(pixelSize);
      console.log(
        "❌ Mauvaise réponse ! Il te reste " +
          lives +
          " vie(s). Pixel size: " +
          pixelSize
      );
    } else {
      // Plus de vies - révèle complètement
      pixelateImage(1);

      // Affiche la modal de défaite
      const resultModal = document.getElementById("splash-result");
      const resultTitle = document.getElementById("splash-result-title");
      const resultMessage = document.getElementById("splash-result-message");
      const resultLives = document.getElementById("splash-result-lives");

      if (resultModal && resultTitle && resultMessage && resultLives) {
        resultTitle.innerHTML =
          '<span style="font-size: 3rem;">💀</span><br>Out of lives!';
        resultMessage.textContent = `The item was ${currentItemName}.`;
        resultLives.textContent = String(lives);
        resultModal.classList.remove("hidden");
        resultModal.classList.add("defeat");

        // Lance les particules de défaite
        createDefeatParticles();
      }
      input.disabled = true;
      if (submitBtn) submitBtn.disabled = true;
      console.log(
        "💔 Dommage ! C'était : " +
          currentItemName +
          ". Tu as épuisé toutes tes vies."
      );
    }
  }

  // Vide l'input
  input.value = "";
}

// Fonction pour initialiser l'autocomplétion
function initAutocomplete() {
  const input = document.getElementById("splash-input");
  const suggestionsDiv = document.getElementById("splash-suggestions");

  if (!input || !suggestionsDiv) {
    console.error("Éléments d'autocomplétion non trouvés");
    return;
  }

  // Charge la liste des items
  loadItemsList();

  // Événement input pour afficher les suggestions en temps réel
  input.addEventListener("input", () => {
    showSuggestions(input, suggestionsDiv);
  });

  // Ferme les suggestions si on clique ailleurs
  document.addEventListener("click", (e) => {
    if (e.target !== input && e.target !== suggestionsDiv) {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
    }
  });
}

// Fonction pour initialiser le mode pixelisé
function initBlur() {
  // Récupère le conteneur d'image et crée un canvas à la place
  const imageContainer = document.querySelector(
    "#splash-page .image-container"
  );
  itemImg = document.getElementById("splash-image");

  if (!imageContainer) {
    console.error("Conteneur d'image non trouvé");
    return;
  }

  // Cache l'image originale
  if (itemImg) {
    itemImg.style.display = "none";
  }

  // Crée un canvas pour la pixelisation s'il n'existe pas déjà
  pixelCanvas = document.getElementById("splash-canvas");
  if (!pixelCanvas) {
    pixelCanvas = document.createElement("canvas");
    pixelCanvas.id = "splash-canvas";
    pixelCanvas.width = 192;
    pixelCanvas.height = 192;
    pixelCanvas.style.width = "100%";
    pixelCanvas.style.height = "100%";
    pixelCanvas.style.objectFit = "contain";
    pixelCanvas.style.imageRendering = "pixelated";
    imageContainer.appendChild(pixelCanvas);
  }
  pixelCtx = pixelCanvas.getContext("2d");

  // Réinitialise les variables
  pixelSize = 32;
  lives = MAX_LIVES;
  wrongGuesses = [];
  updateLivesDisplay();

  // Vide la liste des tentatives
  const guessesContainer = document.getElementById("splash-guesses");
  if (guessesContainer) {
    guessesContainer.innerHTML = "";
  }

  // Ajout de l'image pixelisée
  loadRandomImage();

  // Cache l'overlay de flou (plus nécessaire)
  const blurOverlay = document.getElementById("splash-blur");
  if (blurOverlay) {
    blurOverlay.style.display = "none";
  }

  // Ajoute l'écouteur d'événement pour le bouton submit
  const submitBtn = document.getElementById("splash-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", checkAnswer);
  }

  // Permet de valider avec la touche Enter
  const input = document.getElementById("splash-input");
  const suggestionsDiv = document.getElementById("splash-suggestions");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // Sélectionne la première suggestion si disponible
        const firstSuggestion =
          suggestionsDiv?.querySelector(".suggestion-item");
        if (firstSuggestion) {
          input.value = firstSuggestion.textContent.trim();
        }
        // Cache les suggestions
        if (suggestionsDiv) {
          suggestionsDiv.innerHTML = "";
          suggestionsDiv.style.display = "none";
        }
        checkAnswer();
      }
    });
  }

  // Initialise l'autocomplétion
  initAutocomplete();
}

// Fonction appelée à chaque essai raté (ancienne version, pour compatibilité)
function handleWrongGuess() {
  const livesLost = MAX_LIVES - lives;
  pixelSize = Math.max(4, Math.floor(32 - livesLost * (28 / MAX_LIVES)));
  pixelateImage(pixelSize);

  // Si plus de vies, révèle complètement
  if (lives <= 0) {
    pixelateImage(1);
  }
}

// Fonction appelée si bonne réponse
function handleCorrectGuess() {
  pixelateImage(1); // révèle immédiatement
  if (typeof showSuccess === "function") {
    showSuccess();
  }
}

// Initialise au chargement de la page
document.addEventListener("DOMContentLoaded", initBlur);
