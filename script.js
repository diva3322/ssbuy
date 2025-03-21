document.addEventListener("DOMContentLoaded", () => {
    renderGames(); // 在網頁載入時隨機產生遊戲卡片

    // 處理 game-detail 頁面載入
    if (document.body.classList.contains("game-detail")) {
        const urlParams = new URLSearchParams(window.location.search);
        const gameName = urlParams.get("game") ? decodeURIComponent(urlParams.get("game")) : "未知遊戲";

        console.log("當前遊戲名稱:", gameName); // 🔍 檢查是否成功取得遊戲名稱

        if (gameName) {
            fetch("games.json")
                .then(response => {
                    if (!response.ok) throw new Error("載入 JSON 失敗");
                    return response.json();
                })
                .then(data => {
                    const game = data[gameName];
                    if (game) {
                        loadGameDetails(gameName, game);
                    } else {
                        console.error("找不到遊戲:", gameName);
                        document.getElementById("gameTitle").textContent = "找不到遊戲";
                        document.getElementById("gameLogo").src = "images/default.jpg";
                        document.getElementById("productList").innerHTML = "<p>目前沒有可購買的商品</p>";
                    }
                })
                .catch(error => {
                    console.error("載入 games.json 失敗:", error);
                    document.getElementById("gameTitle").textContent = "載入失敗";
                });
        } else {
            console.error("未提供遊戲名稱");
            document.getElementById("gameTitle").textContent = "未提供遊戲名稱";
        }
    }
});

async function renderGames() {
    const wrapper = document.getElementById('gamesWrapper');
    if (!wrapper) return; // 如果 wrapper 不存在，直接返回
    wrapper.innerHTML = ""; // 清空當前內容，避免重複

    let gameData = [];

    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("無法載入遊戲資料");
        gameData = await response.json();

        // 確保資料格式是陣列
        if (Array.isArray(gameData)) {
            // 如果是陣列，繼續處理
        } else if (typeof gameData === "object") {
            // 如果是物件，將它轉換為陣列
            gameData = Object.entries(gameData).map(([name, info]) => ({
                name,
                logo: info.logo
            }));
        } else {
            throw new Error("遊戲資料格式不正確");
        }
    } catch (error) {
        console.error("❌ 無法載入 games.json", error);
        return;
    }

    // 確保遊戲總數至少 26 個（兩排，每排 13 個），若不夠則重複填充
    while (gameData.length < 26) {
        gameData = gameData.concat(gameData);
    }

    // 隨機打亂遊戲資料
    gameData = gameData.sort(() => Math.random() - 0.5);

    // 拆成兩組，每組 13 個遊戲
    let gameChunks = [
        gameData.slice(0, 13),
        gameData.slice(13, 26)
    ];

    // 渲染兩排遊戲
    for (let i = 0; i < 2; i++) {
        const slider = document.createElement('div');
        slider.classList.add('game-slider-container');

        slider.innerHTML = `
            <button class="slider-button left" onclick="moveSlide(-1, 'gamesContainer${i}')">❮</button>
            <div class="game-slider" id="gamesContainer${i}"></div>
            <button class="slider-button right" onclick="moveSlide(1, 'gamesContainer${i}')">❯</button>
        `;
        wrapper.appendChild(slider);

        const container = slider.querySelector('.game-slider');

        // 初始時複製 3 倍卡片（13 張變成 39 張），減少動態追加頻率
        const initialMultiplier = 3;
        let extendedGames = [];
        for (let j = 0; j < initialMultiplier; j++) {
            extendedGames = extendedGames.concat(gameChunks[i]);
        }

        // 產生這個 slider 的卡片
        extendedGames.forEach((game, index) => {
            const card = document.createElement('div');
            card.classList.add('card', 'game-card');

            // 建立圖片元素
            const img = document.createElement('img');
            img.src = game.logo;
            img.alt = game.name;
            img.onerror = () => {
                img.src = "images/default.jpg"; // 如果圖片載入失敗，使用預設圖片
                img.onerror = null; // 避免無限循環
            };

            // 建立遊戲名稱
            const text = document.createElement('div');
            text.classList.add('game-title');
            text.textContent = game.name;

            // 把圖片和文字加入卡片
            card.appendChild(img);
            card.appendChild(text);

            // 點擊跳轉到遊戲詳細頁面
            card.addEventListener('click', () => {
                window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
            });

            container.appendChild(card);
        });

        // 設置初始位置為中間（顯示第 5 到第 9 張卡片）
        const visibleCards = 5; // 一次顯示 5 張
        const initialIndex = Math.floor((gameChunks[i].length - visibleCards) / 2); // 基於原始 13 張計算中間位置
        const cardWidth = 220; // 每張卡片的寬度（包含 margin）

        // 設置初始偏移量
        let initialOffset = initialIndex * cardWidth;
        container.style.transform = `translateX(-${initialOffset}px)`;
        container.setAttribute('data-index', initialIndex); // 記住初始索引
        container.setAttribute('data-offset', initialOffset); // 記住初始偏移量
        container.setAttribute('data-original-length', gameChunks[i].length); // 記住原始卡片數量
    }
}

