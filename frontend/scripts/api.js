const BASE_URL = "https://worthit-backend-2us2.onrender.com";

async function get(path) {
    try {
        const res = await fetch(BASE_URL + path);
        return res.json();
    } catch (err) {
        return { error: "Network error. Please try again." };
    }
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

async function del(path, body) {
    try {
        const res = await fetch(BASE_URL + path, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined
        });
        return res.json();
    } catch (err) {
        return { error: "Network error. Please try again." };
    }
}
