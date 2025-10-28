const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const addNewParent = async (req,res) => {
    const roles = "parent"
    const db = getDb();
    const {email, username, password, phoneNumber, studentAdmissionNumber, studentUsername} = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!email || !username || !password || !phoneNumber || !studentAdmissionNumber || !studentUsername){
        return res.status(400).json({"message": "Email, username, password, phone number student admission number and student username required"})
    }
    
    try {

        //check if this parent has a student in the school
      const student = await db.collection("students").findOne({username: studentUsername }, {admissionNumber: studentAdmissionNumber});
        if(!student){
            return res.status(400).json({"message": `Your student ${studentUsername} with admission number ${studentAdmissionNumber} is not registered in the school`})
        }
       if(student.parentPhoneNumber || student.parentName){
            return res.status(409).json({"message": `Student with username ${student.username} has a parent already`});
       }
        //check for duplicates
        const duplicate = await db.collection("parents").findOne({username: username}, {phoneNumber: phoneNumber});
        
        if(duplicate) return res.status(409).json({"message": `Parent with username ${username} and phoneNumber ${phoneNumber} already exists`})
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create a parent format object
        
        
        const parentFormat ={
            "email": email,
            "username": username,
            "password": hashedPassword,
            "roles": roles,
            "phoneNumber": phoneNumber,
            "studentName": studentUsername,
            "studentAdmissionNumber": studentAdmissionNumber,
            "totalFee": student.totalFees,
            "amountPaid": student.totalAmountPaid,
            "feesBalance": student.feesBalance,
            "createdAt": `${format(new Date() ,"yyyy/MM/dd  HH:mm:ss")}`,
        }
        const updateStudent = await db.collection("students").updateOne(
            { username: studentUsername },
            {
                $set: {
                parentName: username,
                parentPhoneNumber: phoneNumber
                }
            }
            
        );   
        if(updateStudent.modifiedCount === 0) {
                return res.status(404).json({ message: "Student not found or no changes made" });
        }
        const results = await db.collection("parents").insertOne(parentFormat);
            
         res.status(201).json(
            {"message":`Parent ${parentFormat.username} added successfully` }
        )

    } catch (error) {
         res.status(500).json({"message": `${error.message}`});
    }
}

module.exports = addNewParent