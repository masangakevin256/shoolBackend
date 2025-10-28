
const jwt = require("jsonwebtoken");
const {getDb} = require("../model/schoolDb");

const handleParentRefreshToken = async (req,res) => {
    const db = getDb();
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: "No refresh token" });
    const refreshToken = cookies.jwt;

    const parent = await db.collection("parents").findOne({ refreshToken });
    if (!parent) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        // decoded should contain parentInfo object matching how we sign it in login
        if (err || parent.username !== decoded?.parentInfo?.username)
            return res.status(403).json({ message: "Token verification failed" });

        const accessToken = jwt.sign(
            { parentInfo: { username: parent.username, roles: parent.roles } },
            process.env.ACCESS_SECRET_TOKEN,
            { expiresIn: "10m" }
        );

        res.json({ accessToken });
    });
}
module.exports = handleParentRefreshToken