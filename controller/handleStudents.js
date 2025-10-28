const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const getAllStudents =  async (req,res) => {
    const db = getDb();
    if(!db) return res.status(404).json({"message": "Database not initialized"});

    try {
        const students = await db.collection("students").find().toArray();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({"message": "Failed to fetch students"});
        
    }
}
const addNewStudent = async (req,res) => {
    let totalAmountPaid = 0;
    let totalFees = 50000;
    const roles = "student";
    let subjects = [
        {"name": "Mathematics", "Marks": 76},
        {"name": "English", "Marks": 57},
        {"name": "Kiswahili", "Marks": 65},
        {"name": "Science", "Marks": 59},
        {"name": "Social Studies", "Marks": 78},
        {"name": "CRE", "Marks": 96}
    ]
    // we should also calculate grade from marks
    const db = getDb();
    const {username , password, admissionNumber} = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!username || !password || !admissionNumber){
        return res.status(400).json({"message": "username, password and admission number required"})
    }
    
    try {
        //check for duplicates
        const duplicateUsername = await db.collection("students").findOne({username: username});
        const duplicateAdmissionNumber = await db.collection("students").findOne({admissionNumber: admissionNumber});
        
        if(duplicateUsername) return res.status(409).json({"message": `Student with username ${username} already exists`});
        if(duplicateAdmissionNumber) return res.status(409).json({"message": `Student with admission number ${admissionNumber} already exists`});
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create a student format object
        const studentFormat ={
            "username": username,
            "admissionNumber": admissionNumber,
            "password":hashedPassword,
            "totalFees": totalFees,
            "roles": roles,
            "totalAmountPaid": totalAmountPaid,
            "feesBalance": totalFees - totalAmountPaid,
            "subjects": subjects,
            "createdAt": `${format(new Date() ,"yyyy/MM/dd  HH:mm:ss")}`,
            
        }
        const results = await db.collection("students").insertOne(studentFormat);
        res.status(201).json(
            {"message":`Student ${studentFormat.username} added successfully` }
        )

    } catch (error) {
         res.status(500).json({"message": `${error.message}`});
    }
}
const updateStudent = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    const updates = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the student required to continue"});
    if(!updates){
        return res.status(400).json({"message": "Updates required to continue!!!"});
    }

    try {
        //get student with the id
        const student = await db.collection("students").findOne({_id: new ObjectId(id)});
        if(!student) return res.status(404).json({"message": `cannot find student with that ${id}`})

        if(updates.password){
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        if(updates.admissionNumber){
            return res.status(400).json({"message": "Cannot update admission number"});
        }
        //update the student
        const results = await db.collection("students").updateOne({_id: new ObjectId(id)}, {$set: updates});
        
       if (results.modifiedCount === 0) {
            return res.status(404).json({ "message": "student wasn't updated" });
        }
         //send success message
        res.status(200).json({"message": `Updated student with this id ${id}`});
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
const deleteStudent = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the student required to continue"});

    try {
        const student = await db.collection("students").findOne({_id: new ObjectId(id)});
        if(!student) return res.status(404).json({"message": `cannot find student with that ${id}`});

        const results = await db.collection("students").deleteOne({_id: new ObjectId(id)});

        if(results.deletedCount === 0) return res.status(400).json({"message": `student with id ${id} wasn't deleted`});

        res.status(200).json({"message": `Deleted student with this id ${id}`});
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
const getStudent = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the student required to continue"});

    try {
        const student = await db.collection("students").findOne({_id: new ObjectId(id)});
        if(!student) return res.status(404).json({"message": `cannot find student with that ${id}`});

        const results = await db.collection("students").findOne({_id: new ObjectId(id)});

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
module.exports = {
    getAllStudents,
    addNewStudent,
    updateStudent,
    deleteStudent,
    getStudent
}