document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("games.json"); // 讀取遊戲數據
        if (!response.ok) throw new Error("無法載入遊戲數據");
        const gamesData = await response.json();

        updateGameSlider(gamesData); // ✅ 更新首頁 game-slider，隨機顯示 13 款遊戲
    } catch (error) {
        console.error("讀取遊戲數據失敗:", error);
    }
});

// ✅ **隨機挑選 13 款遊戲來顯示**
function updateGameSlider(gamesData) {
    const gameEntries = Object.entries(gamesData);
    
    // **隨機排序遊戲後，取前 13 個**
    const randomGames = gameEntries.sort(() => Math.random() - 0.5).slice(0, 13);

    const sliderContainer = document.querySelector(".game-slider");
    sliderContainer.innerHTML = ""; // 清空原本內容

    randomGames.forEach(([name, info]) => {
        const gameCard = document.createElement("div");
        gameCard.classList.add("game-card");
        gameCard.innerHTML = `
            <a href="game-detail.html?game=${encodeURIComponent(name)}">
                <img src="${info.logo}" alt="${name}">
                <div class="game-title">${name}</div>
            </a>
        `;
        sliderContainer.appendChild(gameCard);
    });

    startSlider(); // 重新啟動滑動功能
}

// ✅ **加載所有遊戲**
async function loadAllGames() {
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("載入 JSON 失敗");
        const gamesData = await response.json();

        let games = Object.keys(gamesData).map(gameName => ({
            name: gameName,
            logo: gamesData[gameName].logo
        }));

        // **隨機排序遊戲**
        games = games.sort(() => Math.random() - 0.5);

        displayGames(games);
    } catch (error) {
        console.error("無法讀取遊戲數據:", error);
    }
}

// ✅ **顯示遊戲清單**
function displayGames(games) {
    const gamesContainer = document.getElementById("gamesContainer");
    gamesContainer.innerHTML = ""; // 清空現有內容

    games.forEach(game => {
        const gameCard = document.createElement("div");
        gameCard.classList.add("game-card");

        const img = document.createElement("img");
        img.src = game.logo;
        img.alt = game.name;

        const gameName = document.createElement("div");
        gameName.classList.add("game-text");
        gameName.textContent = game.name;

        gameCard.appendChild(img);
        gameCard.appendChild(gameName);
        gamesContainer.appendChild(gameCard);

        // ✅ **點擊遊戲卡片可跳轉到 `game-detail.html`**
        gameCard.addEventListener("click", () => {
            window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
        });
    });
}

// ✅ **遊戲搜尋功能**
function filterGames() {
    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach(card => {
        const gameName = card.querySelector(".game-text").textContent.toLowerCase();
        card.style.display = gameName.includes(searchQuery) ? "block" : "none";
    });
}
