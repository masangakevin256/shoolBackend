const {getDb} = require("../model/schoolDb")
const handleTeachersLogout =async (req, res)=> {
    const db = getDb();
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    const teacher = await db.collection("teachers").findOne({ refreshToken });
    if (teacher) {
        await db.collection("teachers").updateOne(
        { _id: user._id },
        { $unset: { refreshToken: "" } }
        );
    }

    res.clearCookie("jwt", { httpOnly: true, sameSite: "Strict" });
    res.json({ message: "Logged out successfully" });
   
}
module.exports = handleTeachersLogout