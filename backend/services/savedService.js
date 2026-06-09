const { db } = require("../config/firebase");

async function getSaved(userId) {
    if (!userId) throw new Error("Invalid user ID.");

    const snap = await db.collection("saved")
        .where("userId", "==", userId)
        .get();

    if (snap.empty) return [];

    const itemIds = snap.docs.map(d => d.data().itemId);

    const items = await Promise.all(
        itemIds.map(async (itemId) => {
            const doc = await db.collection("items").doc(itemId).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        })
    );

    return items.filter(Boolean);
}

async function saveItem(userId, itemId) {
    if (!userId || !itemId) throw new Error("Missing userId or itemId");

    const existing = await db.collection("saved")
        .where("userId", "==", userId)
        .where("itemId", "==", itemId)
        .get();

    if (!existing.empty) throw new Error("Already saved.");

    const docRef = await db.collection("saved").add({
        userId,
        itemId,
        createdAd: new Date().toISOString()
    });

    return { id: docRef.id, userId, itemId };
}

async function unsaveItem(userId, itemId) {
    if (!userId || !itemId) throw new Error("Missing userId or itemId");

    const snap = await db.collection("saved")
        .where("userId", "==", userId)
        .where("itemId", "==", itemId)
        .get();

    if (snap.empty) throw new Error("Not saved.");

    await snap.docs[0].ref.delete();
}

module.exports = {
    getSaved,
    saveItem,
    unsaveItem
};
