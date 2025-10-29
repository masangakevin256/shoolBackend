const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const getParent= async (req, res)=> {
 const user = req.user;
    const db = getDb();
    let results
    if(!db) return res.status(404).json({message: "Database not initialized"})
    if(user.roles === "parent") {
        results = await db.collection("parents").findOne({username: user.username});
    }else{
        return res.status(400).json({message: "Not authorized"})
    }

    res.status(200).json({results})
}
const getTeacher= async (req, res)=> {
 const user = req.user;
    const db = getDb();
    let results
    if(!db) return res.status(404).json({message: "Database not initialized"})
    if(user.roles === "teacher") {
        results = await db.collection("teachers").findOne({username: user.username});
    }else{
        return res.status(400).json({message: "Not authorized"})
    }

    res.status(200).json({results})
}
const getAdmin= async (req, res)=> {
 const user = req.user;
    const db = getDb();
    let results
    if(!db) return res.status(404).json({message: "Database not initialized"})
    if(user.roles === "admin") {
        results = await db.collection("admins").findOne({username: user.username});
    }else{
        return res.status(400).json({message: "Not authorized"})
    }

    res.status(200).json({results})
}

module.exports = {
    getParent,
    getTeacher,
    getAdmin
}