// 滑動功能（實現真正的無限滑動）
function moveSlide(direction, containerId) {
    const container = document.getElementById(containerId);
    const originalLength = parseInt(container.getAttribute('data-original-length')); // 原始卡片數量（13）
    const cardWidth = 220; // 每張卡片的寬度（包含 margin）
    const visibleCards = 5; // 一次顯示 5 張
    let currentIndex = parseInt(container.getAttribute('data-index')) || 0;
    let currentOffset = parseFloat(container.getAttribute('data-offset')) || 0;

    // 計算滑動距離（每次只移動一個卡片）
    const moveDistance = direction * cardWidth;
    currentOffset += moveDistance;
    currentIndex += direction;

    // 計算當前卡片總數
    let totalCards = container.querySelectorAll('.game-card').length;

    // 當往右滑動接近末尾時，追加卡片到末尾
    if (currentIndex >= totalCards - visibleCards - 1) {
        const cards = container.querySelectorAll('.game-card');
        const cardsToAppend = Array.from(cards).slice(0, originalLength); // 複製原始的 13 張卡片
        cardsToAppend.forEach(card => {
            const clonedCard = card.cloneNode(true);
            // 重新綁定事件
            clonedCard.addEventListener('click', () => {
                const gameName = clonedCard.querySelector('.game-title').textContent;
                window.location.href = `game-detail.html?game=${encodeURIComponent(gameName)}`;
            });
            container.appendChild(clonedCard);
        });
        totalCards = container.querySelectorAll('.game-card').length; // 更新總卡片數
    }

    // 當往左滑動接近開頭時，追加卡片到開頭
    if (currentIndex < 1) {
        const cards = container.querySelectorAll('.game-card');
        const cardsToPrepend = Array.from(cards).slice(-originalLength); // 複製最後 13 張卡片
        cardsToPrepend.reverse().forEach(card => {
            const clonedCard = card.cloneNode(true);
            // 重新綁定事件
            clonedCard.addEventListener('click', () => {
                const gameName = clonedCard.querySelector('.game-title').textContent;
                window.location.href = `game-detail.html?game=${encodeURIComponent(gameName)}`;
            });
            container.insertBefore(clonedCard, container.firstChild);
        });
        totalCards = container.querySelectorAll('.game-card').length; // 更新總卡片數
        currentIndex += originalLength; // 調整索引
        currentOffset += originalLength * cardWidth; // 調整偏移量
    }

    // 清理遠離視窗的卡片以優化性能
    const maxCards = originalLength * 5; // 最多保留 5 倍的卡片數量
    if (totalCards > maxCards) {
        if (direction > 0) {
            // 往右滑動，移除開頭的卡片
            const cardsToRemove = totalCards - maxCards;
            for (let i = 0; i < cardsToRemove; i++) {
                container.removeChild(container.firstChild);
            }
            currentIndex -= cardsToRemove;
            currentOffset -= cardsToRemove * cardWidth;
        } else {
            // 往左滑動，移除末尾的卡片
            const cardsToRemove = totalCards - maxCards;
            for (let i = 0; i < cardsToRemove; i++) {
                container.removeChild(container.lastChild);
            }
        }
        totalCards = container.querySelectorAll('.game-card').length; // 更新總卡片數
    }

    // 應用滑動
    container.style.transform = `translateX(-${currentOffset}px)`;
    container.setAttribute('data-index', currentIndex); // 記住當前索引
    container.setAttribute('data-offset', currentOffset); // 記住當前偏移量
}

// 其他功能保持不變
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (event) {
            const targetPage = this.getAttribute("href");
            if (targetPage && (targetPage.endsWith(".html") || targetPage.startsWith("http"))) {
                return; // 讓正常的連結直接跳轉
            }
            event.preventDefault();
        });
    });
});

