// ====== 通用功能 (所有頁面都會執行) ======

document.addEventListener("DOMContentLoaded", () => {
    // 手機版 body class 判斷
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
        document.body.classList.add("mobile-vertical");
    }

    // ★ 修正漢堡選單邏輯：確保它在任何頁面都可執行且不被跳過
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileDropdownMenu = document.querySelector(".mobile-dropdown-menu");
    if (mobileMenuToggle && mobileDropdownMenu) {
        mobileMenuToggle.addEventListener("click", () => {
            mobileDropdownMenu.classList.toggle("open"); // 使用 toggle，更簡潔
            // 讓手機選單的開合也影響 body 的 overflow，避免滾動
            document.body.classList.toggle("no-scroll"); 
        });
    }

    // 圖片放大燈箱效果 (zoomable class)
    document.querySelectorAll(".zoomable").forEach(img => {
        img.addEventListener("click", () => {
            const fullSrc = img.dataset.src || img.src;

            const overlay = document.createElement("div");
            overlay.className = "image-lightbox-overlay";

            const fullImage = document.createElement("img");
            fullImage.src = fullSrc;

            overlay.appendChild(fullImage);
            document.body.appendChild(overlay);

            overlay.addEventListener("click", () => {
                overlay.classList.add("fade-out");
                setTimeout(() => overlay.remove(), 300);
            });
        });
    });

    // 錨點連結平滑滾動
    // 修正：只對「純錨點」連結執行平滑滾動，避免干擾完整 URL 的連結
    document.querySelectorAll("a[href]").forEach(anchor => { // 選擇所有有 href 屬性的 a 標籤
        const href = anchor.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) { // 確保是純錨點連結 (e.g. #section1, 而非 # 或 #game)
            anchor.addEventListener("click", function (e) {
                e.preventDefault(); // 阻止預設跳轉行為
                const target = document.querySelector(href);
                target?.scrollIntoView({ behavior: "smooth" });
            });
        }
    });

    // ===== 頁面專屬邏輯 (只在特定頁面執行) ======

    // 首頁 (index.html) 邏輯
    if (document.body.classList.contains("index-page")) {
        renderGames(); // 渲染首頁遊戲卡片

        // 監聽窗口大小調整，重新渲染遊戲卡片
        window.addEventListener("resize", () => {
            const isNowMobile = window.innerWidth <= 1024;
            const wrapper = document.getElementById("gamesWrapper");
            if (wrapper) {
                // 檢查是否需要重新渲染
                const currentIsMobileVertical = document.body.classList.contains("mobile-vertical");
                if ((isNowMobile && !currentIsMobileVertical) || (!isNowMobile && currentIsMobileVertical)) {
                    wrapper.innerHTML = "";
                    if (isNowMobile) {
                        document.body.classList.add("mobile-vertical");
                    } else {
                        document.body.classList.remove("mobile-vertical");
                    }
                    renderGames();
                }
            }
        });
    }

    // 所有遊戲頁面 (all-games.html) 邏輯
    if (document.body.classList.contains("all-games-page")) {
        loadAllGames(); // 載入並顯示所有遊戲
        // filterGames() 函數會由 input 的 oninput 事件觸發，不需要在這裡 DOMContentLoaded 額外綁定
    }

    // 新上遊戲頁面 (new-games.html) 邏輯
    if (document.body.classList.contains("new-games-page")) {
        loadNewGamesContent(); // 專門為 new-games.html 載入最新遊戲
    }

    // 遊戲詳情頁 (game-detail.html) 邏輯
    if (document.body.classList.contains("game-detail")) {
        const urlParams = new URLSearchParams(window.location.search);
        const gameName = urlParams.get("game") ? decodeURIComponent(urlParams.get("game")) : "未知遊戲";

        if (gameName) {
            fetch("games.json")
                .then(response => {
                    if (!response.ok) throw new Error("載入 games.json 失敗: " + response.statusText);
                    return response.json();
                })
                .then(data => {
                    const game = data[gameName];
                    if (game) {
                        loadGameDetails(gameName, game); // 載入遊戲詳情
                    } else {
                        console.error("找不到遊戲:", gameName);
                        document.getElementById("gameTitle").textContent = "找不到遊戲";
                        document.getElementById("gameLogo").src = "images/default.jpg";
                        document.getElementById("productList").innerHTML = "<p>目前沒有可購買的商品</p>";
                    }
                })
                .catch(error => {
                    console.error("載入遊戲詳情失敗:", error);
                    document.getElementById("gameTitle").textContent = "載入失敗";
                    document.getElementById("gameLogo").src = "images/default.jpg";
                    document.getElementById("productList").innerHTML = "<p>載入商品失敗</p>"; // 提供友善錯誤訊息
                });
        } else {
            console.error("未提供遊戲名稱");
            document.getElementById("gameTitle").textContent = "未提供遊戲名稱";
            document.getElementById("gameLogo").src = "images/default.jpg";
            document.getElementById("productList").innerHTML = "<p>請選擇一個遊戲</p>";
        }
    }

