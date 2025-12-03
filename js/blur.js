
// Variables globales
let blurAmount = 25; // flou initial
const maxAttempts = 6;
let attempts = 0;
let itemImg = null;
let currentItem = null;
let currentItemName = null;
let items = {}, targetName = '', targetItem = null;
let allItems = []; // Liste de tous les items pour l'autocomplétion
let wrongGuesses = []; // Liste des mauvaises réponses

let guessedNames = new Set();

const input = document.getElementById('splash-input');
const suggestionsDiv = document.getElementById('splash-suggestions');

const submitBtn = document.getElementById('splash-submit');
const guessesList = document.getElementById('splash-guesses');
const livesSpan = document.getElementById('splash-lives');
const livesHearts = document.getElementById('splash-lives-hearts');
const resultModal = document.getElementById('splash-result');
const resultTitle = document.getElementById('splash-result-title');
const resultMessage = document.getElementById('splash-result-message');
const resultLives = document.getElementById('splash-result-lives');
// Fonction pour charger et choisir un item aléatoire

function hideSuggestions() {
suggestionsDiv.style.display = 'none';
suggestionsDiv.innerHTML = '';
}

function iconUrl192(iconName) {
if (!iconName) return ''; 
const fileName = String(iconName).replace(/ /g, '_'); // replace spaces
return `images/192px-images/192px-${fileName}.webp`;
}

function iconUrl64(iconName) {
if (!iconName) return ''; 
const fileName = String(iconName).replace(/ /g, '_'); // replace spaces
return `images/64px-images/64px-${fileName}.webp`;
}


async function getRandomItemImageUrl() {
  try {
    const response = await fetch('datas.json');
    items = await response.json();

    // Récupère tous les noms d'items
    const itemNames = Object.keys(items);

    // Sélectionne un item aléatoire
    const randomIndex = Math.floor(Math.random() * itemNames.length);
    const randomItemName = itemNames[randomIndex];

    // Stocke l'item actuel
    currentItem = {
      name: randomItemName,
      data: items[randomItemName]
    };

    // Retourne l'objet avec le nom et l'URL
    const iconName = items[randomItemName].icon.replace(/ /g, '_');
    return {
      item: randomItemName,
      url: iconUrl192(iconName)
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return null;
  }
}

// Fonction pour charger une image aléatoire dans l'élément splash-image
async function loadRandomImage(imgElement) {

  if (!imgElement) {
    console.error('Élément splash-image non trouvé');
    return;
  }

  const result = await getRandomItemImageUrl();

  if (result) {
    // Stocke le nom de l'item
    currentItemName = result.item;

    // Met l'URL de l'image dans l'élément img
    imgElement.src = result.url;
    imgElement.alt = result.item;

    console.log('Image chargée:', result.item);
  }
}

// Fonction pour charger la liste des items
async function loadItemsList() {
  try {
    const response = await fetch('datas.json');
    items = await response.json();
    allItems = Object.keys(items);
  } catch (error) {
    console.error('Erreur lors du chargement de la liste des items:', error);
  }
}

// Fonction pour filtrer et afficher les suggestions
function showSuggestions() {
  const q = input.value.trim().toLowerCase();
  suggestionsDiv.innerHTML = '';
  if (!q) return hideSuggestions();

  const filtered = allItems.filter(i => i.toLowerCase().includes(q) && !guessedNames.has(i));
  if (filtered.length === 0) return hideSuggestions();

  filtered.slice(0, 10).forEach(name => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';

    // Create mini icon
    const img = document.createElement('img');
    console.log(items)
    img.src = iconUrl192(items[name].Icon || name);
    img.alt = name;
    img.style.width = '24px';
    img.style.height = '24px';
    img.style.marginRight = '8px';
    img.style.verticalAlign = 'middle';
    img.style.objectFit = 'contain';
    div.appendChild(img);

    // Add name text
    const span = document.createElement('span');
    span.textContent = name;
    div.appendChild(span);

    // Click selects the item
    div.addEventListener('click', () => {
      input.value = name;
      hideSuggestions();
      submitGuess();
    });

    suggestionsDiv.appendChild(div);
  });

  suggestionsDiv.style.display = 'block';
}

      function submitGuess() {
        const guess = input.value.trim();
        if (!guess) return;
        if (input.disabled) return;

        // correct
        if (guess === targetName) {
          resultTitle.textContent = '🎉 Correct!';
          resultMessage.textContent = `The item was ${targetName}.`;
          resultLives.textContent = String(lives);
          resultModal.classList.remove('hidden');
          input.disabled = true;
          submitBtn.disabled = true;
          hideSuggestions();
          return;
        }

        // valid item
        if (guess in items) {
          if (guessedNames.has(guess)) {
            resultMessage.textContent = `Already guessed "${guess}"`;
            setTimeout(() => { resultMessage.textContent = ''; }, 1400);
            input.value = '';
            showSuggestions();
            return;
          }

          guessedNames.add(guess);
          

          // lose life
          lives = Math.max(0, lives - 1);
          updateLivesDisplay();

          input.value = '';
          hideSuggestions();

          if (lives <= 0) {
            resultTitle.textContent = '💀 Out of lives!';
            resultMessage.textContent = `The item was ${targetName}.`;
            resultLives.textContent = String(lives);
            resultModal.classList.remove('hidden');
            input.disabled = true;
            submitBtn.disabled = true;
          }
          return;
        }

        // invalid
        resultMessage.textContent = `Invalid guess: "${guess}"`;
        setTimeout(() => { resultMessage.textContent = ''; }, 1200);
        input.value = '';
        showSuggestions();
      }


