const router = require("express").Router();
const profileController = require("../controllers/profileController");

router.get("/:userId", profileController.getProfile);
router.get("/:userId/stats", profileController.getProfileStats);

module.exports = router;