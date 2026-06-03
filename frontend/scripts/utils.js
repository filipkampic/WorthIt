function logout() {
    localStorage.clear();
    window.location.href = "login.html";
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

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) =>
        `<span class="star ${i < rating ? "filled" : ""}">★</span>`
    ).join("");
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

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusClass(status) {
    if (status === "Bargain") return "bargain";
    if (status === "Overpriced") return "overpriced";
    return "worth-it";
}
