const { db } = require("../config/firebase");

function calcDerivedFields(reviews) {
    const count = reviews.length;
    if (count === 0) return { avgRating: 0, worthScore: 0, status: "Unrated", reviewCount: 0 };

    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / count;
    const worthScore = Math.round(avgRating * 2 * 10) / 10;

    let status;
    if (avgRating >= 4) status = "Bargain";
    else if (avgRating >= 2.5) status = "Worth It";
    else status = "Overpriced";

    return { 
        avgRating: Math.round(avgRating * 10) / 10, 
        worthScore, 
        status, 
        reviewCount: count 
    };
}

async function getAllItems() {
    const [itemsSnap, reviewsSnap] = await Promise.all([
        db.collection("items").get(),
        db.collection("reviews").get()
    ]);

    const allReviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    return itemsSnap.docs.map(doc => {
        const reviews = allReviews.filter(r => r.itemId === doc.id);
        return { id: doc.id, ...doc.data(), ...calcDerivedFields(reviews) };
    });
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

async function addItem(data) {
    const { name, category, price, image, description } = data;

    if (!name || !category || !price || !description) {
        throw new Error("Missing required fields.");
    }

    const validCategories = ["food", "tech", "gaming", "fashion", "home", "wellness", "sports", "other"];
    if (!validCategories.includes(category)) {
        throw new Error("Invalid category.");
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new Error("Invalid price.");
    }

    const docRef = await db.collection("items").add({
        name: name.trim(),
        category,
        price: parsedPrice,
        image: image || "",
        description: description.trim(),
        createdAt: new Date().toISOString(),
        createdBy: data.userId || null,
        createdByUsername: data.username || null
    });

    return {
        id: docRef.id,
        name: name.trim(),
        category,
        price: parsedPrice,
        image: image || "",
        description: description.trim(),
        createdAt: new Date().toISOString(),
        createdBy: data.userId || null,
        createdByUsername: data.username || null
    };
}

module.exports = {
    getAllItems,
    getItemById,
    addItem
};
