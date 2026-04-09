import { bouquetAssets, flowerOptions, mealOptions, starterBouquets } from "./data/catalog.js";
import { buildShareUrl, clearShareParam, getSharedBouquet } from "./utils/share.js";

const app = document.querySelector("#app");

const defaultState = {
  recipient: "Your favorite person",
  sender: "Someone who adores you",
  note:
    "I built this bouquet for you because a normal message felt too small for how much I wanted to make you smile.",
  flowers: ["rose", "peony", "dahlia", "carnation"],
  meals: ["pasta", "cake"],
  songTitle: "Our Song",
  songUrl: "https://open.spotify.com/"
};

let state = getSharedBouquet() || structuredClone(defaultState);

const flowerMap = new Map(flowerOptions.map((item) => [item.id, item]));
const mealMap = new Map(mealOptions.map((item) => [item.id, item]));

function updateState(key, value) {
  state = { ...state, [key]: value };
  render();
}

function addFlower(id) {
  updateState("flowers", [...state.flowers, id].slice(0, 8));
}

function removeFlower(index) {
  updateState(
    "flowers",
    state.flowers.filter((_, itemIndex) => itemIndex !== index)
  );
}

function toggleMeal(id) {
  const meals = state.meals.includes(id)
    ? state.meals.filter((item) => item !== id)
    : [...state.meals, id];
  updateState("meals", meals);
}

function applyStarter(index) {
  const preset = starterBouquets[index];
  if (!preset) return;
  state = {
    ...state,
    flowers: preset.flowers,
    meals: preset.meals,
    songTitle: preset.songTitle,
    songUrl: preset.songUrl
  };
  render();
}

async function copyShareLink() {
  const link = buildShareUrl(state);
  try {
    await navigator.clipboard.writeText(link);
    document.querySelectorAll("[data-copy-link]").forEach((button) => {
      const original = button.textContent;
      button.textContent = "Link copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1800);
    });
  } catch {
    window.prompt("Copy this bouquet link:", link);
  }
}

function getFlowerLayout(index, total) {
  const layout = [
    { left: 16, bottom: 26, width: 142, rotate: -10, z: 2 },
    { left: 50, bottom: 92, width: 154, rotate: -4, z: 5 },
    { left: 116, bottom: 42, width: 150, rotate: 8, z: 3 },
    { left: 186, bottom: 110, width: 146, rotate: 2, z: 6 },
    { left: 252, bottom: 40, width: 142, rotate: 12, z: 4 },
    { left: 92, bottom: 170, width: 132, rotate: -6, z: 7 },
    { left: 220, bottom: 182, width: 128, rotate: 7, z: 8 },
    { left: 154, bottom: 228, width: 118, rotate: 0, z: 9 }
  ];

  if (layout[index]) return layout[index];

  const angle = ((index - total / 2) / Math.max(total, 1)) * 26;
  return {
    left: 70 + index * 26,
    bottom: 40 + index * 18,
    width: 130,
    rotate: angle,
    z: index + 2
  };
}

function renderBouquetMarkup(flowers) {
  const stems = flowers
    .map((flowerId, index) => {
      const flower = flowerMap.get(flowerId);
      if (!flower) return "";
      const style = getFlowerLayout(index, flowers.length);
      return `
        <img
          class="bouquet-flower"
          src="${flower.image}"
          alt="${flower.name}"
          style="left:${style.left}px; bottom:${style.bottom}px; width:${style.width}px; transform:rotate(${style.rotate}deg); z-index:${style.z};"
        />
      `;
    })
    .join("");

  return `
    <div class="bouquet-art">
      <img class="bush bush-back" src="${bouquetAssets.bushBack}" alt="" />
      ${stems}
      <img class="bush bush-top" src="${bouquetAssets.bushTop}" alt="" />
    </div>
  `;
}

function renderFlowerSelection() {
  if (!state.flowers.length) {
    return `<p class="empty-inline">No flowers yet. Tap a flower card to add stems.</p>`;
  }

  return state.flowers
    .map((flowerId, index) => {
      const flower = flowerMap.get(flowerId);
      if (!flower) return "";
      return `
        <button type="button" class="stem-token" data-remove-flower="${index}">
          <img src="${flower.image}" alt="${flower.name}" />
          <span>${flower.name}</span>
          <strong>Remove</strong>
        </button>
      `;
    })
    .join("");
}

