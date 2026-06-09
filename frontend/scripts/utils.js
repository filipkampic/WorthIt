/* auth */
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}


/* navbar */
function setupNavSearch() {
    const input = document.getElementById("navbar-search");
    if (!input) return;

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const q = input.value.trim();
            if (q) window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
        }
    });
}

function handleNavSearch() {
    const input = document.getElementById("navbar-search");
    if (!input) return;
    const q = input.value.trim();
    if (q) window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
}

function renderNavAuth() {
    const navAuth = document.getElementById("nav-auth");
    if (!navAuth) return;
    const username = localStorage.getItem("username");
    if (username) {
        navAuth.innerHTML = `
            <a href="profile.html" class="btn btn-ghost btn-sm">${username}</a>
            <button class="btn btn-primary btn-sm" onclick="logout()">Logout</button>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="login.html" class="btn btn-ghost btn-sm">Login</a>
            <a href="register.html" class="btn btn-primary btn-sm">Sign Up</a>
        `;
    }
}

/* formatting */
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(createdAt) {
    if (!createdAt) return "";
    const ms = createdAt._seconds
        ? createdAt._seconds * 1000
        : new Date(createdAt).getTime();
    return new Date(ms).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
    });
}

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) =>
        `<span class="star ${i < rating ? "filled" : ""}">★</span>`
    ).join("");
}

function getStarsHTML(rating) {
    const full = Math.round(rating || 0);
    return "★".repeat(full) + "☆".repeat(5 - full);
}


/* cards */
function createCardHTML(item) {
    const badge = getBadgeHTML(item.status);
    const stars = getStarsHTML(item.avgRating);
    const image = item.image || "img/placeholder.jpg";

    return `
        <div class="product-card" data-id="${item.id}">
            <div class="card-img-wrap">
                <img src="${image}" alt="${item.name}" class="card-img">
                <div class="card-category">${capitalize(item.category || "")}</div>
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

/* status */
function getStatusClass(status) {
    if (status === "Bargain") return "bargain";
    if (status === "Overpriced") return "overpriced";
    return "worth-it";
}

/* badges */
function getBadgeHTML(status) {
    const map = {
        "Bargain": { cls: "badge-bargain", label: "Bargain" },
        "Worth It": { cls: "badge-worth-it", label: "Worth It" },
        "Overpriced": { cls: "badge-overpriced", label: "Overpriced" },
    };
    const b = map[status] || { cls: "badge-worth-it", label: status || "—" };
    return `<span class="badge ${b.cls}">${b.label}</span>`;
}

/* sorting */
function sortItems(items, sort) {
    switch (sort) {
        case "rating-desc": return [...items].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        case "rating-asc": return [...items].sort((a, b) => (a.avgRating || 0) - (b.avgRating || 0));
        case "price-asc": return [...items].sort((a, b) => a.price - b.price);
        case "price-desc": return [...items].sort((a, b) => b.price - a.price);
        case "reviews-desc": return [...items].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        default: return items;
    }
}
