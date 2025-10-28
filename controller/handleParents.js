const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const getAllParents =  async (req,res) => {
    const db = getDb();
    if(!db) return res.status(404).json({"message": "Database not initialized"});

    try {
        const parents = await db.collection("parents").find().toArray();
        res.status(200).json(parents);
    } catch (error) {
        res.status(500).json({"message": "Failed to fetch parents"});
        
    }
}
const updateParent = async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const updates = req.body;

  if (!db) return res.status(404).json({ message: "Database not initialized" });
  if (!id) return res.status(400).json({ message: "Parent ID required" });
  if (!updates || Object.keys(updates).length === 0)
    return res.status(400).json({ message: "No updates provided" });

  try {
    const parent = await db.collection("parents").findOne({ _id: new ObjectId(id) });
    if (!parent) return res.status(404).json({ message: "Parent not found" });

    if (updates.roles) {
      return res.status(400).json({ message: "Cannot update roles" });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update parent document
    const results = await db.collection("parents").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (results.modifiedCount === 0) {
      return res.status(404).json({ message: "Parent wasn't updated" });
    }

    // Reflect parent changes on student documents
    const studentFilter = {
      parentPhoneNumber: parent.phoneNumber,
      parentName: parent.username,
    };

    const studentUpdates = {};
    if (updates.phoneNumber) studentUpdates.parentPhoneNumber = updates.phoneNumber;
    if (updates.username) studentUpdates.parentName = updates.username;

    if (Object.keys(studentUpdates).length > 0) {
      await db.collection("students").updateMany(studentFilter, { $set: studentUpdates });
    }

    res.status(200).json({ message: `Parent updated successfully` });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteParent = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the parent required to continue"});

    try {
        const parent = await db.collection("parents").findOne({_id: new ObjectId(id)});
        if(!parent) return res.status(404).json({"message": `cannot find parent with that ${id}`});

        const results = await db.collection("parents").deleteOne({_id: new ObjectId(id)});
        const studentFilter = {
            parentPhoneNumber: parent.phoneNumber,
            parentName: parent.username,
         };
        const student = await db.collection("students").findOne(studentFilter);
        await db.collection("students").updateMany(studentFilter, { $unset: { parentName: "", parentPhoneNumber: "" } });


        if(results.deletedCount === 0) return res.status(400).json({"message": `parent with id ${id} wasn't deleted`});

        res.status(200).json({"message": `Deleted parent with this id ${id}`});
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
const getParent = async (req,res) => {
    const db = getDb();
    const {id} = req.params;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!id) return res.status(404).json({"message": "Id of the parent required to continue"});

    try {
        const parent = await db.collection("parents").findOne({_id: new ObjectId(id)});
        if(!parent) return res.status(404).json({"message": `cannot find parent with that ${id}`});

        const results = await db.collection("parents").findOne({_id: new ObjectId(id)});

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({"message": `${error.message}`});
    }
}
module.exports = {
    getAllParents,
    updateParent,
    deleteParent,
    getParent
}