function renderMealList(shared = false) {
  if (!state.meals.length) {
    return shared
      ? `<li class="empty-inline">No dishes were added yet.</li>`
      : `<li class="empty-inline">Pick dishes and they will appear here.</li>`;
  }

  return state.meals
    .map((id) => {
      const meal = mealMap.get(id);
      if (!meal) return "";
      return shared
        ? `<li class="shared-meal"><span>${meal.emoji}</span><div><strong>${meal.name}</strong><small>${meal.note}</small></div></li>`
        : `<li class="meal-pill"><span>${meal.emoji}</span><div><strong>${meal.name}</strong><small>${meal.note}</small></div></li>`;
    })
    .join("");
}

function renderBuilderView() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Digital bouquet studio</p>
        <h1>Make a bouquet that feels like a real romantic gift.</h1>
        <p class="hero-text">
          Flowers in the DigiBouquet mood, plus comfort dishes and a song link that turns the page into a full little memory.
        </p>
        <div class="hero-actions">
          <button class="primary-btn" data-scroll-builder>Build the bouquet</button>
          <button class="ghost-btn" data-open-preview>See share page</button>
        </div>
      </div>

      <div class="hero-showcase">
        <div class="hero-showcase-inner">
          ${renderBouquetMarkup(state.flowers)}
        </div>
      </div>
    </section>

    <section class="builder-grid" id="builder">
      <form class="builder-panel">
        <div class="panel-head">
          <p class="eyebrow">Bouquet details</p>
          <h2>Design the feeling</h2>
        </div>

        <label>
          Recipient name
          <input name="recipient" type="text" value="${escapeHtml(state.recipient)}" placeholder="Aarav" />
        </label>

        <label>
          Your name
          <input name="sender" type="text" value="${escapeHtml(state.sender)}" placeholder="Manish" />
        </label>

        <label>
          Message
          <textarea name="note" rows="5" placeholder="Write something soft, dramatic, funny, or sincere.">${escapeHtml(
            state.note
          )}</textarea>
        </label>

        <div class="picker-block">
          <div class="picker-head">
            <h3>Flower stems</h3>
            <p>Add stems one by one, just like building a bouquet.</p>
          </div>
          <div class="flower-cards">
            ${flowerOptions
              .map(
                (flower) => `
                  <button type="button" class="flower-card" data-add-flower="${flower.id}">
                    <img src="${flower.image}" alt="${flower.name}" />
                    <span>${flower.name}</span>
                    <small>${flower.meaning}</small>
                    <strong>Add stem</strong>
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="selection-tray">
            <div class="selection-head">
              <span>Selected stems</span>
              <small>${state.flowers.length}/8</small>
            </div>
            <div class="stem-token-row">${renderFlowerSelection()}</div>
          </div>
        </div>

        <div class="picker-block">
          <div class="picker-head">
            <h3>Favorite dishes</h3>
            <p>Choose meals that feel personal, comforting, or very them.</p>
          </div>
          <div class="meal-cards">
            ${mealOptions
              .map(
                (meal) => `
                  <button
                    type="button"
                    class="meal-card ${state.meals.includes(meal.id) ? "is-selected" : ""}"
                    data-meal="${meal.id}"
                  >
                    <span class="meal-emoji">${meal.emoji}</span>
                    <strong>${meal.name}</strong>
                    <small>${meal.note}</small>
                  </button>
                `
              )
              .join("")}
          </div>
        </div>

        <div class="song-grid">
          <label>
            Song title
            <input name="songTitle" type="text" value="${escapeHtml(state.songTitle)}" placeholder="Golden Hour" />
          </label>
          <label>
            Song link
            <input
              name="songUrl"
              type="url"
              value="${escapeHtml(state.songUrl)}"
              placeholder="https://open.spotify.com/track/..."
            />
          </label>
        </div>

        <div class="presets">
          <p>Quick bouquet moods</p>
          <div class="preset-row">
            ${starterBouquets
              .map(
                (preset, index) => `
                  <button type="button" class="preset-btn" data-preset="${index}">${preset.title}</button>
                `
              )
              .join("")}
          </div>
        </div>
      </form>

      <aside class="preview-panel">
        <div class="preview-card">
          <p class="eyebrow">Live preview</p>
          <h2>For ${escapeHtml(state.recipient)}</h2>

          <div class="preview-stage">
            ${renderBouquetMarkup(state.flowers)}
          </div>

          <div class="letter-card">
            <p class="letter-intro">Your note</p>
            <p>${escapeHtml(state.note)}</p>
            <span class="signature">From ${escapeHtml(state.sender)}</span>
          </div>

          <div class="gift-grid">
            <div class="gift-card">
              <span class="gift-label">Favorite dishes</span>
              <ul class="meal-list">${renderMealList()}</ul>
            </div>
            <div class="gift-card song-card">
              <span class="gift-label">Attached song</span>
              <strong>${escapeHtml(state.songTitle || "Add a song")}</strong>
              <a href="${escapeAttribute(state.songUrl)}" target="_blank" rel="noreferrer">Open song link</a>
            </div>
          </div>
        </div>

        <div class="share-bar">
          <button class="primary-btn" type="button" data-copy-link>Copy bouquet link</button>
          <button class="ghost-btn" type="button" data-open-preview>Open share page</button>
        </div>
      </aside>
    </section>
  `;

  bindBuilderEvents();
}

function renderSharedView() {
  app.innerHTML = `
    <section class="shared-page">
      <div class="shared-top">
        <p class="eyebrow">A digital bouquet was made for you</p>
        <h1>Hi ${escapeHtml(state.recipient)}, I made this bouquet for you.</h1>
        <p class="shared-note">${escapeHtml(state.note)}</p>
      </div>

      <div class="shared-stage">
        ${renderBouquetMarkup(state.flowers)}
      </div>

      <div class="shared-details">
        <div class="shared-box">
          <span class="gift-label">Favorite dishes saved in this bouquet</span>
          <ul class="shared-meals">${renderMealList(true)}</ul>
        </div>
        <div class="shared-box">
          <span class="gift-label">Song attached to this bouquet</span>
          <a class="song-link" href="${escapeAttribute(state.songUrl)}" target="_blank" rel="noreferrer">
            Play ${escapeHtml(state.songTitle || "this song")}
          </a>
          <p class="signature">Sincerely, ${escapeHtml(state.sender)}</p>
        </div>
      </div>

      <div class="shared-actions">
        <button class="ghost-btn" type="button" data-back-builder>Build your own bouquet</button>
        <button class="primary-btn" type="button" data-copy-link>Copy this link</button>
      </div>
    </section>
  `;

  bindSharedEvents();
}

function bindBuilderEvents() {
  document.querySelector("[data-scroll-builder]")?.addEventListener("click", () => {
    document.querySelector("#builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", (event) => {
      const { name, value } = event.target;
      updateState(name, value);
    });
  });

  document.querySelectorAll("[data-add-flower]").forEach((button) => {
    button.addEventListener("click", () => addFlower(button.dataset.addFlower));
  });

  document.querySelectorAll("[data-remove-flower]").forEach((button) => {
    button.addEventListener("click", () => removeFlower(Number(button.dataset.removeFlower)));
  });

  document.querySelectorAll("[data-meal]").forEach((button) => {
    button.addEventListener("click", () => toggleMeal(button.dataset.meal));
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyStarter(Number(button.dataset.preset)));
  });

  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", copyShareLink);
  });

  document.querySelectorAll("[data-open-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = buildShareUrl(state);
    });
  });
}

function bindSharedEvents() {
  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", copyShareLink);
  });

  document.querySelector("[data-back-builder]")?.addEventListener("click", () => {
    clearShareParam();
    render();
  });
}

function render() {
  if (getSharedBouquet()) {
    renderSharedView();
    return;
  }
  renderBuilderView();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value || "#");
}

render();
