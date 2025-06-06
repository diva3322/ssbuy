document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 1024;
  if (isMobile) {
    document.body.classList.add("mobile-vertical");
  }

  // ✅ 如果是禮包碼頁面，只跑這個，然後直接 return
  if (document.body.classList.contains("giftcodes-page")) {
    loadLatestGames();
    return;
  }

  // ✅ 如果是首頁才跑 renderGames
  if (document.body.classList.contains("index-page")) {
    renderGames();

    window.addEventListener("resize", () => {
      const isNowMobile = window.innerWidth <= 1024;
      const isMobileVertical = document.body.classList.contains("mobile-vertical");

      if (isNowMobile && !isMobileVertical) {
        document.body.classList.add("mobile-vertical");
        renderGames();
      }

      if (!isNowMobile && isMobileVertical) {
        document.body.classList.remove("mobile-vertical");
        renderGames();
      }
    });
  }

  // ✅ 處理 game-detail 頁面載入（⚠️ 原本寫在外面，會導致錯誤）
  if (document.body.classList.contains("game-detail")) {
    const urlParams = new URLSearchParams(window.location.search);
    const gameName = urlParams.get("game") ? decodeURIComponent(urlParams.get("game")) : "未知遊戲";

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
	
	// 📌 根據是否為手機版（垂直）決定用哪種渲染邏輯
const isMobileVertical = window.innerWidth <= 1024;


if (isMobileVertical) {
  renderVerticalLoopSlider(wrapper, gameChunks);
  return; // ✅ 完成手機版渲染就跳出
}
	
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
    document.getElementById("gameTitle").textContent =  `${gameName} 代儲值`;
    document.getElementById("gameName").value = gameName;
    gameLogo.src = game.logo;
    gameLogo.onerror = () => {
        gameLogo.src = "images/default.jpg"; // 如果圖片載入失敗，使用預設圖片
        gameLogo.onerror = null; // 避免無限循環
    };
    document.getElementById("gameDescription").innerHTML = `
        請確認好帳戶資料和所購買商品無誤再結帳，感謝您的支持。<br>
        一切問題歡迎私訊官方@客服。<br>
        歡迎加入 LINE@ 生活圈 ID：@ssbuy (@也要輸入)。<br>
        我們將不定時舉辦抽優惠券與點卡活動哦!
    `;

const socialContainer = document.querySelector(".social-media p");

const socialLinks = Object.entries(game.social).map(([name, url]) => {
  const link = url && url !== "N" ? url : "#";
  return `<a href="${link}" target="_blank">${name}</a>`;
});

// 分割點：前 3 個在第一行，後面在第二行（即使是 # 也保留 <a>）
const line1 = socialLinks.slice(0, 3).join(" | ");
const line2 = socialLinks.slice(3).join(" | ");

socialContainer.innerHTML = `
  <div class="social-line line1">${line1}</div>
  <div class="social-line line2">${line2}</div>
`;

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
            const latestGames = gameEntries.slice(-15).reverse(); // 倒數 21 個，但只取 20 個

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

document.addEventListener("DOMContentLoaded", () => {
  // -- 既有功能: renderGames() / etc -- 
  // 請保持原本代碼不動

  // ★ 新增: 手機版漢堡按鈕
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const mobileDropdown = document.querySelector(".mobile-dropdown-menu");

  if (mobileToggle && mobileDropdown) {
    mobileToggle.addEventListener("click", () => {
      if (mobileDropdown.style.display === "block") {
        mobileDropdown.style.display = "none";
      } else {
        mobileDropdown.style.display = "block";
      }
    });
  }

  // -- 其餘功能繼續 --
});

function renderVerticalLoopSlider(wrapper, gameChunks) {
  for (let i = 0; i < 2; i++) {
    const slider = document.createElement("div");
    slider.classList.add("game-slider-container");

    const sliderInner = document.createElement("div");
    sliderInner.classList.add("game-slider");

    slider.appendChild(sliderInner);
    wrapper.appendChild(slider);

    // 複製資料增加循環性
    let extended = [];
    for (let j = 0; j < 10; j++) {
      extended = extended.concat(gameChunks[i]);
    }

    function createCard(game) {
      const card = document.createElement("div");
      card.classList.add("card", "game-card");

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

      card.addEventListener("click", () => {
        window.location.href = `game-detail.html?game=${encodeURIComponent(game.name)}`;
      });

      return card;
    }

    // 初始填入
    extended.forEach(game => {
      sliderInner.appendChild(createCard(game));
    });

    // 無限滾動：往下補
    slider.addEventListener("scroll", () => {
      if (slider.scrollTop + slider.clientHeight >= slider.scrollHeight - 10) {
        extended.forEach(game => {
          sliderInner.appendChild(createCard(game));
        });
      }

      // 無限滾動：往上補
      if (slider.scrollTop <= 10) {
        const scrollOffset = slider.scrollTop;
        const cardsToAdd = extended.slice().reverse();
        cardsToAdd.forEach(game => {
          const card = createCard(game);
          sliderInner.insertBefore(card, sliderInner.firstChild);
          slider.scrollTop += card.offsetHeight; // 調整 scrollTop，避免畫面跳動
        });
      }
    });
  }
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const isNowMobile = window.innerWidth <= 1024;

    // 如果目前是首頁才執行
    if (document.body.classList.contains("index-page")) {
      const wrapper = document.getElementById("gamesWrapper");
      if (wrapper) {
        wrapper.innerHTML = "";     // 清空舊卡片
        if (isNowMobile) {
          document.body.classList.add("mobile-vertical");
        } else {
          document.body.classList.remove("mobile-vertical");
        }
        renderGames();             // 重新載入卡片
      }
    }
  }, 10); // debounce：延遲 200ms 觸發
});


	//禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容 禮包碼的內容
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const game = params.get("game") || "遊戲名稱";

    // 填入所有 ID 包含 "gameName"
    document.querySelectorAll('[id^="gameName"]').forEach(el => {
        el.textContent = game;
    });
    document.getElementById("giftTitle").textContent = `${game} 禮包碼領取`;
});

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const game = decodeURIComponent(params.get("game") || "未知遊戲");

    document.querySelectorAll('[id^="gameName"]').forEach(el => el.textContent = game);
    document.getElementById("giftTitle").textContent = `${game} 最新禮包碼|兌換碼|序號|免費領取`;

    try {
        const res = await fetch("gift-codes-data.json");
        const data = await res.json();

        if (!data[game]) {
            document.querySelector(".content-box").innerHTML += `<p>❌ 找不到 ${game} 的資料</p>`;
            return;
        }

        const gameData = data[game];
		
    // 🔥 設定橫幅圖片
    const bannerPath = `giftcodesbanner/${gameData.banner || "default.jpg"}`;
    const bannerImg = document.getElementById("giftBanner");
    if (bannerImg) {
        bannerImg.src = bannerPath;
    };

        // 設定介紹文字
        document.getElementById("section4").innerHTML += `<p> <span class="normal">${gameData.description}</span></p>`;


        // 填入禮包碼表格
        const tbody = document.querySelector(".gift-table tbody");
        tbody.innerHTML = "";
        gameData.codes.forEach(item => {
            const row = `<tr><td>${item.code}</td><td>${item.reward}</td></tr>`;
            tbody.insertAdjacentHTML("beforeend", row);
        });

        // 填入兌換教學
        const howTo = document.getElementById("section3");
        const steps = gameData.howTo.map(step => `<li>${step}</li>`).join("");
        howTo.innerHTML += `<ol>${steps}</ol>`;

    } catch (e) {
        console.error("讀取禮包碼資料錯誤", e);
    }
	    // ✅ 加在這裡，專門給禮包碼頁面跑最新遊戲卡片
    if (document.body.classList.contains("giftcodes-page")) {
        loadLatestGames();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            target?.scrollIntoView({ behavior: "smooth" });
        });
    });
});

