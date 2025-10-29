const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const getAllStudents = async (req, res) => {
  const user = req.user; // logged-in user
  const db = getDb();
  if (!db) return res.status(404).json({ message: "Database not initialized" });

  try {
    let students;

    // If the logged-in user is a parent, only fetch their own children
    if (user.roles === "parent") {
      students = await db.collection("students")
        .find({ parentName: user.username })
        .toArray();
    } 
    // If it's not a parent (e.g. admin, teacher), fetch all
    else {
      students = await db.collection("students").find().toArray();
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

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
    const {username} = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!username){
        return res.status(400).json({"message": "username and required"})
    }
    
    try {
        //check for duplicates
        const duplicateUsername = await db.collection("students").findOne({username: username});

        
        if(duplicateUsername) return res.status(409).json({"message": `Student with username ${username} already exists`});
        const lastStudent = await db.collection("students")
            .find()
            .sort({ admissionNumber: -1 })
            .limit(1)
            .toArray();

        let admissionNumber;

        if (lastStudent.length === 0) {
        // No students yet → start with 1
        admissionNumber = 1;
        } else {
        // Take the last student's admissionNumber and increment by 1
        // Convert to number before incrementing
             const lastNum = parseInt(lastStudent[0].admissionNumber);
            admissionNumber = String(lastNum + 1);
        }

        
       
        // create a student format object
        const studentFormat ={
            "username": username,
            "admissionNumber": admissionNumber,
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