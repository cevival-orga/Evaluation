(async () => {
  const DATA_FILE = "datas.json";
  const MAX_LIVES = 7;

  let items = {};
  let targetName = "";
  let targetItem = null;

  let originalNote = "";
  let revealedMask = "";
  let lives = MAX_LIVES;

  const guessedNames = new Set();
  let allItems = [];

  const input = document.getElementById("detective-input");
  const submitBtn = document.getElementById("detective-submit");
  const suggestionsDiv = document.getElementById("detective-suggestions");
  const hintDiv = document.getElementById("detective-hint");
  const guessesList = document.getElementById("detective-guesses");
  const livesSpan = document.getElementById("detective-lives");
  const livesHearts = document.getElementById("detective-lives-hearts");

  const resultModal = document.getElementById("detective-result");
  const resultTitle = document.getElementById("detective-result-title");
  const resultMessage = document.getElementById("detective-result-message");
  const resultLives = document.getElementById("detective-result-lives");

  function updateLivesDisplay() {
    livesSpan.textContent = lives;
    livesHearts.textContent =
      "❤️".repeat(lives) + "🤍".repeat(MAX_LIVES - lives);
  }

  function maskNote(note) {
    return note.replace(/[A-Za-z]/g, "_");
  }

  function reveal20Percent() {
    let arr = revealedMask.split("");
    let orig = originalNote.split("");

    const hiddenIndexes = arr
      .map((c, i) => (c === "_" ? i : null))
      .filter((v) => v !== null);

    const revealCount = Math.ceil(hiddenIndexes.length * 0.2);

    for (let i = 0; i < revealCount; i++) {
      const idx = hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];
      arr[idx] = orig[idx];
      hiddenIndexes.splice(hiddenIndexes.indexOf(idx), 1);
    }

    revealedMask = arr.join("");
  }

  function updateHintDisplay() {
    hintDiv.textContent = revealedMask;
  }

  // Autocomplete functionality
  function hideSuggestions() {
    suggestionsDiv.style.display = "none";
    suggestionsDiv.innerHTML = "";
  }

  function showSuggestions() {
    const q = input.value.trim().toLowerCase();
    suggestionsDiv.innerHTML = "";
    if (!q) return hideSuggestions();

    const filtered = allItems.filter(
      (i) => i.toLowerCase().includes(q) && !guessedNames.has(i)
    );
    if (filtered.length === 0) return hideSuggestions();

    const suggestions = filtered.slice(0, 10);

    suggestionsDiv.innerHTML = suggestions
      .map((item) => `<div class="suggestion-item">${item}</div>`)
      .join("");

    suggestionsDiv.style.display = "block";

    suggestionsDiv.querySelectorAll(".suggestion-item").forEach((el) => {
      el.addEventListener("click", () => {
        input.value = el.textContent;
        hideSuggestions();
        submitGuess();
      });
    });
  }

  function submitGuess() {
    const guess = input.value.trim();
    if (!guess) return;
    if (input.disabled) return;

    // Win condition
    if (guess === targetName) {
      resultTitle.textContent = "🎉 Correct!";
      resultMessage.textContent = `The item was ${targetName}.`;
      resultLives.textContent = String(lives);
      resultModal.classList.remove("hidden");

      input.disabled = true;
      submitBtn.disabled = true;
      hideSuggestions();
      return;
    }

    // Valid guess
    if (guess in items) {
      if (guessedNames.has(guess)) {
        input.value = "";
        showSuggestions();
        return;
      }

      guessedNames.add(guess);

      // incorrect → lose life + reveal
      lives = Math.max(0, lives - 1);
      updateLivesDisplay();

      reveal20Percent();
      updateHintDisplay();

      input.value = "";
      hideSuggestions();

      if (lives <= 0) {
        resultTitle.textContent = "💀 Out of lives!";
        resultMessage.textContent = `The item was ${targetName}.`;
        resultLives.textContent = String(lives);
        resultModal.classList.remove("hidden");

        input.disabled = true;
        submitBtn.disabled = true;
      }
      return;
    }

    // Invalid guess
    input.value = "";
    showSuggestions();
  }

  // Load items
  try {
    const res = await fetch(DATA_FILE);
    items = await res.json();
    allItems = Object.keys(items);
  } catch (err) {
    console.error("Detective mode data load error", err);
    return;
  }

  // Pick target with a valid Note
  const validItems = Object.values(items).filter((i) => i.Note);
  targetItem = validItems[Math.floor(Math.random() * validItems.length)];
  targetName = targetItem.Name;

  originalNote = targetItem.Note;
  revealedMask = maskNote(originalNote);

  updateLivesDisplay();
  updateHintDisplay();

  console.log("DETECTIVE TARGET:", targetName);

  // Event wiring
  input.addEventListener("input", showSuggestions);
  input.addEventListener("focus", showSuggestions);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = suggestionsDiv.querySelector(".suggestion-item");
      if (first) input.value = first.textContent.trim();
      hideSuggestions();
      submitGuess();
    }
  });

  submitBtn.addEventListener("click", submitGuess);

  document.addEventListener("click", (e) => {
    if (!suggestionsDiv.contains(e.target) && e.target !== input)
      hideSuggestions();
  });
})();
