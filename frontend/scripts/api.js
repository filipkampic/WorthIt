const BASE_URL = "http://localhost:3000";

async function get(path) {
    const res = await fetch(BASE_URL + path, {
        headers: authHeader()
    });
    return res.json();
}

async function post(path, data) {
    const res = await fetch(BASE_URL + path, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader()
        },
        body: JSON.stringify(data)
    });
    return res.json();
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
    returntoken ? { Authorization: `Bearer ${token}` } : {};
}