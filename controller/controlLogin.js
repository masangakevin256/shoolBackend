
const {getDb} = require("../model/schoolDb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const handleParentsLogin = async (req, res) => {
    const db = getDb()
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({"message": "username and password required"})
    };

    const parent = await db.collection("parents").findOne({username: username});

    if(!parent){
        return res.status(401).json({"message": `Parent  ${username} does't exist!!`});
    }

    const match = await bcrypt.compare(password, parent.password);

    if(!match){
        return res.status(401).json({"message": "Check password and log in again!!!"})
    }
   const accessToken = jwt.sign(
        {
            userInfo: {
                username: parent.username,
                roles: parent.roles   
            }   
        },
        process.env.ACCESS_SECRET_TOKEN,
        {expiresIn: "10m"}
    )
    const refreshToken = jwt.sign(
        {
            userInfo: {
                username: parent.username,
                roles: parent.roles
            }
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    )
    await db.collection("parents").updateOne(
    { _id: parent._id },
    { $set: { refreshToken } }
  );
     res
    .cookie("jwt", refreshToken, {
      httpOnly: true,  // prevents JS access
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    res.status(200).json({
        accessToken: accessToken,
        "message": `Logging in parent ${parent.username}....`,
        "roles": parent.roles
    });

}
const handleAdminLogin = async (req, res) => {
    const db = getDb()
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({"message": "username and password required"})
    };

    const admin = await db.collection("admins").findOne({username: username});

    if(!admin){
        return res.status(401).json({"message": `Admin  ${username} does't exist!!`});
    }

    const match = await bcrypt.compare(password, admin.password);

    if(!match){
        return res.status(401).json({"message": "Check password and log in again!!!"})
    }
   const accessToken = jwt.sign(
        {
            userInfo: {
                username: admin.username,
                roles: admin.roles   
            }   
        },
        process.env.ACCESS_SECRET_TOKEN,
        {expiresIn: "10m"}
    )
    const refreshToken = jwt.sign(
        {
            userInfo: {
                username: admin.username,
                roles: admin.roles
            }
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    )
    await db.collection("admins").updateOne(
    { _id: admin._id },
    { $set: { refreshToken } }
  );
     res
    .cookie("jwt", refreshToken, {
      httpOnly: true,  // prevents JS access
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    res.status(200).json({
        accessToken: accessToken,
        "message": `Logging in Admin ${admin.username}....`,
        "roles": admin.roles
    });

}
const handleTeachersLogin = async (req, res) => {
    const db = getDb()
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).json({"message": "username and password required"})
    };

    const teacher = await db.collection("teachers").findOne({username: username});

    if(!teacher){
        return res.status(401).json({"message": `Teacher  ${username} does't exist!!`});
    }

    const match = await bcrypt.compare(password, teacher.password);

    if(!match){
        return res.status(401).json({"message": "Check password and log in again!!!"})
    }
   const accessToken = jwt.sign(
        {
            userInfo: {
                username: teacher.username,
                roles: teacher.roles   
            }   
        },
        process.env.ACCESS_SECRET_TOKEN,
        {expiresIn: "10m"}
    )
    const refreshToken = jwt.sign(
        {
            userInfo: {
                username: teacher.username,
                roles: teacher.roles
            }
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    )
    await db.collection("teachers").updateOne(
    { _id: teacher._id },
    { $set: { refreshToken } }
  );
     res
    .cookie("jwt", refreshToken, {
      httpOnly: true,  // prevents JS access
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    res.status(200).json({
        accessToken: accessToken,
        "message": `Logging in Teacher ${teacher.username}....`,
        "roles": teacher.roles
    });

}
module.exports = {
    handleParentsLogin,
    handleAdminLogin,
    handleTeachersLogin

}
