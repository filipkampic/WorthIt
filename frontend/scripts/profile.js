requireLogin();

const userId = localStorage.getItem("userId");

async function init() {
    renderNavAuth();
    setupTabs();
    setupLogout();
    setupNavSearch();

    const [profile, stats] = await Promise.all([
        get(`/profile/${userId}`),
        get(`/profile/${userId}/stats`)
    ]);

    if (profile.error || stats.error) return;

    renderSidebar(profile, stats);
    renderSettingsTab(profile);
    await renderReviewsTab(profile.reviews);
    renderAddedTab();
}

function renderSidebar(profile, stats) {
    const initials = profile.username ? profile.username.slice(0, 2).toUpperCase() : "??";

    document.getElementById("profile-avatar").textContent = initials;
    document.getElementById("profile-username").textContent = profile.username || "—";
    document.getElementById("profile-email").textContent = profile.email || "—";
    document.getElementById("profile-total-reviews").textContent = stats.totalReviews ?? 0;
    document.getElementById("profile-join-date").textContent = "2026";

    const rep = calcReputation(stats.totalReviews);
    document.getElementById("profile-reputation").textContent = rep;
}

function calcReputation(totalReviews) {
    if (totalReviews >= 50) return "Expert";
    if (totalReviews >= 20) return "Trusted";
    if (totalReviews >= 5) return "Active";
    return "Newcomer";
}

async function renderReviewsTab(reviews) {
    const list = document.getElementById("reviews-list");
    const empty = document.getElementById("reviews-empty");
    const count = document.getElementById("reviews-count");

    if (!reviews || reviews.length === 0) {
        list.innerHTML = "";
        empty.classList.remove("hidden");
        count.textContent = "0 reviews";
        return;
    }

    count.textContent = `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`;
    empty.classList.add("hidden");

    const itemIds = [...new Set(reviews.map(r => r.itemId))];
    const itemMap = {};
    await Promise.all(
        itemIds.map(async (id) => {
            const item = await get(`/items/${id}`);
            if (!item.error) itemMap[id] = item;
        })
    );

    list.innerHTML = reviews
        .sort((a, b) => {
            const aTime = a.createdAt?._seconds ?? 0;
            const bTime = b.createdAt?._seconds ?? 0;
            return bTime - aTime;
        })
        .map(review => {
            const item = itemMap[review.itemId] || {};
            return renderReviewCard(review, item);
        })
        .join("");

    list.addEventListener("click", handleDeleteReview);
}

function renderReviewCard(review, item) {
    const stars = renderStars(review.rating);
    const date = formatDate(review.createdAt);
    const imgSrc = item.image || "img/placeholder.png";
    const itemName = item.name || "Unknown Product";
    const itemCategory = item.category || "";

    return `
        <div class="profile-review-card" data-review-id="${review.id}">
            <div class="profile-review-top">
                <img
                    src="${imgSrc}"
                    alt="${itemName}"
                    class="profile-review-product-img"
                    onerror="this.src='img/placeholder.png'"
                >
                <div class="profile-review-product-info">
                    <a href="item.html?id=${review.itemId}" class="profile-review-product-name">
                        ${itemName}
                    </a>
                    <span class="profile-review-product-category">${itemCategory}</span>
                </div>
                <div class="profile-review-actions">
                    <button
                        class="btn-delete-review"
                        data-review-id="${review.id}"
                        title="Delete review"
                    >🗑️</button>
                </div>
            </div>
            <div class="profile-review-stars">${stars}</div>
            ${review.comment ? `<p class="profile-review-comment">${review.comment}</p>` : ""}
            <span class="profile-review-date">${date}</span>
        </div>
    `;
}

async function handleDeleteReview(e) {
    const btn = e.target.closest(".btn-delete-review");
    if (!btn) return;

    const reviewId = btn.dataset.reviewId;
    if (!confirm("Delete this review?")) return;

    const res = await del(`/reviews/${reviewId}`, { userId });

    if (res.error) {
        alert("Failed to delete review: " + res.error);
        return;
    }

    const card = document.querySelector(`.profile-review-card[data-review-id="${reviewId}"]`);
    if (card) card.remove();

    const remaining = document.querySelectorAll(".profile-review-card").length;
    document.getElementById("reviews-count").textContent = `${remaining} review${remaining !== 1 ? "s" : ""}`;
    document.getElementById("profile-total-reviews").textContent = remaining;

    if (remaining === 0) {
        document.getElementById("reviews-empty").classList.remove("hidden");
    }
}

function renderAddedTab() {
    // to-do
    document.getElementById("added-empty").classList.remove("hidden");
    document.getElementById("added-count").textContent = "0 products";
}

function renderSettingsTab(profile) {
    document.getElementById("settings-username").textContent = profile.username || "—";
    document.getElementById("settings-email").textContent = profile.email || "—";
}

function setupTabs() {
    document.querySelectorAll(".sidebar-nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.dataset.tab;

            document.querySelectorAll(".sidebar-nav-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
            const panel = document.getElementById(`tab-${tab}`);
            if (panel) {
                panel.classList.remove("hidden");
                panel.classList.add("active");
            }
        });
    });
}

function setupLogout() {
    document.getElementById("btn-logout").addEventListener("click", () => {
        logout();
    });
}

init();
