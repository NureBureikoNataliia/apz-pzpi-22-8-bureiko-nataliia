const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config.env" });

function verifyToken(request, response, next) {
    const authHeaders = request.headers["authorization"];
    const token = authHeaders && authHeaders.split(' ')[1];

    if (!token) {
        return response.status(401).json({ message: "Authentication token is missing" });
    }

    jwt.verify(token, process.env.SECRETKEY, (error, user) => {
        if (error) {
            return response.status(403).json({ message: "Invalid token" });
        }

        request.body.user = user;
        next();
    });
}

module.exports = verifyToken;
