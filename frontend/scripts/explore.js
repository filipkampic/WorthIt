let allItems = [];
let filteredItems = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

const filters = {
    search: "",
    category: "all",
    priceMin: 0,
    priceMax: 1000,
    minRating: 0,
    bargainOnly: false,
    sort: "default"
};

document.addEventListener("DOMContentLoaded", () => {
    renderNavAuth();
    setupNavSearch();
    setupEventListeners();
    loadItems();
    renderFooterAuth();
    lucide.createIcons();
});

async function loadItems() {
    showLoading(true);
    try {
        const data = await get("/items");
        allItems = data;
        updateStats(data);
        const urlParams = new URLSearchParams(window.location.search);
        const q = urlParams.get("q");
        if (q) {
            filters.search = q;
            document.getElementById("explore-search-input").value = q;
            document.getElementById("explore-search-clear").classList.remove("hidden");
        }
        applyFilters();
    } catch (err) {
        showLoading(false);
        document.getElementById("explore-grid").innerHTML = `<p class="error-msg">Failed to load products. Make sure the server is running.</p>`;
    }
}

function setupEventListeners() {
    let debounceTimer;
    document.getElementById("explore-search-input").addEventListener("input", (e) => {
        filters.search = e.target.value.trim().toLowerCase();
        const clearBtn = document.getElementById("explore-search-clear");
        filters.search ? clearBtn.classList.remove("hidden") : clearBtn.classList.add("hidden");
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 250);
    });

    document.getElementById("explore-search-clear").addEventListener("click", () => {
        filters.search = "";
        document.getElementById("explore-search-input").value = "";
        document.getElementById("explore-search-clear").classList.add("hidden");
        applyFilters();
    });

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filters.category = btn.dataset.category;
            applyFilters();
        });
    });

    const priceMin = document.getElementById("price-min");
    const priceMax = document.getElementById("price-max");

    priceMin.addEventListener("input", () => {
        let min = parseInt(priceMin.value);
        let max = parseInt(priceMax.value);
        if (min > max) priceMin.value = max;
        filters.priceMin = parseInt(priceMin.value);
        document.getElementById("price-min-label").textContent = `€${priceMin.value}`;
        applyFilters();
    });

    priceMax.addEventListener("input", () => {
        let min = parseInt(priceMin.value);
        let max = parseInt(priceMax.value);
        if (max < min) priceMax.value = min;
        filters.priceMax = parseInt(priceMax.value);
        const label = parseInt(priceMax.value) >= 1000 ? "€1000+" : `€${priceMax.value}`;
        document.getElementById("price-max-label").textContent = label;
        applyFilters();
    });

    document.querySelectorAll(".rating-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filters.minRating = parseFloat(btn.dataset.min);
            applyFilters();
        });
    });

    document.getElementById("bargain-toggle").addEventListener("change", (e) => {
        filters.bargainOnly = e.target.checked;
        applyFilters();
    });

    document.getElementById("sort-select").addEventListener("change", (e) => {
        filters.sort = e.target.value;
        applyFilters();
    });

    document.getElementById("btn-reset-filters").addEventListener("click", resetFilters);
}

function applyFilters() {
    let result = [...allItems];

    if (filters.search) {
        result = result.filter(i => 
            i.name.toLowerCase().includes(filters.search) ||
            (i.description || "").toLowerCase().includes(filters.search) ||
            (i.category || "").toLowerCase().includes(filters.search)
        );
    }

    if (filters.category !== "all") {
        result = result.filter(i => i.category === filters.category);
    }

    result = result.filter(i => {
        const price = Number(i.price) || 0;
        const maxOk = filters.priceMax >= 1000 ? true : price <= filters.priceMax;
        return price >= filters.priceMin && maxOk;
    });

    if (filters.minRating > 0) {
        result = result.filter(i => (i.avgRating || 0) >= filters.minRating);
    } 

    if (filters.bargainOnly) {
        result = result.filter(i => i.status === "Bargain");
    }

    result = sortItems(result, filters.sort);

    filteredItems = result;
    document.getElementById("stat-showing").textContent = result.length;
    renderPage(1);
}

function renderPage(page) {
    currentPage = page;
    const pageItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    renderCards(pageItems);
    renderPagination();
}

function renderCards(items) {
    const grid = document.getElementById("explore-grid");
    const empty = document.getElementById("explore-empty");
    showLoading(false);
    if (items.length === 0) {
        grid.innerHTML = "";
        empty.classList.remove("hidden");
        document.getElementById("explore-pagination").innerHTML = "";
        return;
    }
    empty.classList.add("hidden");
    grid.innerHTML = items.map(item => createCardHTML(item)).join("");
    grid.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", () => { window.location.href = `item.html?id=${card.dataset.id}`; });
    });
}

function renderPagination() {
    const container = document.getElementById("explore-pagination");
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

function updateStats(items) {
    document.getElementById("stat-total").textContent = items.length;

    const catCount = {};
    items.forEach(i => { catCount[i.category] = (catCount[i.category] || 0) + 1; });
    const trending = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("stat-trending").textContent = trending ? capitalize(trending[0]) : "—";

    const withRating = items.filter(i => i.avgRating);
    const avg = withRating.length
        ? (withRating.reduce((s, i) => s + i.avgRating, 0) / withRating.length).toFixed(2)
        : "—";
    document.getElementById("stat-avg-rating").textContent = avg !== "—" ? `${avg} ★` : "—";

    document.getElementById("stat-showing").textContent = items.length;
}

function resetFilters() {
    filters.search = "";
    filters.category = "all";
    filters.priceMin = 0;
    filters.priceMax = 1000;
    filters.minRating = 0;
    filters.bargainOnly = false;
    filters.sort = "default";

    document.getElementById("explore-search-input").value = "";
    document.getElementById("explore-search-clear").classList.add("hidden");
    document.getElementById("price-min").value = 0;
    document.getElementById("price-max").value = 1000;
    document.getElementById("price-min-label").textContent = "€0";
    document.getElementById("price-max-label").textContent = "€1000+";
    document.getElementById("bargain-toggle").checked = false;
    document.getElementById("sort-select").value = "default";

    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(".category-btn[data-category='all']").classList.add("active");
    document.querySelectorAll(".rating-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(".rating-btn[data-min='0']").classList.add("active");

    applyFilters();
}

function showLoading(show) {
    document.getElementById("explore-loading").classList.toggle("hidden", !show);
    document.getElementById("explore-grid").classList.toggle("hidden", show);
}
