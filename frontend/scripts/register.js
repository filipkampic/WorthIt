if (localStorage.getItem("userId")) {
    window.location.href = "index.html";
}

function getPasswordStrength(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (password.length >= 10 && hasUpper && hasLower && hasNumber && hasSymbol) {
        return "very strong";
    }
    if (password.length >= 8 && hasUpper &&  hasLower && hasNumber) {
        return "strong";
    }
    if (password.length >= 6 && hasLower && hasNumber) {
        return "moderate";
    }
    return "weak";
}

function showRegisterError(msg) {
    const box = document.getElementById("registerError");
    box.textContent = msg;
    box.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("regPassword").addEventListener("input", () => {
        const password = document.getElementById("regPassword").value;
        const strengthDiv = document.getElementById("passwordStrength");

        if (!password) {
            strengthDiv.innerHTML = "";
            strengthDiv.className = "";
            return;
        }


        const strength = getPasswordStrength(password);
        const cssClass = strength.replace(" ", "-");
        const labels = {
            "weak": "Weak",
            "moderate": "Moderate",
            "strong": "Strong",
            "very-strong": "Very Strong"
        };

        strengthDiv.className = cssClass;
        strengthDiv.innerHTML = `
            <div class="strength-bar"></div>
            <span class="strength-label">${labels[cssClass]}</span>
        `;
    });

    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value.trim();
        const confirmPassword = document.getElementById("regConfirmPassword").value.trim();

        if (!username) return showRegisterError("Username is required.");
        if (!email) return showRegisterError("Email is required.");
        if (!password) return showRegisterError("Password is required.");
        if (!confirmPassword) return showRegisterError("Confirm password is required.");

        if (username.length > 30) return showRegisterError("Username must be 30 characters or less.");
        if (email.length > 50) return showRegisterError("Email must be 50 characters or less.");
        if (password.length < 6) return showRegisterError("Password must be at least 6 characters long.");
        if (password.length > 50) return showRegisterError("Password must be 50 characters or less.");

        if (!email.includes("@") || !email.includes(".")) {
            return showRegisterError("Invalid email format.");
        }

        if (password !== confirmPassword) {
            return showRegisterError("Passwords do not match.");
        }
        
        const strength = getPasswordStrength(password);
        if (strength === "weak") {
            return showRegisterError("Password is too weak.");
        }

        const res = await post("/auth/register", {
            username,
            email,
            password,
            confirmPassword
        });

        if (res.error) {
            showRegisterError(res.error);
            return;
        }

        window.location.href = "login.html";
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
