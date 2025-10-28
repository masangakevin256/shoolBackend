
const jwt = require("jsonwebtoken");
const {getDb} = require("../model/schoolDb");

const handleTeachersRefreshToken = async (req,res) => {
    const db = getDb();
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: "No refresh token" });
    const refreshToken = cookies.jwt;

    const teacher = await db.collection("teachers").findOne({ refreshToken });
    if (!teacher) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        // decoded should contain teacherInfo object matching how we sign it in login
        if (err || teacher.username !== decoded?.teacherInfo?.username)
            return res.status(403).json({ message: "Token verification failed" });

        const accessToken = jwt.sign(
            { teacherInfo: { username: teacher.username, roles: teacher.roles } },
            process.env.ACCESS_SECRET_TOKEN,
            { expiresIn: "10m" }
        );

        res.json({ accessToken });
    });
}
module.exports = handleTeachersRefreshToken