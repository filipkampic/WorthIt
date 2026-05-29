const router = require("express").Router();
const reviewsController = require("../controllers/reviewsController");

router.get("/", reviewsController.getReviewsByUser);
router.get("/:itemId", reviewsController.getReviewsForItem);
router.post("/:itemId", reviewsController.addReview);
router.delete("/:reviewId", reviewsController.deleteReview);

module.exports = router;