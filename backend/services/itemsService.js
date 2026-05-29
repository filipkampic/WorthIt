const { db } = require("../config/firebase");

function calcDerivedFields(reviews) {
    const count = reviews.length;
    if (count === 0) return { avgRating: 0, avgValue: 0, worthScore: 0, status: "Unrated", reviewCount: 0 };

    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / count;
    const avgValue = reviews.reduce((s, r) => s + (r.value || r.rating), 0) / count;
    const worthScore = Math.round(((avgRating + avgValue) / 2) * 2 * 10) / 10;

    let status;
    if (avgValue >= 4) status = "Bargain";
    else if (avgValue >= 2.5) status = "Worth It";
    else status = "Overpriced";

    return { avgRating: Math.round(avgRating * 10) / 10, avgValue: Math.round(avgValue * 10) / 10, worthScore, status, reviewCount: count };
}

async function getAllItems() {
    const snapshot = await db.collection("items").get();

    const items = [];

    for (const doc of snapshot.docs) {
        const reviewsSnap = await db.collection("reviews").where("itemId", "==", doc.id).get();
        const reviews = reviewsSnap.docs.map(r => r.data());
        items.push({ id: doc.id, ...doc.data(), ...calcDerivedFields(reviews) });
    }

    return items;
}

async function getItemById(id) {
    if (!id || typeof id !== "string" || id.trim() === "") {
        throw new Error("Invalid item ID.");
    }

    const doc = await db.collection("items").doc(id).get();
    if (!doc.exists) {
        throw new Error("Item not found");
    }

    const reviewsSnap = await db.collection("reviews").where("itemId", "==", id).get();
    const reviews = reviewsSnap.docs.map(r => r.data());

    return { id: doc.id, ...doc.data(), ...calcDerivedFields(reviews) };
}

module.exports = {
    getAllItems,
    getItemById
};