document.addEventListener("DOMContentLoaded", async () => {
    await loadRandomGames();
    if (document.body.classList.contains("all-games-page")) {
        loadAllGames();
    }
});

async function loadRandomGames() {
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("載入遊戲 JSON 失敗");
        const gamesData = await response.json();

        let allGames = Object.keys(gamesData).map(name => ({
            name,
            logo: gamesData[name].logo
        }));

        // 隨機打亂遊戲順序
        allGames = allGames.sort(() => Math.random() - 0.5);

        // 取出 26 款遊戲（兩排，每排 13 款）
        const selectedGames = allGames.slice(0, 26);
        const firstRow = selectedGames.slice(0, 13);
        const secondRow = selectedGames.slice(13, 26);

        // 生成遊戲卡片
        displayGameRow(firstRow);
        displayGameRow(secondRow);

    } catch (error) {
        console.error("無法載入隨機遊戲:", error);
    }
}

function displayGameRow(games) {
    const gamesWrapper = document.getElementById("gamesWrapper");

    const rowContainer = document.createElement("div");
    rowContainer.classList.add("game-row");

    games.forEach(game => {
        const card = document.createElement("div");
        card.classList.add("game-card");

        const img = document.createElement("img");
        img.src = game.logo;
        img.alt = game.name;

        const gameName = document.createElement("div");
        gameName.classList.add("game-text");
        gameName.textContent = game.name;

        card.appendChild(img);
        card.appendChild(gameName);

        card.addEventListener("click", () => {
            window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
        });

        rowContainer.appendChild(card);
    });

    gamesWrapper.appendChild(rowContainer);
}

// 其他功能保持不變

document.addEventListener("DOMContentLoaded", function () {
    fetch("games.json")
        .then(response => response.json())
        .then(data => {
            const gameEntries = Object.entries(data);
            const latestGames = gameEntries.slice(-21).reverse(); // 倒數 21 個，但只取 20 個

            const container = document.getElementById("new-games-container");
            container.innerHTML = ""; // 清空原本內容

            latestGames.forEach(([name, info]) => {
                const gameCard = document.createElement("div");
                gameCard.classList.add("new-game-item");

                gameCard.innerHTML = `
                    <a href="game-detail.html?game=${encodeURIComponent(name)}">
                        <div class="new-game-card">
                            <img src="${info.logo}" alt="${name}">
                            <div class="game-title">${name}</div>
                        </div>
                    </a>
                `;
                container.appendChild(gameCard);
            });
        })
        .catch(error => console.error("Error loading games:", error));
});

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

        // ✅ 設定點擊跳轉
        gameCard.addEventListener("click", () => {
            window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
        });
    });
}

function filterGames() {
    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach(card => {
        const gameName = card.querySelector(".game-text").textContent.toLowerCase();
        card.style.display = gameName.includes(searchQuery) ? "block" : "none";
    });
}
