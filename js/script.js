/* ============================================
   🏔️ PEAKDLE - JavaScript
   ============================================ */

// ============================================
// NAVIGATION & BURGER MENU
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");
  const playButtons = document.querySelectorAll(".play-btn");
  const backButtons = document.querySelectorAll(".back-btn");
  const navHome = document.getElementById("nav-home");

  // Toggle burger menu
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");

      // Animate burger icon
      const spans = navToggle.querySelectorAll("span");
      if (navMenu.classList.contains("active")) {
        spans[0].style.transform = "rotate(45deg) translateY(10px)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "rotate(-45deg) translateY(-10px)";
      } else {
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    });
  }

  // Navigation - Switch pages
  function switchPage(pageId) {
    // Hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Show target page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
      targetPage.classList.add("active");
    }

    // Update active nav link
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.dataset.page === pageId) {
        link.classList.add("active");
      }
    });

    // Close mobile menu if open
    navMenu.classList.remove("active");
    if (navToggle) {
      const spans = navToggle.querySelectorAll("span");
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Nav links click
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.dataset.page;
      switchPage(pageId);
    });
  });

  // Play buttons click
  playButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.dataset.page;
      switchPage(pageId);
    });
  });

  // Back buttons click
  backButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.dataset.page;
      switchPage(pageId);
    });
  });

  // Logo nav-brand click (Home)
  if (navHome) {
    navHome.addEventListener("click", function (e) {
      e.preventDefault();
      switchPage("home");
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (
      navMenu.classList.contains("active") &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      navMenu.classList.remove("active");
      const spans = navToggle.querySelectorAll("span");
      spans[0].style.transform = "none";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "none";
    }
  });

  // ============================================
  // COUNTDOWN TIMER
  // ============================================

  function updateCountdown() {
    const countdownElement = document.getElementById("countdown-home");
    if (!countdownElement) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownElement.textContent = `${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  // Update countdown every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================================
  // GAME LOGIC (Placeholder)
  // ============================================

  console.log("🏔️ Peakdle loaded successfully!");
  console.log("Ready to climb!");
});





(async () => {
      const DATA_FILE = 'datas.json';
      const MAX_LIVES = 7;

      let items = {}, targetName = '', targetItem = null;
      const guessedNames = new Set();
      let lives = MAX_LIVES;
      let allItems = [];

      const input = document.getElementById('classic-input');
      const submitBtn = document.getElementById('classic-submit');
      const suggestionsDiv = document.getElementById('classic-suggestions');
      const guessesList = document.getElementById('classic-guesses');
      const livesSpan = document.getElementById('classic-lives');
      const livesHearts = document.getElementById('classic-lives-hearts');
      const resultModal = document.getElementById('classic-result');
      const resultTitle = document.getElementById('classic-result-title');
      const resultMessage = document.getElementById('classic-result-message');
      const resultLives = document.getElementById('classic-result-lives');

      // Helper: build icon URL (kept for guess rows)
        function iconUrl(iconName) {
        if (!iconName) return ''; 
        const fileName = String(iconName).replace(/ /g, '_'); // replace spaces
        return `images/64px-images/64px-${fileName}.webp`;
        }

      function updateLivesDisplay() {
        livesSpan.textContent = lives;
        livesHearts.textContent = '❤️'.repeat(Math.max(0, lives)) + '🤍'.repeat(Math.max(0, MAX_LIVES - lives));
      }

      function compareValues(key, guessValue, targetValue) {
        if (typeof targetValue === 'undefined') return 'red';
        if (key === 'Weight') return Number(guessValue) === Number(targetValue) ? 'green' : 'red';
        if (key === 'Uses') return guessValue === targetValue ? 'green' : 'red';

        const gVals = Array.isArray(guessValue) ? guessValue : [guessValue];
        const tVals = Array.isArray(targetValue) ? targetValue : [targetValue];
        const gNorm = gVals.map(v => String(v));
        const tNorm = tVals.map(v => String(v));
        const intersection = gNorm.filter(v => tNorm.includes(v));
        if (intersection.length === 0) return 'red';
        if (intersection.length < Math.max(gNorm.length, tNorm.length)) return 'yellow';
        return 'green';
      }
function addGuessRow(name) {
  const guessedItem = items[name];
  if (!guessedItem) return;

  const row = document.createElement('div');
  row.className = 'guess-row';

  // Icon on the left
  const img = document.createElement('img');
  img.src = iconUrl(guessedItem.Icon || guessedItem.icon || name);
  img.alt = name;
  row.appendChild(img);

  const pref = ['Type','Rarity','Weight','Effects','Uses'];
  const keys = Object.keys(guessedItem).map(k => k.charAt(0).toUpperCase() + k.slice(1))
               .filter(k => k !== 'Icon');
  const ordered = [];
  for (const k of pref) if (keys.includes(k)) ordered.push(k);
  for (const k of keys) if (!ordered.includes(k)) ordered.push(k);

  for (const key of ordered) {
    const value = guessedItem[key] ?? guessedItem[key.toLowerCase()]; // allow 0
    const targetValue = targetItem[key] ?? targetItem[key.toLowerCase()]; // allow 0
    const colorClass = compareValues(key, value, targetValue);

    let display = Array.isArray(value) ? value.join(', ') : String(value);

    if (key === 'Weight' && targetValue !== undefined) {
      const gNum = Number(value), tNum = Number(targetValue);
      if (!Number.isNaN(gNum) && !Number.isNaN(tNum)) {
        if (gNum === tNum) display = `${value} ✓`;
        else if (gNum < tNum) display = `${value} ▲`;
        else display = `${value} ▼`;
      }
    }

    const sq = document.createElement('div');
    sq.className = 'square ' + colorClass;
    sq.textContent = `${key}:\n${display}`;
    row.appendChild(sq);
  }

  // Prepend to stack newest on top
  guessesList.prepend(row);
}

      /* Autocomplete exactly like Splash mode: suggestion-item plain text blocks */
      function hideSuggestions() {
        suggestionsDiv.style.display = 'none';
        suggestionsDiv.innerHTML = '';
      }

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
    img.src = iconUrl(items[name].Icon || name);
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
          addGuessRow(guess);

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

      // --- load data ---
      try {
        const res = await fetch(DATA_FILE);
        if (!res.ok) throw new Error('Failed to load ' + DATA_FILE);
        items = await res.json();
        allItems = Object.keys(items);
      } catch (err) {
        console.error(err);
        resultMessage.textContent = 'Error loading data';
        return;
      }

      // choose target
      const allNames = Object.keys(items);
      targetName = allNames[Math.floor(Math.random() * allNames.length)];
      targetItem = items[targetName];
      console.log('CLASSIC TARGET:', targetName, targetItem);

      // wire events
      updateLivesDisplay();
      input.addEventListener('input', showSuggestions);
      input.addEventListener('focus', showSuggestions);

      // Enter selects top suggestion (Splash-mode behavior)
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const first = suggestionsDiv.querySelector('.suggestion-item');
          if (first) input.value = first.textContent.trim();
          hideSuggestions();
          submitGuess();
        }
      });

      document.addEventListener('click', (e) => {
        if (!suggestionsDiv.contains(e.target) && e.target !== input) hideSuggestions();
      });

      submitBtn.addEventListener('click', submitGuess);
    })();
