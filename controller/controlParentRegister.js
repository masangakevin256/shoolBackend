const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const addNewParent = async (req,res) => {
    const sendEmail = require("../utils/sendEmail")
    const roles = "parent"
    const db = getDb();
    
    const {email, username, password, phoneNumber, studentAdmissionNumber, studentUsername} = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    // if(!email || !username || !password || !phoneNumber || !studentAdmissionNumber || !studentUsername){
    //     return res.status(400).json({"message": "Email, username, password, phone number student admission number and student username required"})
    // }
    
    try {

        //check if this parent has a student in the school
      const student = await db.collection("students").findOne({username: studentUsername }, {admissionNumber: studentAdmissionNumber});
        if(!student){
            return res.status(400).json({"message": `Your student ${studentUsername} with admission number ${studentAdmissionNumber} is not registered in the school`})
        }
       if(student.parentPhoneNumber || student.parentName){
            return res.status(409).json({"message": `Student with username ${student.username} has a parent already`});
       }
       //assign id to parent
            const lastParent = await db.collection("parents")
            .find()
            .sort({ parentId: -1 })
            .limit(1)
            .toArray();

            let parentId;

            if (lastParent.length === 0) {
            // No parent yet → start with TC001
                parentId = "PR001";
            } else {
            // Extract the last parentId
            const lastId = lastParent[0].parentId; 
            
            // Extract numeric part using regex
            const num = parseInt(lastId.match(/\d+/)[0]);
            
            // Increment and pad to 3 digits
            const nextNum = String(num + 1).padStart(3, "0");
            
            // Combine with prefix
                parentId = "PR" + nextNum;
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
            "parentId": parentId,
            "roles": roles,
            "phoneNumber": phoneNumber,
            "studentUsername": studentUsername,
            "studentAdmissionNumber": studentAdmissionNumber,
            "totalFees": student.totalFees,
            "amountPaid": student.totalAmountPaid,
            "feesBalance": student.feesBalance,
            "createdAt": `${format(new Date() ,"yyyy/MM/dd  HH:mm:ss")}`,
        }

        // await sendEmail(
        //     email,
        //     "Welcome to Kisii School Care Center - Parent Account Created",
        //     `Dear ${username}, your parent account for Kisii School Care Center has been created successfully. Parent ID: ${parentId}`,
        //     `
        //     <!DOCTYPE html>
        //     <html>
        //     <head>
        //         <meta charset="utf-8">
        //         <style>
        //             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        //         </style>
        //     </head>
        //     <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f9ff;">
        //         <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        //             <!-- Header -->
        //             <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 30px 20px; text-align: center;">
        //                 <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🏫 Kisii School Care Center</h1>
        //                 <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Quality Education & Child Care</p>
        //             </div>
                    
        //             <!-- Main Content -->
        //             <div style="padding: 40px 30px;">
        //                 <!-- Welcome Section -->
        //                 <div style="text-align: center; margin-bottom: 30px;">
        //                     <div style="background: #dbeafe; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
        //                         <span style="font-size: 36px; color: #2563eb;">👨‍👩‍👧‍👦</span>
        //                     </div>
        //                     <h2 style="color: #1e293b; margin: 20px 0 10px 0; font-weight: 600;">Welcome, ${username}!</h2>
        //                     <p style="color: #64748b; line-height: 1.6; margin: 0;">
        //                         Your parent portal account has been successfully created to help you stay connected with your child's education journey.
        //                     </p>
        //                 </div>

        //                 <!-- Account Details -->
        //                 <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0;">
        //                     <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600; text-align: center;">📋 Account & Student Information</h3>
                            
        //                     <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        //                         <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
        //                             <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">PARENT ID</p>
        //                             <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;">${parentId}</p>
        //                         </div>
        //                         <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
        //                             <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">PHONE NUMBER</p>
        //                             <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;">${phoneNumber}</p>
        //                         </div>
        //                     </div>

        //                     <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 15px;">
        //                         <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">STUDENT NAME</p>
        //                         <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;">${studentUsername}</p>
        //                     </div>
        //                 </div>

        //                 <!-- Fee Information -->
        //                 <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #bae6fd;">
        //                     <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600; text-align: center;">💰 Fee Summary</h3>
                            
        //                     <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
        //                         <div style="display: flex; justify-content: between; align-items: center; padding: 12px 15px; background: white; border-radius: 8px;">
        //                             <span style="color: #475569; font-weight: 500;">Total Fees:</span>
        //                             <span style="color: #1e293b; font-weight: 700; font-size: 16px;">KSh ${student.totalFees}</span>
        //                         </div>
        //                         <div style="display: flex; justify-content: between; align-items: center; padding: 12px 15px; background: white; border-radius: 8px;">
        //                             <span style="color: #475569; font-weight: 500;">Amount Paid:</span>
        //                             <span style="color: #059669; font-weight: 700; font-size: 16px;">KSh ${student.totalAmountPaid}</span>
        //                         </div>
        //                         <div style="display: flex; justify-content: between; align-items: center; padding: 12px 15px; background: white; border-radius: 8px;">
        //                             <span style="color: #475569; font-weight: 500;">Balance:</span>
        //                             <span style="color: ${student.feesBalance > 0 ? '#dc2626' : '#059669'}; font-weight: 700; font-size: 16px;">
        //                                 KSh ${student.feesBalance} ${student.feesBalance > 0 ? '⚠️' : '✅'}
        //                             </span>
        //                         </div>
        //                     </div>
        //                 </div>

        //                 <!-- Features & Benefits -->
        //                 <div style="margin: 30px 0;">
        //                     <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 16px; font-weight: 600;">🎯 What You Can Do</h3>
        //                     <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
        //                         <div style="display: flex; align-items: center; padding: 12px; background: #f0fdf4; border-radius: 8px;">
        //                             <span style="font-size: 20px; margin-right: 12px;">📊</span>
        //                             <span style="color: #166534; font-size: 14px;">View academic progress and reports</span>
        //                         </div>
        //                         <div style="display: flex; align-items: center; padding: 12px; background: #fef7cd; border-radius: 8px;">
        //                             <span style="font-size: 20px; margin-right: 12px;">💰</span>
        //                             <span style="color: #854d0e; font-size: 14px;">Track fee payments and statements</span>
        //                         </div>
        //                         <div style="display: flex; align-items: center; padding: 12px; background: #eff6ff; border-radius: 8px;">
        //                             <span style="font-size: 20px; margin-right: 12px;">📱</span>
        //                             <span style="color: #1e40af; font-size: 14px;">Receive important announcements</span>
        //                         </div>
        //                     </div>
        //                 </div>

        //                 <!-- Important Notice -->
        //                 <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 25px 0;">
        //                     <div style="display: flex; align-items: flex-start;">
        //                         <span style="color: #d97706; font-size: 18px; margin-right: 12px;">💡</span>
        //                         <div>
        //                             <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Important Information</h4>
        //                             <p style="color: #92400e; margin: 0; font-size: 13px; line-height: 1.5;">
        //                                 You will receive separate login credentials via SMS. Keep your Parent ID safe for all school communications.
        //                                 For fee-related inquiries, please contact the accounts office.
        //                             </p>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
                    
        //             <!-- Footer -->
        //             <div style="background: #1e293b; padding: 25px 30px; text-align: center;">
        //                 <p style="color: #cbd5e1; margin: 0 0 10px 0; font-size: 14px;">Need assistance? We're here to help!</p>
        //                 <p style="color: #94a3b8; margin: 0; font-size: 12px;">
        //                     Kisii School Care Center Office<br>
        //                     Email: office@kisiicare.edu | Phone: [School Phone Number]
        //                 </p>
        //                 <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
        //                     <p style="color: #64748b; margin: 0; font-size: 11px;">
        //                         © 2024 Kisii School Care Center. All rights reserved.<br>
        //                         Dedicated to nurturing young minds for a brighter future.
        //                     </p>
        //                 </div>
        //             </div>
        //         </div>
        //     </body>
        //     </html>
        //     `
        // );
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