const { db } = require("../config/firebase");
const bcrypt = require("bcrypt");

async function registerUser({ username, email, password }) {
    const existing = await db.collection("users").where("email", "==", email).get();
    if (!existing.empty) {
        throw new Error("Email is already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRef = await db.collection("users").add({
        username,
        email,
        password: hashedPassword,
        createdAt: new Date()
    });

    return {
        userId: userRef.id,
        username,
        email
    };
}

async function loginUser({ email, password }) {
    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
        throw new Error("Invalid login credentials");
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const isValid = await bcrypt.compare(password, userData.password);
    if (!isValid) {
        throw new Error("Invalid login credentials.");
    }

    return {
        userId: userDoc.id,
        username: userData.username,
        email: userData.email
    };
}

module.exports = {
    registerUser,
    loginUser
};
