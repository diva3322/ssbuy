document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 1024;

  if (document.body.classList.contains("giftcodes-page")) {
    loadLatestGames(10);
    return;
  }

  if (document.body.classList.contains("index-page")) {
    if (isMobile) document.body.classList.add("mobile-vertical");
    renderGames();

    window.addEventListener("resize", () => {
      const nowMobile = window.innerWidth <= 1024;
      const wasMobile = document.body.classList.contains("mobile-vertical");

      if (nowMobile && !wasMobile) {
        document.body.classList.add("mobile-vertical");
        renderGames();
      } else if (!nowMobile && wasMobile) {
        document.body.classList.remove("mobile-vertical");
        renderGames();
      }
    });
  }
});

// 📌 禮包碼頁顯示最新 10 款遊戲（固定格子）
async function loadLatestGames(limit = 10) {
  const res = await fetch("games.json");
  const data = await res.json();
  const wrapper = document.getElementById("gamesWrapper");
  if (!wrapper) return;

  wrapper.innerHTML = "";
  wrapper.className = "fixed-card-grid";

  const latest = Object.keys(data).slice(-limit).reverse();
  latest.forEach(name => {
    const game = data[name];
    const card = document.createElement("div");
    card.className = "card game-card";
    card.innerHTML = `
      <img src="${game.logo}" alt="${name}" onerror="this.src='images/default.jpg'">
      <div class="game-title">${name}</div>
    `;
    card.addEventListener("click", () => {
      window.location.href = \`game-detail.html?game=\${encodeURIComponent(name)}\`;
    });
    wrapper.appendChild(card);
  });
}

// 📌 首頁用的 renderGames（含滑動與 mobile 模式）
async function renderGames() {
  const wrapper = document.getElementById("gamesWrapper");
  if (!wrapper) return;
  wrapper.innerHTML = "";

  let data = [];
  try {
    const res = await fetch("games.json");
    const json = await res.json();
    data = Object.entries(json).map(([name, info]) => ({ name, logo: info.logo }));
  } catch (e) {
    console.error("讀取 games.json 失敗", e);
    return;
  }

  // 確保至少 26 筆資料
  while (data.length < 26) data = data.concat(data);
  data = data.sort(() => Math.random() - 0.5);
  const gameChunks = [data.slice(0, 13), data.slice(13, 26)];

  const isMobile = document.body.classList.contains("mobile-vertical");
  if (isMobile) return renderVerticalSlider(wrapper, gameChunks);

  for (let i = 0; i < 2; i++) {
    const slider = document.createElement("div");
    slider.classList.add("game-slider-container");
    slider.innerHTML = \`
      <button class="slider-button left" onclick="moveSlide(-1, 'gamesContainer\${i}')">❮</button>
      <div class="game-slider" id="gamesContainer\${i}"></div>
      <button class="slider-button right" onclick="moveSlide(1, 'gamesContainer\${i}')">❯</button>
    \`;
    wrapper.appendChild(slider);

    const container = slider.querySelector(".game-slider");
    const extended = gameChunks[i].concat(gameChunks[i]).concat(gameChunks[i]);

    extended.forEach(game => {
      const card = document.createElement("div");
      card.className = "card game-card";
      card.innerHTML = \`
        <img src="\${game.logo}" alt="\${game.name}" onerror="this.src='images/default.jpg'">
        <div class="game-title">\${game.name}</div>
      \`;
      card.addEventListener("click", () => {
        window.location.href = \`game-detail.html?game=\${encodeURIComponent(game.name)}\`;
      });
      container.appendChild(card);
    });

    const initialOffset = 4 * 220;
    container.style.transform = \`translateX(-\${initialOffset}px)\`;
    container.dataset.index = 4;
    container.dataset.offset = initialOffset;
    container.dataset.originalLength = gameChunks[i].length;
  }
}

function moveSlide(direction, containerId) {
  const container = document.getElementById(containerId);
  const originalLength = parseInt(container.dataset.originalLength);
  const cardWidth = 220;
  const visibleCards = 5;
  let index = parseInt(container.dataset.index) || 0;
  let offset = parseFloat(container.dataset.offset) || 0;

  offset += direction * cardWidth;
  index += direction;

  const cards = container.querySelectorAll('.game-card');
  if (index >= cards.length - visibleCards - 1) {
    const original = Array.from(cards).slice(0, originalLength);
    original.forEach(card => container.appendChild(card.cloneNode(true)));
  }
  if (index < 1) {
    const original = Array.from(cards).slice(-originalLength);
    original.reverse().forEach(card => container.insertBefore(card.cloneNode(true), container.firstChild));
    index += originalLength;
    offset += originalLength * cardWidth;
  }

  container.style.transform = \`translateX(-\${offset}px)\`;
  container.dataset.index = index;
  container.dataset.offset = offset;
}

// 📌 手機版無限垂直滑動
function renderVerticalSlider(wrapper, gameChunks) {
  for (let i = 0; i < 2; i++) {
    const slider = document.createElement("div");
    slider.className = "game-slider-container";
    const inner = document.createElement("div");
    inner.className = "game-slider";
    slider.appendChild(inner);
    wrapper.appendChild(slider);

    let extended = [];
    for (let j = 0; j < 10; j++) {
      extended = extended.concat(gameChunks[i]);
    }

    extended.forEach(game => {
      const card = document.createElement("div");
      card.className = "card game-card";
      card.innerHTML = \`
        <img src="\${game.logo}" alt="\${game.name}" onerror="this.src='images/default.jpg'">
        <div class="game-title">\${game.name}</div>
      \`;
      card.addEventListener("click", () => {
        window.location.href = \`game-detail.html?game=\${encodeURIComponent(game.name)}\`;
      });
      inner.appendChild(card);
    });

    slider.addEventListener("scroll", () => {
      if (slider.scrollTop + slider.clientHeight >= slider.scrollHeight - 10) {
        extended.forEach(game => {
          const card = document.createElement("div");
          card.className = "card game-card";
          card.innerHTML = \`
            <img src="\${game.logo}" alt="\${game.name}" onerror="this.src='images/default.jpg'">
            <div class="game-title">\${game.name}</div>
          \`;
          card.addEventListener("click", () => {
            window.location.href = \`game-detail.html?game=\${encodeURIComponent(game.name)}\`;
          });
          inner.appendChild(card);
        });
      }
    });
  }
}