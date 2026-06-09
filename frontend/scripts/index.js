let allItems = [];
let filteredItems = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    renderNavAuth();
    setupFilters();
    setupNavSearch();
});

async function loadItems() {
    showLoading(true);
    try {
        const res = await fetch(`${BASE_URL}/items`);
        const data = await res.json();
        allItems = data;
        filteredItems = data;
        updateHeroStats(data);
        renderHeroCards(data);
        renderPage(1);
    } catch (err) {
        showError();
    } finally {
        showLoading(false);
    }
}

function renderPage(page) {
    currentPage = page;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = filteredItems.slice(start, end);
    renderCards(pageItems);
    renderPagination();
}

function renderCards(items) {
    const grid = document.getElementById("products-grid");
    const empty = document.getElementById("empty-state");

    if (items.length === 0) {
        grid.innerHTML = "";
        empty.classList.remove("hidden");
        document.getElementById("pagination").innerHTML = "";
        return;
    }

    empty.classList.add("hidden");
    grid.innerHTML = items.map(item => createCardHTML(item)).join("");

    grid.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", () => {
            window.location.href = `item.html?id=${card.dataset.id}`;
        });
    });
}

function renderPagination() {
    const container = document.getElementById("pagination");
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) { 
        container.innerHTML = ""; 
        return; 
    }

    let html = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="renderPage(${currentPage - 1})">← Previous</button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="renderPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    html += `<button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="renderPage(${currentPage + 1})">Next →</button>`;
    container.innerHTML = html;
}


function updateHeroStats(items) {
    document.getElementById("stat-products").textContent = items.length;
    const totalReviews = items.reduce((sum, i) => sum + (i.reviewCount || 0), 0);
    document.getElementById("stat-reviews").textContent = totalReviews;
    const categories = new Set(items.map(i => i.category)).size;
    document.getElementById("stat-categories").textContent = categories;
} 

function renderHeroCards(items) {
    const container = document.getElementById("hero-cards");
    if (!container) return;
    const featured = items.slice(0, 3);
    container.innerHTML = featured.map(item => `
        <div class="hero-card" onclick="window.location.href='item.html?id=${item.id}'">
            <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.name}">
            <div class="hero-card-info">
                <span class="hero-card-name">${item.name}</span>
                ${getBadgeHTML(item.status)}
                <span class="hero-card-score">${Number(item.avgRating || 0).toFixed(1)}/5</span>
                <span class="hero-card-price">€${Number(item.price).toFixed(2)}</span>
            </div>
        </div>
    `).join("");
}


function setupFilters() {
    document.getElementById("search-input").addEventListener("input", applyFilters);
    document.getElementById("sort-select").addEventListener("change", applyFilters);

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            applyFilters();
        });
    });
}

function applyFilters() {
    const search = document.getElementById("search-input").value.trim().toLocaleLowerCase();
    const category = document.querySelector(".filter-btn.active")?.dataset.category || "all";
    const sort = document.getElementById("sort-select").value;

    let filtered = [...allItems];

    if (category !== "all") {
        filtered = filtered.filter(i => i.category === category);
    }

    if (search) {
        filtered = filtered.filter(i =>
            i.name.toLowerCase().includes(search) ||
            (i.description || "").toLowerCase().includes(search)
        );
    }

    filteredItems = sortItems(filtered, sort);
    renderPage(1);
}


function showLoading(show) {
    document.getElementById("loading-state").classList.toggle("hidden", !show);
    document.getElementById("products-grid").classList.toggle("hidden", show);
}

function showError() {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = `<p class="error-msg">Failed to load products. Make sure the server is running.</p>`;
}