// Fonction pour mettre à jour l'affichage des attempts
function updateAttemptsDisplay() {
  const attemptsElement = document.getElementById('splash-attempts');
  if (attemptsElement) {
    attemptsElement.textContent = attempts;
  }
}

// Fonction pour ajouter une tentative à l'affichage
async function addGuessToDisplay(itemName, isCorrect) {
  const guessesContainer = document.getElementById('splash-guesses');
  if (!guessesContainer) return;

  // Récupère les données pour obtenir l'icône
  try {
    const response = await fetch('datas.json');
    items = await response.json();
    const itemData = items[itemName];

    if (!itemData) {
      console.error('Item non trouvé dans les données:', itemName);
      return;
    }

    // Crée l'élément de tentative
    const guessElement = document.createElement('div');
    guessElement.className = 'guess-item';

    // Construit l'URL de l'image
    const iconName = itemData.icon.replace(/ /g, '_');
    const imageUrl = iconUrl64(iconName);

    // Icône et couleur selon le résultat
    const resultIcon = isCorrect ? '✓' : '✗';
    const resultClass = isCorrect ? 'correct' : 'wrong';

    guessElement.innerHTML = `
      <img src="${imageUrl}" alt="${itemName}" class="guess-img">
      <span class="guess-name">${itemName}</span>
      <span class="guess-result ${resultClass}">${resultIcon}</span>
    `;

    guessesContainer.appendChild(guessElement);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la tentative:', error);
  }
}

// Fonction pour vérifier la réponse
function checkAnswer() {
  const input = document.getElementById('splash-input');
  const guess = input.value.trim();

  // Vérifie si l'input n'est pas vide
  if (guess === '') {
    console.log('Veuillez entrer un item');
    return;
  }

  // Vérifie si l'item a déjà été tenté
  if (wrongGuesses.includes(guess)) {
    console.log('⚠️ Tu as déjà essayé cet item !');
    input.value = '';
    return;
  }

  // Vérifie si la réponse est correcte
  if (guess === currentItemName) {
    // Bonne réponse
    if (itemImg) {
      itemImg.style.filter = 'blur(0px)';
    }
    addGuessToDisplay(guess, true);
    console.log('🎉 Bravo ! Tu as trouvé le bon item : ' + currentItemName);
  } else {
    // Mauvaise réponse - ajoute à la liste des mauvaises réponses
    wrongGuesses.push(guess);
    attempts++;
    updateAttemptsDisplay();
    addGuessToDisplay(guess, false);

    // Calcule le flou en fonction des tentatives (25px -> 0px en 6 essais)
    blurAmount = 25 - (attempts * (25 / maxAttempts));

    if (attempts < maxAttempts) {
      // Il reste des tentatives
      if (itemImg) {
        itemImg.style.filter = `blur(${blurAmount}px)`;
      }
      console.log('❌ Mauvaise réponse ! Il te reste ' + (maxAttempts - attempts) + ' tentative(s)');
    } else {
      // Plus de tentatives
      if (itemImg) {
        itemImg.style.filter = 'blur(0px)';
      }
      console.log('💔 Dommage ! C\'était : ' + currentItemName + '. Tu as épuisé toutes tes tentatives.');
    }
  }

  // Vide l'input
  input.value = '';
}

// Fonction pour initialiser l'autocomplétion
function initAutocomplete() {
  const input = document.getElementById('splash-input');
  const suggestionsDiv = document.getElementById('splash-suggestions');

  if (!input || !suggestionsDiv) {
    console.error('Éléments d\'autocomplétion non trouvés');
    return;
  }

  // Charge la liste des items
  loadItemsList();

  // Événement input pour afficher les suggestions en temps réel
  input.addEventListener('input', () => {
    showSuggestions();
  });

  // Ferme les suggestions si on clique ailleurs
  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== suggestionsDiv) {
      suggestionsDiv.innerHTML = '';
      suggestionsDiv.style.display = 'none';
    }
  });
}

// Fonction pour initialiser le blur
function initBlur() {
  // Récupère ton élément image
  itemImg = document.getElementById('splash-image');

  // Réinitialise les variables
  blurAmount = 25;
  attempts = 0;
  wrongGuesses = [];
  updateAttemptsDisplay();

  // Vide la liste des tentatives
  const guessesContainer = document.getElementById('splash-guesses');
  if (guessesContainer) {
    guessesContainer.innerHTML = '';
  }

  // Ajout de l'image
  loadRandomImage(itemImg);

  // Applique le flou initial
  itemImg.style.filter = `blur(${blurAmount}px)`;

  // Ajoute l'écouteur d'événement pour le bouton submit
  const submitBtn = document.getElementById('splash-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', checkAnswer);
  }

  // Permet de valider avec la touche Enter
  const input = document.getElementById('splash-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkAnswer();
      }
    });
  }

  // Initialise l'autocomplétion
  initAutocomplete();
}

// Fonction appelée à chaque essai raté (ancienne version, plus utilisée)
function handleWrongGuess() {
  if (!itemImg) return;

  // Calcule le flou en fonction des tentatives (25px -> 0px en 6 essais)
  blurAmount = 25 - (attempts * (25 / maxAttempts));
  itemImg.style.filter = `blur(${blurAmount}px)`;

  // Si plus d'essais, révèle complètement
  if (attempts >= maxAttempts) {
    itemImg.style.filter = 'blur(0px)';
  }
}

// Fonction appelée si bonne réponse
function handleCorrectGuess() {
  if (!itemImg) return;
  itemImg.style.filter = 'blur(0px)'; // révèle immédiatement
  if (typeof showSuccess === 'function') {
    showSuccess();
  }
}

// Initialise au chargement de la page
document.addEventListener('DOMContentLoaded', initBlur);
