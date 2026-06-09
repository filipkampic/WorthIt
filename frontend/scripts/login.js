if (localStorage.getItem("userId")) {
    window.location.href = "index.html";
}

function showLoginError(msg) {
    const box = document.getElementById("loginError");
    box.textContent = msg;
    box.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!email) return showLoginError("Email is required.");
        if (!password) return showLoginError("Password is required.");

        if (!email.includes("@") || !email.includes(".")) {
            return showLoginError("Invalid email format.");
        }

        const res = await post("/auth/login", { email, password });

        if (res.error) {
            showLoginError(res.error);
            return;
        }

        localStorage.setItem("userId", res.userId);
        localStorage.setItem("username", res.username);
        localStorage.setItem("email", res.email);

        window.location.href = "index.html";
    });

    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            const isHidden = input.type === "password";
            input.type = isHidden ? "text" : "password";
            btn.innerHTML = isHidden ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        });
    });
});