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

    if (!rating || rating < 1 || rating > 5) {
        throw new Error("The rating must be between 1 and 5.");
    }

    const reviewData = {
        itemId,
        userId,
        rating,
        comment: comment || "",
        createdAt: new Date()
    };

    const docRef = await db.collection("reviews").add(reviewData);

    return {
        id: docRef.id,
        ...reviewData
    };
}

async function deleteReview(reviewId) {
    const doc = await db.collection("reviews").doc(reviewId).get();

    if (!doc.exists) {
        throw new Error("Review doesn't exist");
    }

    await db.collection("reviews").doc(reviewId).delete();
}

module.exports = {
    getReviewsForItem,
    addReview,
    deleteReview
};
