const reviewsService = require("../services/reviewsService");

exports.getReviewsForItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const reviews = await reviewsService.getReviewsForItem(itemId);
        return res.status(200).json(reviews);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { userId, rating, comment } = req.body;

        const review = await reviewsService.addReview(itemId, {
            userId, rating, comment
        });

        return res.status(201).json(review);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { userId } = req.body;
        await reviewsService.deleteReview(reviewId, userId);
        return res.status(200).json({ message: "Review deleted."});
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
