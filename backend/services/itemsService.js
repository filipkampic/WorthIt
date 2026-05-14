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
    const doc = await db.collection("items").doc(id).get();

    if (!doc.exists) {
        throw new Error("Item doesn't exist.");
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