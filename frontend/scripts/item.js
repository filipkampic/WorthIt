const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get("id");

const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");

const loadingEl = document.getElementById("item-loading");
const errorEl = document.getElementById("item-error");
const mainEl = document.getElementById("item-main");

document.addEventListener("DOMContentLoaded", async () => {
    updateNavAuth();

    if (!itemId) {
        showError();
        return;
    }

    try {
        const [item, reviews] = await Promise.all([
            get(`/items/${itemId}`),
            get(`/reviews/${itemId}`)
        ]);

        if (item.error) { 
            showError();
            return; 
        }

        renderItem(item);
        renderReviews(reviews, item);
        renderSimilar(item.category, item.id);

        showMain();
    } catch (e) {
        showError();
    }

    setupReviewForm();
    setupCTA();
    setupNavSearch();
});

function showMain() {
    loadingEl.style.display = "none";
    mainEl.style.display = "block";
}

function showError() {
    loadingEl.style.display = "none";
    errorEl.style.display = "flex";
}

function renderItem(item) {
    document.getElementById("breadcrumb-name").textContent = item.name;
    document.title = `WorthIt – ${item.name}`;

    const mainImg = document.getElementById("gallery-main-img");
    mainImg.src = item.image || "img/placeholder.png";
    mainImg.alt = item.name;

    const thumbsEl = document.getElementById("gallery-thumbs");
    thumbsEl.innerHTML = `
        <div class="thumb active">
            <img src="${item.image || 'img/placeholder.png'}" alt="${item.name}">
        </div>
    `;

    document.getElementById("product-category").textContent = capitalize(item.category);
    document.getElementById("product-title").textContent = item.name;
    document.getElementById("product-price").textContent = `€${Number(item.price).toFixed(2)}`;
    document.getElementById("product-description").textContent = item.description || "";

    const badge = document.getElementById("product-status-badge");
    badge.textContent = item.status || "Unrated";
    badge.className = `status-badge ${getStatusClass(item.status)}`;

    const score = item.worthScore ?? 0;
    document.getElementById("worth-score").textContent = score > 0 ? score.toFixed(1) : "—";
    document.getElementById("worth-score-desc").textContent = getScoreDesc(item.status);
    const bar = document.getElementById("worth-score-bar");
    bar.style.width = score > 0 ? `${score * 10}%` : "0%";
    bar.className = `worth-score-bar ${getStatusClass(item.status)}`;

    document.getElementById("metric-rating").textContent = item.avgRating > 0 ? item.avgRating.toFixed(1) :  "—";
    document.getElementById("metric-worth-score").textContent = score > 0 ? score.toFixed(1) :  "—";
    document.getElementById("metric-review-count").textContent = item.reviewCount ?? 0;
}

function renderReviews(reviews, item) {
    const list = document.getElementById("reviews-list");
    const empty = document.getElementById("reviews-empty");

    if (!reviews.length) {
        empty.style.display = "block";
        return;
    }

    list.innerHTML = reviews.map(r => reviewCard(r)).join("");
}

