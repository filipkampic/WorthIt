const savedService = require("../services/savedService");

exports.getSaved = async (req, res) => {
    try {
        const { userId } = req.params;
        const items = await savedService.getSaved(userId);
        return res.status(200).json(items);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.saveItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { userId } = req.body;
        const result = await savedService.saveItem(userId, itemId);
        return res.status(201).json(result);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

exports.unsaveItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { userId } = req.body;
        await savedService.unsaveItem(userId, itemId);
        return res.status(200).json({ message: "Removed from saved." });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}
