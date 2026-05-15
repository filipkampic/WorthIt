const profileService = require("../services/profileService");

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await profileService.getProfile(userId);
        return res.status(200).json(profile);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.getProfileStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = await profileService.getProfileStats(userId);
        return res.status(200).json(stats);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};