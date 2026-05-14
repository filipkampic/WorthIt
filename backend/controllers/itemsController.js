const itemsService = require("../services/itemsService");

exports.getAllItems = async (req, res) => {
    try {
        const items = await itemsService.getAllItems();
        return res.status(200).json(items);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await itemsService.getItemById(id);
        return res.status(200).json(item);
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
};
