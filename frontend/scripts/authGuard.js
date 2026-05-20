function requireLogin() {
    if (!localStorage.getItem("userId")) {
        window.location.href = "login.html";
    }
}
