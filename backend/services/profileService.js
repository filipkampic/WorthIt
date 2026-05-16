const { db } = require("../config/firebase");

async function getProfile(userId) {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("Invalid user ID.");
    }

    const doc = await db.collection("users").doc(userId).get();
    if (!doc.exists) {
        throw new Error("User not found.");
    }

    const userData = doc.data();

    const reviewsSnapshot = await db
        .collection("reviews")
        .where("userId", "==", userId)
        .get();

    const reviews = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return {
        userId,
        username: userData.username,
        email: userData.email,
        reviews
    };
}

async function getProfileStats(userId) {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("Invalid user ID.");
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
        throw new Error("User not found.");
    }

    const snapshot = await db
        .collection("reviews")
        .where("userId", "==", userId)
        .get();

    const reviews = snapshot.docs.map(doc => doc.data());

    const count = reviews.length;

    const avgRating = 
        count === 0
            ? 0
            : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

    const uniqueItems = new Set(reviews.map(r => r.itemId)).size;

     return {
        userId,
        totalReviews: count,
        averageRating: avgRating,
        itemsReviewed: uniqueItems
    };
}

module.exports = {
    getProfile,
    getProfileStats
};