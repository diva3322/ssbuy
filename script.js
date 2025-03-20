document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    let gameName = params.get("game") ? decodeURIComponent(params.get("game")) : "未知遊戲";

    // ✅ 標準化 gameName
    gameName = gameName.trim(); // 去除空格
    gameName = gameName.replace(/[　]/g, ""); // 移除全形空格

    console.log("標準化後的遊戲名稱:", gameName);

    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("載入 JSON 失敗");
        const gamesData = await response.json();

        console.log("讀取的 JSON 數據:", gamesData);
        console.log("查找的遊戲名稱:", gameName);
        console.log("遊戲是否存在:", gamesData.hasOwnProperty(gameName));

        if (gamesData[gameName]) {
            console.log("找到遊戲資料:", gamesData[gameName]);
            loadGameDetails(gameName, gamesData[gameName]);
        } else {
            console.error("⚠️ 找不到對應的遊戲:", gameName);
            document.getElementById("gameTitle").textContent = "找不到遊戲";
        }
    } catch (error) {
        console.error("無法讀取遊戲數據:", error);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (event) {
            const targetPage = this.getAttribute("href");
            if (targetPage && (targetPage.endsWith(".html") || targetPage.startsWith("http"))) {
                return;
            }
            event.preventDefault();
        });
    });
});

function loadGameDetails(gameName, game) {
    document.getElementById("gameTitle").textContent = gameName;
    document.getElementById("gameLogo").src = game.logo;
    document.getElementById("gameName").value = gameName;
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
    loadProducts(game.products);
}

function loadProducts(products) {
    console.log("載入的產品:", products);
    const productContainer = document.getElementById("productList");
    productContainer.innerHTML = "";

    if (products.length === 0) {
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

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("games.json");
        if (!response.ok) throw new Error("載入 JSON 失敗");
        const gamesData = await response.json();

        let games = Object.entries(gamesData);
        games = games.sort(() => Math.random() - 0.5).slice(0, 26);

        const container = document.getElementById("new-games-container");
        container.innerHTML = "";

        games.forEach(([name, info]) => {
            const gameCard = document.createElement("div");
            gameCard.classList.add("new-game-item");

            gameCard.innerHTML = `
                <a href="game-detail.html?game=${encodeURIComponent(name)}">
                    <div class="new-game-card">
                        <img src="${info.logo}" alt="${name}" style="width: 180px; height: 180px; object-fit: cover;">
                        <div class="game-title">${name}</div>
                    </div>
                </a>
            `;
            container.appendChild(gameCard);
        });
    } catch (error) {
        console.error("Error loading games:", error);
    }
});
