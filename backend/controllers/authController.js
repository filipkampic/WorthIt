const authService = require("../services/authService");

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const result = await authService.registerUser({ username, email, password });

        res.status(201).json(result);
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser({ email, password });

        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
