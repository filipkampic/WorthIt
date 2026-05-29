const { db } = require("../config/firebase");

async function getReviewsForItem(itemId) {
    if (!itemId || typeof itemId !== "string" || itemId.trim() === "") {
        throw new Error("Invalid item ID.");
    }

    const itemDoc = await db.collection("items").doc(itemId).get();
    if (!itemDoc.exists) {
        throw new Error("Item not found.");
    }

    const snapshot = await db
        .collection("reviews")
        .where("itemId", "==", itemId)
        .get();

    const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return reviews;
}

async function addReview(itemId, data) {
    const { userId, rating, comment } = data;

    if (!itemId || typeof itemId !== "string" || itemId.trim() === "") {
        throw new Error("Invalid item ID.");
    }

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("Invalid user ID.");
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    if (comment && typeof comment !== "string") {
        throw new Error("Comment must be a string.");
    }

    const itemDoc = await db.collection("items").doc(itemId).get();
    if (!itemDoc.exists) {
        throw new Error("Item not found.");
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
        throw new Error("User not found.");
    }

    const reviewData = {
        itemId,
        userId,
        rating: numericRating,
        comment: comment || "",
        createdAt: new Date()
    };

    const docRef = await db.collection("reviews").add(reviewData);

    return {
        id: docRef.id,
        ...reviewData
    };
}

async function deleteReview(reviewId, userId) {
    if (!reviewId || typeof reviewId !== "string" || reviewId.trim() === "") {
        throw new Error("Invalid review ID.");
    }

    const doc = await db.collection("reviews").doc(reviewId).get();
    if (!doc.exists) {
        throw new Error("Review not found.");
    }

    if (doc.data().userId !== userId) {
        throw new Error("Unauthorized.");
    }

    await db.collection("reviews").doc(reviewId).delete();
}

module.exports = {
    getReviewsForItem,
    addReview,
    deleteReview
};