// 禮包碼頁面 (giftcodes.html) 邏輯
if (document.body.classList.contains("giftcodes-page")) {
    const params = new URLSearchParams(window.location.search);
    const game = decodeURIComponent(params.get("game") || "未知遊戲"); // 取得 URL 中的遊戲名稱

    document.querySelectorAll('[id^="gameName"]').forEach(el => el.textContent = game);
    document.getElementById("giftTitle").textContent = `${game} 最新禮包碼|兌換碼|序號|免費領取`;

    fetch("gift-codes-data.json")
        .then(res => {
            if (!res.ok) throw new Error("載入 gift-codes-data.json 失敗");
            return res.json();
        })
        .then(data => {
            if (!data[game]) {
                document.querySelector(".content-box").innerHTML += `<p>❌ 找不到 ${game} 的禮包碼資料</p>`;
                return;
            }
            const gameData = data[game];

            // 設定橫幅圖片
            const bannerPath = gameData.banner || "giftcodesbanner/default.jpg";
            const bannerImg = document.getElementById("giftBanner");
            if (bannerImg) {
                bannerImg.src = bannerPath;
            }

            // 設定介紹文字
            const section4Element = document.getElementById("section4");
            if (section4Element) {
                section4Element.innerHTML += `<p> <span class="normal">${gameData.description}</span></p>`;
            }

            // 填入禮包碼表格
            const tbody = document.querySelector(".gift-table tbody");
            if (tbody) {
                tbody.innerHTML = "";
                gameData.codes.forEach(item => {
                    const row = `<tr><td>${item.code}</td><td>${item.reward}</td></tr>`;
                    tbody.insertAdjacentHTML("beforeend", row);
                });
            }

            // 填入兌換教學
            const howToElement = document.getElementById("section3");
            if (howToElement) {
                const steps = gameData.howTo.map(step => `<li>${step}</li>`).join("");
                howToElement.innerHTML += `<ol>${steps}</ol>`;
            }
        })
        .catch(e => {
            console.error("讀取禮包碼資料錯誤", e);
            const contentBox = document.querySelector(".content-box");
            if (contentBox) {
                contentBox.innerHTML += `<p style="color: red;">載入禮包碼資料失敗：${e.message}</p>`;
            }
        });
        
    // 設定返回儲值頁面的連結
    const backToGameDetailBtn = document.getElementById("backToGameDetailBtn");
    if (backToGameDetailBtn) {
        backToGameDetailBtn.href = `game-detail.html?game=${encodeURIComponent(game)}`;
    }
    
    loadLatestGamesInGiftcodesPage(); // 專門為禮包碼頁面載入最新遊戲卡片
}

    // 文章頁面 (articles.html) 邏輯
    if (document.body.classList.contains("articles-page")) {
        console.log("articles.html 頁面載入，無需額外 JavaScript 渲染文章。");

        const searchBox = document.querySelector('.articles-search-bar');
        if (searchBox) {
            searchBox.addEventListener('input', function() {
                const searchText = this.value.toLowerCase();
                document.querySelectorAll('.article-card').forEach(card => {
                    const titleElement = card.querySelector('h3');
                    const descriptionElement = card.querySelector('p');
                    const content = (titleElement ? titleElement.textContent.toLowerCase() : '') +
                                    (descriptionElement ? descriptionElement.textContent.toLowerCase() : '');

                    if (content.includes(searchText)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    }
});


// ====== 函數定義 (所有頁面可能調用，或只在特定頁面調用) ======

async function renderGames() {
    const wrapper = document.getElementById('gamesWrapper');
    if (!wrapper) return;
    wrapper.innerHTML = "";

    let gameData = [];
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("無法載入 games.json: " + response.statusText);
        gameData = await response.json();

        // 檢查 games.json 是物件的情況，轉換為陣列
        if (!Array.isArray(gameData)) {
             gameData = Object.entries(gameData).map(([name, info]) => ({
                name,
                logo: info.logo,
                // 如果需要，也可以將其他 info 屬性帶過來
            }));
        }
    } catch (error) {
        console.error("❌ 無法載入 games.json (renderGames):", error);
        wrapper.innerHTML = `<p style="color: red;">載入遊戲列表失敗，請稍後再試。</p>`;
        return;
    }

    // 確保遊戲總數至少 26 個（兩排，每排 13 個），若不夠則重複填充
    while (gameData.length < 26) {
        gameData = gameData.concat(gameData);
    }
    gameData = gameData.sort(() => Math.random() - 0.5);
    let gameChunks = [
        gameData.slice(0, 13),
        gameData.slice(13, 26)
    ];

    const isMobileVertical = window.innerWidth <= 1024;
    if (isMobileVertical) {
        renderVerticalLoopSlider(wrapper, gameChunks);
        return;
    }

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
        const initialMultiplier = 3;
        let extendedGames = [];
        for (let j = 0; j < initialMultiplier; j++) {
            extendedGames = extendedGames.concat(gameChunks[i]);
        }

        extendedGames.forEach((game) => {
            const card = document.createElement('a'); // 將 card 直接設為 a 標籤
            card.classList.add('card', 'game-card');
            card.href = `game-detail.html?game=${encodeURIComponent(game.name)}`; // 設定 href

            const img = document.createElement('img');
            img.src = game.logo;
            img.alt = game.name;
            img.onerror = () => {
                img.src = "images/default.jpg";
                img.onerror = null;
            };

            const text = document.createElement('div');
            text.classList.add('game-title');
            text.textContent = game.name;

            card.appendChild(img);
            card.appendChild(text);
            container.appendChild(card);
        });

        const visibleCards = 5;
        const initialIndex = Math.floor((gameChunks[i].length - visibleCards) / 2);
        const cardWidth = 220;

        let initialOffset = initialIndex * cardWidth;
        container.style.transform = `translateX(-${initialOffset}px)`;
        container.setAttribute('data-index', initialIndex);
        container.setAttribute('data-offset', initialOffset);
        container.setAttribute('data-original-length', gameChunks[i].length);
    }
}

// 滑動功能（實現真正的無限滑動）
function moveSlide(direction, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const originalLength = parseInt(container.getAttribute('data-original-length'));
    const cardWidth = 220;
    const visibleCards = 5;
    let currentIndex = parseInt(container.getAttribute('data-index')) || 0;
    let currentOffset = parseFloat(container.getAttribute('data-offset')) || 0;

    const moveDistance = direction * cardWidth;
    currentOffset += moveDistance;
    currentIndex += direction;

    let totalCards = container.querySelectorAll('.game-card').length;

    if (direction > 0) { // Moving right
        if (currentIndex >= totalCards - visibleCards - 1) {
            const cards = container.querySelectorAll('.game-card');
            const cardsToAppend = Array.from(cards).slice(0, originalLength);
            cardsToAppend.forEach(card => {
                const clonedCard = card.cloneNode(true);
                // 重新綁定事件，因為 cloneNode(true) 不會複製事件監聽器
                // 確保 cloneNode 的點擊事件也是正確的 href
                const gameNameElement = clonedCard.querySelector('.game-title');
                if (gameNameElement) {
                    const gameName = gameNameElement.textContent;
                    clonedCard.href = `game-detail.html?game=${encodeURIComponent(gameName)}`;
                } else {
                    clonedCard.href = `game-detail.html`; // fallback
                }
                container.appendChild(clonedCard);
            });
        }
    } else { // Moving left
        if (currentIndex < 1) {
            const cards = container.querySelectorAll('.game-card');
            const cardsToPrepend = Array.from(cards).slice(-originalLength);
            cardsToPrepend.reverse().forEach(card => {
                const clonedCard = card.cloneNode(true);
                // 重新綁定事件
                const gameNameElement = clonedCard.querySelector('.game-title');
                if (gameNameElement) {
                    const gameName = gameNameElement.textContent;
                    clonedCard.href = `game-detail.html?game=${encodeURIComponent(gameName)}`;
                } else {
                    clonedCard.href = `game-detail.html`; // fallback
                }
                container.insertBefore(clonedCard, container.firstChild);
            });
            currentIndex += originalLength;
            currentOffset += originalLength * cardWidth;
        }
    }

    totalCards = container.querySelectorAll('.game-card').length; // Update totalCards after appending/prepending

    const maxCards = originalLength * 5;
    if (totalCards > maxCards) {
        if (direction > 0) {
            const cardsToRemove = totalCards - maxCards;
            for (let i = 0; i < cardsToRemove; i++) {
                if (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            }
            currentIndex -= cardsToRemove;
            currentOffset -= cardsToRemove * cardWidth;
        } else {
            const cardsToRemove = totalCards - maxCards;
            for (let i = 0; i < cardsToRemove; i++) {
                if (container.lastChild) {
                    container.removeChild(container.lastChild);
                }
            }
        }
    }

    container.style.transform = `translateX(-${currentOffset}px)`;
    container.setAttribute('data-index', currentIndex);
    container.setAttribute('data-offset', currentOffset);
}

function renderVerticalLoopSlider(wrapper, gameChunks) {
    for (let i = 0; i < 2; i++) {
        const slider = document.createElement("div");
        slider.classList.add("game-slider-container");

        const sliderInner = document.createElement("div");
        sliderInner.classList.add("game-slider");

        slider.appendChild(sliderInner);
        wrapper.appendChild(slider);

        let extended = [];
        for (let j = 0; j < 10; j++) {
            extended = extended.concat(gameChunks[i]);
        }

        function createCard(game) {
            const card = document.createElement("a"); // 這裡也改為 a 標籤
            card.classList.add("card", "game-card");
            card.href = `game-detail.html?game=${encodeURIComponent(game.name)}`; // 設定 href

            const img = document.createElement("img");
            img.src = game.logo;
            img.alt = game.name;
            img.onerror = () => {
                img.src = "images/default.jpg";
                img.onerror = null;
            };

            const text = document.createElement("div");
            text.classList.add("game-title");
            text.textContent = game.name;

            card.appendChild(img);
            card.appendChild(text);
            return card;
        }

        extended.forEach(game => {
            sliderInner.appendChild(createCard(game));
        });

        slider.addEventListener("scroll", () => {
            if (slider.scrollTop + slider.clientHeight >= slider.scrollHeight - 10) {
                extended.forEach(game => {
                    sliderInner.appendChild(createCard(game));
                });
            }

            if (slider.scrollTop <= 10) {
                const cardsToAdd = extended.slice().reverse();
                cardsToAdd.forEach(game => {
                    const card = createCard(game);
                    sliderInner.insertBefore(card, sliderInner.firstChild);
                    slider.scrollTop += card.offsetHeight;
                });
            }
        });
    }
}


function loadGameDetails(gameName, game) {
    const gameLogo = document.getElementById("gameLogo");
    if (gameLogo) { // null check
        gameLogo.src = game.logo;
        gameLogo.alt = gameName;
        gameLogo.onerror = () => {
            gameLogo.src = "images/default.jpg";
            gameLogo.onerror = null;
        };
    }
    
    const gameTitleElement = document.getElementById("gameTitle");
    if (gameTitleElement) { // null check
        gameTitleElement.textContent = `${gameName} 代儲值`;
    }

    const gameNameInput = document.getElementById("gameName");
    if (gameNameInput) { // null check
        gameNameInput.value = gameName;
    }

    const gameDescriptionElement = document.getElementById("gameDescription");
    if (gameDescriptionElement) { // null check
        gameDescriptionElement.innerHTML = `
            請確認好帳戶資料和所購買商品無誤再結帳，感謝您的支持。<br>
            一切問題歡迎私訊官方@客服。<br>
            歡迎加入 LINE@ 生活圈 ID：@ssbuy (@也要輸入)。<br>
            我們將不定時舉辦抽優惠券與點卡活動哦!
        `;
    }
	
	    // 新增：設定攻略與禮包碼連結
    const gameArticleLink = document.getElementById("gameArticleLink");
    if (gameArticleLink) {
        gameArticleLink.href = `articles.html?game=${encodeURIComponent(gameName)}`;
    }
    const gameGiftCodeLink = document.getElementById("gameGiftCodeLink");
    if (gameGiftCodeLink) {
        gameGiftCodeLink.href = `gift-codes.html?game=${encodeURIComponent(gameName)}`;
    }

    const socialContainer = document.querySelector(".social-media p");
    if (socialContainer) {
        const socialLinks = Object.entries(game.social).map(([name, url]) => {
            const link = url && url !== "N" ? url : "#";
            return `<a href="${link}" target="_blank">${name}</a>`;
        });

        const line1 = socialLinks.slice(0, 3).join(" | ");
        const line2 = socialLinks.slice(3).join(" | ");

        socialContainer.innerHTML = `
            <div class="social-line line1">${line1}</div>
            <div class="social-line line2">${line2}</div>
        `;
    }

    if (game && game.products) {
        loadProducts(game.products);
    } else {
        const productContainer = document.getElementById("productList");
        if (productContainer) {
            productContainer.innerHTML = "<p>目前沒有可購買的商品</p>";
        }
    }
}

function loadProducts(products) {
    const productContainer = document.getElementById("productList");
    if (!productContainer) return;

    productContainer.innerHTML = "";

    if (!products || products.length === 0) {
        productContainer.innerHTML = "<p>目前沒有可購買的商品</p>";
        return;
    }

    products.forEach(product => {
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
		priceContainer.innerHTML = `<span class="price-value">NT$${product.price}</span>`;


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
    if (selectedProductsField) {
        selectedProductsField.value = selectedProducts.length > 0 ? selectedProducts.join(" + ") : "購買商品";
        selectedProductsField.style.height = "auto";
        selectedProductsField.style.height = Math.min(selectedProductsField.scrollHeight, 120) + "px";
    }

    const totalAmountElement = document.getElementById("totalAmount");
    if (totalAmountElement) {
        totalAmountElement.innerHTML = `<strong>結帳總金額: NT$${total}</strong>`;
    }
}

function filterGames() {
    const searchQuery = document.getElementById("searchBox").value.toLowerCase();
    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach(card => {
        const gameName = card.querySelector(".game-title").textContent.toLowerCase();
        card.style.display = gameName.includes(searchQuery) ? "block" : "none";
    });
}


async function loadAllGames() {
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("載入 JSON 失敗");
        const gamesData = await response.json();

        let games = Object.keys(gamesData).map(gameName => ({
            name: gameName,
            logo: gamesData[gameName].logo
        }));

        games = games.sort(() => Math.random() - 0.5);

        displayGames(games);
    } catch (error) {
        console.error("無法讀取遊戲數據:", error);
        const gamesContainer = document.getElementById("gamesContainer");
        if(gamesContainer) {
            gamesContainer.innerHTML = `<p style="color: red;">無法載入所有遊戲列表。</p>`;
        }
    }
}

function displayGames(games) {
    const gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;

    gamesContainer.innerHTML = "";

    games.forEach(game => {
        const gameCard = document.createElement("a"); // 改為 <a> 標籤
        gameCard.classList.add("card", "game-card");
        gameCard.href = `game-detail.html?game=${encodeURIComponent(game.name)}`; // 設定 href

        const img = document.createElement("img");
        img.src = game.logo;
        img.alt = game.name;
        img.onerror = () => {
            img.src = "images/default.jpg";
            img.onerror = null;
        };

        const gameName = document.createElement("div");
        gameName.classList.add("game-title");
        gameName.textContent = game.name;

        gameCard.appendChild(img);
        gameCard.appendChild(gameName);
        gamesContainer.appendChild(gameCard);

        // 移除 click event listener，因為 <a> 標籤的 href 會自動處理導航
        // gameCard.addEventListener("click", () => {
        //     window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
        // });
    });
}

// Function to load latest games specifically for new-games.html
async function loadNewGamesContent() {
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("無法載入遊戲資料");
        const data = await response.json();

        const gameEntries = Object.entries(data);
        const latestGames = gameEntries.slice(-15).reverse();

        const container = document.getElementById("new-games-container");
        if (container) {
            container.innerHTML = "";

            latestGames.forEach(([name, info]) => {
                const gameCard = document.createElement("a"); // 改為 <a> 標籤
                gameCard.classList.add("new-game-item");
                gameCard.href = `game-detail.html?game=${encodeURIComponent(name)}`; // 設定 href

                gameCard.innerHTML = `
                    <div class="card new-game-card">
                        <img src="${info.logo}" alt="${name}" onerror="this.src='images/default.jpg'; this.onerror=null;">
                        <div class="game-title">${name}</div>
                    </div>
                `;
                container.appendChild(gameCard);
            });
        }
    } catch (error) {
        console.error("Error loading new games content:", error);
        const container = document.getElementById("new-games-container");
        if(container) {
            container.innerHTML = `<p style="color: red;">無法載入最新遊戲列表。</p>`;
        }
    }
}

// Function to load latest games specifically for giftcodes.html
async function loadLatestGamesInGiftcodesPage(limit = 10) {
    const res = await fetch("games.json");
    const data = await res.json();
    const container = document.getElementById("new-games-container"); // 這是禮包碼頁面最新遊戲的容器 ID
    if (!container) return;

    container.innerHTML = "";
    container.className = "fixed-card-grid";

    const gameNames = Object.keys(data).slice(-limit).reverse();
    const isMobile = window.innerWidth <= 1024;

    gameNames.forEach((name) => {
        const game = data[name];
        const card = document.createElement("a"); // 這裡也改為 a 標籤
        card.className = "card game-card";
        card.href = `game-detail.html?game=${encodeURIComponent(name)}`; // 設定 href

        const img = document.createElement("img");
        img.src = game.logo;
        img.alt = name;
        img.onerror = () => {
            img.src = "images/default.jpg";
            img.onerror = null;
        };

        const title = document.createElement("div");
        title.className = "game-title";
        title.textContent = name;

        card.appendChild(img);
        card.appendChild(title);
        container.appendChild(card);
    });

    container.classList.add(isMobile ? "gift-mobile-grid" : "gift-desktop-grid");
}