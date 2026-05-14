const router = require("express").Router();
const itemsController = require("../controllers/itemsController");

router.get("/", itemsController.getAllItems);
router.get("/:id", itemsController.getItemById);

module.exports = router;