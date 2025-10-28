const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const addNewAdmin = async (req,res) => {
    // let updateAdminRegistered = [];
    const roles = "admin"
    const db = getDb();
    const {email, username , password, adminId, phoneNumber, secretReg } = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!email || !username || !password || !adminId ||! phoneNumber || !secretReg){
        return res.status(400).json({"message": "email, username, password admin id  secret registration number and phone number required"})
    }
    
    try {
        //check if he has the correct secret code to register
        const usedAdminCode = await db.collection("admins").findOne({adminId: secretReg});
        if(!usedAdminCode){
            return res.status(400).json({"message": "Failed to verify secret registration number"});
        }
        //check for duplicates
        const duplicateUsernameEmail = await db.collection("admins").findOne({email: email}, {username: username});
        const duplicateAdminId = await db.collection("admins").findOne({adminId: adminId});
        
        if(duplicateUsernameEmail) return res.status(409).json({"message": `Admin with email ${email} and username ${username} already exists`});
        if(duplicateAdminId) return res.status(409).json({"message": `Admin with  id ${adminId} already exists`});
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminFormat ={
            "email": email,
            "username": username,
            "adminId": adminId,
            "password":hashedPassword,
            "amountPaid": 100000,
            "phoneNumber": phoneNumber,
            "roles": roles,
            "registeredBy": usedAdminCode.username,
            "createdAt": `${format(new Date() ,"yyyy/MM/dd  HH:mm:ss")}`,
        }
        const results = await db.collection("admins").insertOne(adminFormat);
        res.status(201).json(
            {"message":`Admin ${adminFormat.username} added successfully` }
        )

    } catch (error) {
         res.status(500).json({"message": `${error.message}`});
    }
}

module.exports = addNewAdmin