const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const getAllTeachers =  async (req,res) => {
    const db = getDb();
    if(!db) return res.status(404).json({"message": "Database not initialized"});

    try {
        const teachers = await db.collection("teachers").find().toArray();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({"message": "Failed to fetch teachers"});
        
    }
}
const updateTeacher = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    const updates = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the teacher required to continue"});
    if(!updates){
        return res.status(400).json({"message": "Updates required to continue!!!"});
    }

    try {
        //get teacher with the id
        const teacher = await db.collection("teachers").findOne({_id: new ObjectId(id)});
        if(!teacher) return res.status(404).json({"message": `cannot find teacher with that ${id}`})

        if(updates.password){
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        if(updates.teacherId){
            return res.status(400).json({"message": "Cannot update teacherId"});
        }
         if(updates.roles){
            return res.status(400).json({"message": "Cannot update roles"});
        }
        //update the teacher
        const results = await db.collection("teachers").updateOne({_id: new ObjectId(id)}, {$set: updates});

       if (results.modifiedCount === 0) {
            return res.status(404).json({ "message": "Teacher wasn't updated" });
        }
         //send success message
        res.status(200).json({"message": `Updated teacher with this id ${id}`});
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
const deleteTeacher = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the teacher required to continue"});

    try {
        const teacher = await db.collection("teachers").findOne({_id: new ObjectId(id)});
        if(!teacher) return res.status(404).json({"message": `cannot find teacher with that ${id}`});

        const results = await db.collection("teachers").deleteOne({_id: new ObjectId(id)});

        if(results.deletedCount === 0) return res.status(400).json({"message": `Teacher with id ${id} wasn't deleted`});

        res.status(200).json({"message": `Deleted teacher with this id ${id}`});
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
const getTeacher = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the teacher required to continue"});

    try {
        const teacher = await db.collection("teachers").findOne({_id: new ObjectId(id)});
        if(!teacher) return res.status(404).json({"message": `cannot find teacher with that ${id}`});

        const results = await db.collection("teachers").findOne({_id: new ObjectId(id)});

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
module.exports = {
    getAllTeachers,
    updateTeacher,
    deleteTeacher,
    getTeacher
}