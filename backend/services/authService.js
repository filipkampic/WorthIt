const { db } = require("../config/firebase");
const bcrypt = require("bcrypt");

async function registerUser({ username, email, password, confirmPassword }) {
    if (!username || username.trim() === "") {
        throw new Error("Username is required.");
    }
    if (!email || email.trim() === "") {
        throw new Error("Email is required.");
    }
    if (!password || password.trim() === "") {
        throw new Error("Password is required.");
    }
    if (!confirmPassword || confirmPassword.trim() === "") {
        throw new Error("Confirm password is required.");
    }

    if (password != confirmPassword) {
        throw new Error("Passwords do not match.");
    }

    if (username.length > 30) {
        throw new Error("Username must be 30 characters or less.");
    }
    if (email.length > 50) {
        throw new Error("Email must be 50 characters or less.");
    }
    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
    }
    if (password.length > 50) {
        throw new Error("Password must be 50 characters or less.");
    }

    if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Invalid email format.");
    }

    const existingByEmail = await db
        .collection("users")
        .where("email", "==", email)
        .get();
    if (!existingByEmail.empty) {
        throw new Error("Email already in use.");
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    let strength = "weak";

    if (password.length >= 10 && hasUpper && hasLower && hasNumber && hasSymbol) {
        strength = "very strong";
    } else if (password.length >= 8 && hasLower && hasNumber && hasSymbol) {
        strength = "strong";
    } else if (password.length >= 6 && hasLower && hasNumber) {
        strength = "moderate";
    }

    if (strength == "weak") {
        throw new Error("Password is too weak.");
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
