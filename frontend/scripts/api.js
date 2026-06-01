const BASE_URL = "http://localhost:3000";

async function get(path) {
    const res = await fetch(BASE_URL + path, {
        headers: authHeader()
    });
    return res.json();
}

async function post(path, body) {
    try {
        const res = await fetch(BASE_URL + path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) {
        return { error: "Network error. Please try again." };
    }
}

async function del(path) {
    const res = await fetch(BASE_URL + path, {
        method: "DELETE",
        headers: authHeader()
    });
    return res.json();
}

function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}