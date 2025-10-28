const {getDb} = require("../model/schoolDb")
const handleParentsLogout =async (req, res)=> {
    const db = getDb();
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    const parent = await db.collection("parents").findOne({ refreshToken });
    if (parent) {
        await db.collection("parents").updateOne(
        { _id: user._id },
        { $unset: { refreshToken: "" } }
        );
    }

    res.clearCookie("jwt", { httpOnly: true, sameSite: "Strict" });
    res.json({ message: "Logged out successfully" });
   
}
module.exports = handleParentsLogout