function loadGameDetails(gameName, game) {
    const gameLogo = document.getElementById("gameLogo");
    document.getElementById("gameTitle").textContent = gameName;
    document.getElementById("gameName").value = gameName;
    gameLogo.src = game.logo;
    gameLogo.onerror = () => {
        gameLogo.src = "images/default.jpg"; // 如果圖片載入失敗，使用預設圖片
        gameLogo.onerror = null; // 避免無限循環
    };
    document.getElementById("gameDescription").innerHTML = `
        請確認好帳戶資料和所購買商品無誤再結帳，感謝您的支持。<br>
        留言版請於帳戶 > 訂單內留言。<br><br>
        歡迎加入 LINE@ 生活圈 ID：@ssbuy (@也要輸入)。<br>
        我們將不定時舉辦抽優惠券與點卡活動哦!
    `;

    const socialContainer = document.querySelector(".social-media p");
    socialContainer.innerHTML = Object.entries(game.social)
        .map(([name, url]) => `<a href="${url}" target="_blank">${name}</a>`)
        .join(" | ");

    // 確保 game.products 存在
    if (game && game.products) {
        loadProducts(game.products);
    } else {
        const productContainer = document.getElementById("productList");
        productContainer.innerHTML = "<p>目前沒有可購買的商品</p>";
    }
}

function loadProducts(products) {
    console.log("載入的產品:", products);
    const productContainer = document.getElementById("productList");
    productContainer.innerHTML = ""; // 清空現有商品

    if (!products || products.length === 0) {
        productContainer.innerHTML = "<p>目前沒有可購買的商品</p>";
        return;
    }

    products.forEach(product => {
        console.log("處理產品:", product);
        const row = document.createElement("div");
        row.classList.add("product-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = product.price;
        checkbox.dataset.name = product.name;
        checkbox.addEventListener("change", updateTotal);

        const name = document.createElement("span");
        name.textContent = product.name;
        name.classList.add("product-name");

        const priceContainer = document.createElement("div");
        priceContainer.classList.add("price-container");
        priceContainer.innerHTML = `<span class="nt-symbol">NT$</span><span class="price-value">${product.price}</span>`;

        row.appendChild(checkbox);
        row.appendChild(name);
        row.appendChild(priceContainer);
        productContainer.appendChild(row);
    });
}

function updateTotal() {
    let total = 0;
    let selectedProducts = [];

    document.querySelectorAll("#productList input[type='checkbox']:checked").forEach(checkbox => {
        total += parseInt(checkbox.value);
        selectedProducts.push(checkbox.dataset.name);
    });

    const selectedProductsField = document.getElementById("selectedProducts");
    selectedProductsField.value = selectedProducts.length > 0 ? selectedProducts.join(" + ") : "購買商品";

    selectedProductsField.style.height = "auto";
    selectedProductsField.style.height = Math.min(selectedProductsField.scrollHeight, 120) + "px";

    document.getElementById("totalAmount").innerHTML = `<strong>結帳總金額: NT$${total}</strong>`;
}

document.addEventListener("DOMContentLoaded", function () {
    fetch("games.json")
        .then(response => response.json())
        .then(data => {
            const gameEntries = Object.entries(data);
            const latestGames = gameEntries.slice(-21).reverse(); // 倒數 21 個，但只取 20 個

            const container = document.getElementById("new-games-container");
            if (container) {
                container.innerHTML = ""; // 清空原本內容

                latestGames.forEach(([name, info]) => {
                    const gameCard = document.createElement("div");
                    gameCard.classList.add("new-game-item");

                    gameCard.innerHTML = `
                        <a href="game-detail.html?game=${encodeURIComponent(name)}">
                            <div class="card new-game-card">
                                <img src="${info.logo}" alt="${name}" onerror="this.src='images/default.jpg'; this.onerror=null;">
                                <div class="game-title">${name}</div>
                            </div>
                        </a>
                    `;
                    container.appendChild(gameCard);
                });
            }
        })
        .catch(error => console.error("Error loading games:", error));
});

document.addEventListener("DOMContentLoaded", function () {
    if (document.body.classList.contains("all-games-page")) {
        loadAllGames();
    }
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

        // 隨機排序遊戲
        games = games.sort(() => Math.random() - 0.5);

        displayGames(games);
    } catch (error) {
        console.error("無法讀取遊戲數據:", error);
    }
}

function displayGames(games) {
    const gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;

    gamesContainer.innerHTML = ""; // 清空現有內容

    games.forEach(game => {
        const gameCard = document.createElement("div");
        gameCard.classList.add("card", "game-card");

        const img = document.createElement("img");
        img.src = game.logo;
        img.alt = game.name;
        img.onerror = () => {
            img.src = "images/default.jpg"; // 如果圖片載入失敗，使用預設圖片
            img.onerror = null; // 避免無限循環
        };

        const gameName = document.createElement("div");
        gameName.classList.add("game-title");
        gameName.textContent = game.name;

        gameCard.appendChild(img);
        gameCard.appendChild(gameName);
        gamesContainer.appendChild(gameCard);

        gameCard.addEventListener("click", () => {
            window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
        });
    });
}

function filterGames() {
    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach(card => {
        const gameName = card.querySelector(".game-title").textContent.toLowerCase();
        card.style.display = gameName.includes(searchQuery) ? "block" : "none";
    });
}