const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const addNewTeacher = async (req,res) => {
    const db = getDb();
    const {email, username, password, phoneNumber, teacherId, secretReg} = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!email || !username || !password || !phoneNumber || !teacherId || !secretReg){
        return res.status(400).json({"message": "Email, username, password, secret registration teachersId required phone number required"})
    }
    
    try {
        //check if secret reg number is correct
         const usedAdminCode = await db.collection("admins").findOne({adminId: secretReg });

         if(!usedAdminCode) return res.status(400).json({"message": "Invalid secret registration number"})
        //check for duplicates
        const duplicate = await db.collection("teachers").findOne({teacherId: teacherId});
        
        if(duplicate) return res.status(409).json({"message": `Teacher with this ${teacherId} already exists`});
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create a teacher format object
        const teacherFormat ={
            "email": email,
            "username": username,
            "password": hashedPassword,
            "teacherId": teacherId,
            "roles": "teacher",
            "phoneNumber": phoneNumber,
            "registeredBy": usedAdminCode.username,
            "paidAmount": 50000,
            "createdAt": `${format(new Date() ,"yyyy/MM/dd  HH:mm:ss")}`,
        }
        const results = await db.collection("teachers").insertOne(teacherFormat);
        res.status(201).json(
            {"message":`Teacher ${teacherFormat.username} added successfully` }
        )

    } catch (error) {
         res.status(500).json({"message": `${error.message}`});
    }
}
module.exports = addNewTeacher