async function loadLatestGames(limit = 10) {
  const res = await fetch("games.json");
  const data = await res.json();
  const container = document.getElementById("gamesWrapper");
  if (!container) return;

  container.innerHTML = "";
  container.className = "fixed-card-grid";

  const gameNames = Object.keys(data).slice(-limit).reverse();
  const isMobile = window.innerWidth <= 1024;

  gameNames.forEach((name) => {
    const game = data[name];
    const card = document.createElement("div");
    card.className = "card game-card";

    const img = document.createElement("img");
    img.src = game.logo;
    img.alt = name;
    img.onerror = () => {
      img.src = "images/default.jpg";
    };

    const title = document.createElement("div");
    title.className = "game-title";
    title.textContent = name;

    card.appendChild(img);
    card.appendChild(title);
    card.onclick = () => (location.href = `game-detail.html?game=${encodeURIComponent(name)}`);
    container.appendChild(card);
  });

  // ✅ 加上對應的 CSS 類名，用來控制每排幾個
  container.classList.add(isMobile ? "gift-mobile-grid" : "gift-desktop-grid");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".zoomable").forEach(img => {
    img.addEventListener("click", () => {
      const fullSrc = img.dataset.src;

      const overlay = document.createElement("div");
      overlay.className = "image-lightbox-overlay";

      const fullImage = document.createElement("img");
      fullImage.src = fullSrc;

      overlay.appendChild(fullImage);
      document.body.appendChild(overlay);

      overlay.addEventListener("click", () => {
        overlay.classList.add("fade-out");
        setTimeout(() => overlay.remove(), 300); // 動畫結束後移除
      });
    });
  });
});