function reviewCard(r) {
    const stars = renderStars(r.rating);
    const date = r.createdAt
        ? new Date(r.createdAt._seconds ? r.createdAt._seconds * 1000 : r.createdAt).toLocaleDateString("en-US")
        : "";
    const initials = (r.username || "U").charAt(0).toUpperCase();
    const deleteBtn = (userId && r.userId === userId)
        ? `<button class="btn-delete-review" data-review-id="${r.id}" title="Delete review">🗑</button>`
        : "";

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">${initials}</div>
                <div class="review-meta">
                    <span class="review-username">${r.username || "Anonymous"}</span>
                    <span class="review-date">${date}</span>
                </div>
                <div class="review-stars">${stars}</div>
                ${deleteBtn}
            </div>
            <p class="review-comment">${r.comment || ""}</p>
        </div>
    `;
}

async function renderSimilar(category, currentId) {
    const carousel = document.getElementById("similar-carousel");
    try {
        const items = await get(`/items`);
        const similar = items
            .filter(i => i.category === category && i.id !== currentId)
            .slice(0, 8);

        if (!similar.length) {
            carousel.closest(".similar-section").style.display = "none";
            return;
        }

        carousel.innerHTML = similar.map(i => similarCard(i)).join("");
    } catch (e) {
        carousel.closest(".similar-section").style.display = "none";
    }
}

function similarCard(item) {
    const score = item.worthScore ?? 0;
    return `
        <a href="item.html?id=${item.id}" class="similar-card">
            <img src="${item.image || 'img/placeholder.png'}" alt="${item.name}" class="similar-card-img">
            <div class="similar-card-body">
                <span class="similar-card-category">${capitalize(item.category)}</span>
                <p class="similar-card-name">${item.name}</p>
                <div class="similar-card-bottom">
                    <span class="similar-card-price">€${Number(item.price).toFixed(2)}</span>
                    <span class="status-badge ${getStatusClass(item.status)}">${item.status || "Unrated"}</span>
                </div>
            </div>
        </a>
    `;
}


function setupReviewForm() {
    const formWrap = document.getElementById("review-form-wrap");
    const form = document.getElementById("review-form");
    const liveEl = document.getElementById("review-form-live");

    ["btn-add-review", "btn-add-review-2"].forEach(id => {
        document.getElementById(id)?.addEventListener("click", () => {
            if (!userId) { window.location.href = "login.html"; return; }
            formWrap.style.display = formWrap.style.display === "none" ? "block" : "none";
            formWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    });

    document.getElementById("btn-cancel-review")?.addEventListener("click", () => {
        formWrap.style.display = "none";
        form.reset();
        document.getElementById("rating-value").value = "0";
        resetStars();
        liveEl.textContent = "";
    });

    const stars = document.querySelectorAll("#stars-rating span");
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const val = parseInt(star.dataset.val);
            document.getElementById("rating-value").value = val;
            highlightStars(val);
            liveEl.textContent = getLiveText(val);
            liveEl.className = `review-form-live ${getStatusClass(calcStatus(val))}`;
        });
        star.addEventListener("mouseenter", () => highlightStars(parseInt(star.dataset.val)));
        star.addEventListener("mouseleave", () => {
            const cur = parseInt(document.getElementById("rating-value").value) || 0;
            highlightStars(cur);
        });
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const rating = parseInt(document.getElementById("rating-value").value);
        const comment = document.getElementById("review-comment").value.trim();

        let valid = true;

        if (!rating || rating < 1 || rating > 5) {
            document.getElementById("rating-error").textContent = "Please select a rating.";
            valid = false;
        } else {
            document.getElementById("rating-error").textContent = "";
        }

        if (!valid) return;

        const submitBtn = form.querySelector("button[type=submit]");
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        const res = await post(`/reviews/${itemId}`, { userId, rating, comment });

        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";

        if (res.error) {
            document.getElementById("rating-error").textContent = res.error;
            return;
        }

        res.username = username || "You";

        const list = document.getElementById("reviews-list");
        document.getElementById("reviews-empty").style.display = "none";
        list.insertAdjacentHTML("afterbegin", reviewCard(res));

        const updated = await get(`/items/${itemId}`);
        if (!updated.error) renderItem(updated);

        formWrap.style.display = "none";
        form.reset();
        document.getElementById("rating-value").value = "0";
        resetStars();
        liveEl.textContent = "";
    });

    document.getElementById("reviews-list").addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-delete-review");
        if (!btn || !userId) return;
        const rid = btn.dataset.reviewId;
        const res = await del(`/reviews/${rid}`, { userId });
        if (!res.error) {
            btn.closest(".review-card").remove();
            const updated = await get(`/items/${itemId}`);
            if (!updated.error) renderItem(updated);
        }
    });
}


function setupCTA() {
    document.getElementById("btn-save")?.addEventListener("click", () => {
        if (!userId) { window.location.href = "login.html"; return; }
        alert("Save feature coming soon!");
    });

    document.getElementById("btn-share")?.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert("Link copied to clipboard!"))
            .catch(() => alert("Copy failed."));
    });
}


function updateNavAuth() {
    const navAuth = document.getElementById("nav-auth");
    if (!navAuth) return;
    if (userId) {
        navAuth.innerHTML = `
            <a href="profile.html" class="btn btn-ghost">${username || "Profile"}</a>
            <button class="btn btn-primary" onclick="logout()">Logout</button>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="login.html" class="btn btn-ghost">Login</a>
            <a href="register.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}


function setupNavSearch() {
    window.handleNavSearch = function () {
        const q = document.getElementById("navbar-search")?.value.trim();
        if (q) window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
    };
    document.getElementById("navbar-search")?.addEventListener("keydown", e => {
        if (e.key === "Enter") window.handleNavSearch();
    });
}


// Helpers

function getStatusClass(status) {
    if (status === "Bargain") return "bargain";
    if (status === "Overpriced") return "overpriced";
    return "worth-it";
}

function getScoreDesc(status) {
    if (status === "Bargain") return "Most users believe this product offers excellent value for money.";
    if (status === "Overpriced") return "Most users feel this product doesn't justify its price.";
    if (status === "Worth It") return "Most users believe this product offers fair value for its price.";
    return "Not enough reviews yet.";
}

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderStars(rating) {
    return [1, 2, 3, 4, 5].map(i =>
        `<span class="${i <= rating ? 'star filled' : 'star'}">${i <= rating ? '★' : '☆'}</span>`
    ).join("");
}

function highlightStars(val) {
    document.querySelectorAll("#stars-rating span").forEach(s => {
        s.classList.toggle("active", parseInt(s.dataset.val) <= val);
    });
}

function resetStars() {
    document.querySelectorAll("#stars-rating span").forEach(s => s.classList.remove("active"));
}

function getLiveText(rating) {
    const status = calcStatus(rating);
    return `Your review suggests this product is ${status}`;
}

function calcStatus(rating) {
    if (rating >= 4) return "Bargain";
    if (rating >= 3) return "Worth It";
    return "Overpriced";
}
