let allItems = [];
let filteredItems = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    setupNavAuth();
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

    let html = `
        <button class="page-btn page-prev" ${currentPage === 1 ? "disabled" : ""} onclick="renderPage(${currentPage - 1})">
            ← Previous
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="renderPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    html += `
        <button class="page-btn page-next" ${currentPage === totalPages ? "disabled" : ""} onclick="renderPage(${currentPage + 1})">
            Next →
        </button>
    `;

    container.innerHTML = html;
}

function createCardHTML(item) {
    const badge = getBadgeHTML(item.status);
    const stars = getStarsHTML(item.avgRating);
    const image = item.image || "img/placeholder.jpg";

    return `
        <div class="product-card" data-id="${item.id}">
            <div class="card-img-wrap">
                <img src="${image}" alt="${item.name}" class="card-img">
                <div class="card-category">${item.category}</div>
            </div>
            <div class="card-body">
                <h3 class="card-name">${item.name}</h3>
                <p class="card-price">€${Number(item.price).toFixed(2)}</p>
                <div class="card-footer">
                    ${badge}
                    <span class="card-rating">${stars} ${Number(item.avgRating || 0).toFixed(1)}</span>
                </div>
            </div>
        </div>
    `;
}

function getBadgeHTML(status) {
    const map = {
        "Bargain": { cls: "badge-bargain", label: "Bargain" },
        "Worth It": { cls: "badge-worth-it", label: "Worth It" },
        "Overpriced": { cls: "badge-overpriced", label: "Overpriced" },
    };
    const b = map[status] || { clas: "badge-worth-it", label: status || "—" };
    return `<span class="badge ${b.cls}">${b.label}</span>`;
}

function getStarsHTML(rating) {
    const full = Math.round(rating || 0);
    return "★".repeat(full) + "☆".repeat(5 - full);
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

function sortItems(items, sort) {
    switch (sort) {
        case "rating-desc": return [...items].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        case "rating-asc": return [...items].sort((a, b) => (a.avgRating || 0) - (b.avgRating || 0));
        case "price-asc": return [...items].sort((a, b) => a.price - b.price);
        case "price-desc": return [...items].sort((a, b) => b.price - a.price);
        case "bargain": return [...items].sort((a, b) => (a.status === "Bargain" ? -1 : 1));
        default: return items;
    }
}


function setupNavAuth() {
    const container = document.getElementById("nav-auth");
    const userId = localStorage.getItem("userId");

    if (userId) {
        const username = localStorage.getItem("username") || "Profile";
        container.innerHTML = `
            <a href="profile.html" class="btn btn-outline">${username}</a>
            <button class="btn btn-primary" onclick="handleLogout()">Logout</button>
        `;
    } else {
        container.innerHTML = `
            <a href="login.html" class="btn btn-outline">Login</a>
            <a href="register.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.reload();
}


function setupNavSearch() {
    document.getElementById("navbar-search").addEventListener("input", (e) => {
        const filterInput = document.getElementById("search-input");
        if (filterInput) {
            filterInput.value = e.target.value;
            applyFilters();
        }
    });
}


function showLoading(show) {
    document.getElementById("loading-state").classList.toggle("hidden", !show);
    document.getElementById("products-grid").classList.toggle("hidden", show);
}

function showError() {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = `<p class="error-msg">Failed to load products. Make sure the server is running.</p>`;
}
