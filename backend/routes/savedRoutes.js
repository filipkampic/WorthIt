const router = require("express").Router();
const savedController = require("../controllers/savedController");

router.get("/:userId", savedController.getSaved);
router.post("/:itemId", savedController.saveItem);
router.delete("/:itemId", savedController.unsaveItem);

module.exports = router;
