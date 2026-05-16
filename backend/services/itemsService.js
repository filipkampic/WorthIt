const { db } = require("../config/firebase");

async function getAllItems() {
    const snapshot = await db.collection("items").get();

    const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

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

    return {
        id: doc.id,
        ...doc.data()
    };
}

module.exports = {
    getAllItems,
    getItemById
};