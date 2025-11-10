const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const addNewTeacher = async (req,res) => {
    const sendEmail = require("../utils/sendEmail")
    const db = getDb();
    const {email, username, password, phoneNumber, secretReg} = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!email || !username || !password || !secretReg ){
        return res.status(400).json({"message": "Email, username, password,  required required"})
    }
    
    try {
        //get all teachers
            const lastTeacher = await db.collection("teachers")
            .find()
            .sort({ teacherId: -1 })
            .limit(1)
            .toArray();

            let teacherId;

            if (lastTeacher.length === 0) {
            // No teachers yet → start with TC001
            teacherId = "TC001";
            } else {
            // Extract the last teacherId
            const lastId = lastTeacher[0].teacherId;
            
            // Extract numeric part using regex
            const num = parseInt(lastId.match(/\d+/)[0]);
            
            // Increment and pad to 3 digits
            const nextNum = String(num + 1).padStart(3, "0");
            
            // Combine with prefix
                teacherId = "TC" + nextNum;
            }

        // check if used code is good
         const usedAdminCode = await db.collection("admins").findOne({adminId: secretReg });

         if(!usedAdminCode) return res.status(400).json({"message": "Invalid secret registration number"})
            // check for duplicates
        const duplicate = await db.collection("teachers").findOne({username: username}, {email: email});
        
        if(duplicate) return res.status(409).json({"message": `Teacher ${username} already exists`});
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
         await sendEmail(
            email,
            "Welcome to Kisii School Care Center - Teacher Account Created",
            `Dear ${username}, your teacher account for Kisii School Care Center has been created successfully. Teacher ID: ${teacherId}`,
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                </style>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #fefce8;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🏫 Kisii School Care Center</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Excellence in Education</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 40px 30px;">
                        <!-- Welcome Section -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="background: #fef3c7; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                                <span style="font-size: 36px; color: #d97706;">👨‍🏫</span>
                            </div>
                            <h2 style="color: #1e293b; margin: 20px 0 10px 0; font-weight: 600;">Welcome to Our Teaching Team, ${username}!</h2>
                            <p style="color: #64748b; line-height: 1.6; margin: 0;">
                                We're excited to have you join our dedicated team of educators shaping the future at Kisii School Care Center.
                            </p>
                        </div>

                        <!-- Teacher Details -->
                        <div style="background: #fffbeb; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #fcd34d;">
                            <h3 style="color: #92400e; margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600; text-align: center;">📝 Teacher Profile Details</h3>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                    <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">TEACHER ID</p>
                                    <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;">${teacherId}</p>
                                </div>
                                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                    <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">PHONE NUMBER</p>
                                    <p style="color: #1e293b; margin: 0; font-size: 16px; font-weight: 600;">${phoneNumber}</p>
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                    <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">REGISTERED BY</p>
                                   
                                </div>
                                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                    <p style="color: #64748b; margin: 0 0 5px 0; font-size: 12px; font-weight: 500;">ACCOUNT CREATED</p>
                                    <p style="color: #1e293b; margin: 0; font-size: 14px; font-weight: 600;">${teacherFormat.createdAt}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Salary Information -->
                        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #a7f3d0;">
                            <h3 style="color: #065f46; margin-top: 0; margin-bottom: 20px; font-size: 18px; font-weight: 600; text-align: center;">💰 Salary Information</h3>
                            
                            <div style="text-align: center; padding: 20px; background: white; border-radius: 8px;">
                                <p style="color: #047857; margin: 0 0 10px 0; font-size: 14px; font-weight: 500;">MONTHLY SALARY</p>
                                <p style="color: #065f46; margin: 0; font-size: 28px; font-weight: 700;">KSh ${teacherFormat.paidAmount}</p>
                                <p style="color: #059669; margin: 10px 0 0 0; font-size: 12px;">✅ Competitive compensation package</p>
                            </div>
                        </div>

                        <!-- Teacher Portal Features -->
                        <div style="margin: 30px 0;">
                            <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 16px; font-weight: 600;">🎯 Teacher Portal Access</h3>
                            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                                <div style="display: flex; align-items: center; padding: 12px; background: #eff6ff; border-radius: 8px;">
                                    <span style="font-size: 20px; margin-right: 12px;">📚</span>
                                    <span style="color: #1e40af; font-size: 14px;">Manage classes and lesson plans</span>
                                </div>
                                <div style="display: flex; align-items: center; padding: 12px; background: #f0fdf4; border-radius: 8px;">
                                    <span style="font-size: 20px; margin-right: 12px;">📊</span>
                                    <span style="color: #166534; font-size: 14px;">Record student grades and attendance</span>
                                </div>
                                <div style="display: flex; align-items: center; padding: 12px; background: #fef7cd; border-radius: 8px;">
                                    <span style="font-size: 20px; margin-right: 12px;">👥</span>
                                    <span style="color: #854d0e; font-size: 14px;">Communicate with parents and staff</span>
                                </div>
                                <div style="display: flex; align-items: center; padding: 12px; background: #f3e8ff; border-radius: 8px;">
                                    <span style="font-size: 20px; margin-right: 12px;">💰</span>
                                    <span style="color: #7e22ce; font-size: 14px;">Access payroll and salary information</span>
                                </div>
                            </div>
                        </div>

                        <!-- Next Steps -->
                        <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <h4 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">📋 Getting Started</h4>
                            <ol style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                                <li style="margin-bottom: 8px;">You will receive login credentials via SMS</li>
                                <li style="margin-bottom: 8px;">Complete your teacher profile in the portal</li>
                                <li style="margin-bottom: 8px;">Attend the orientation session (date to be announced)</li>
                                <li>Review the teacher handbook and school policies</li>
                            </ol>
                        </div>

                        <!-- Important Notice -->
                        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0;">
                            <div style="display: flex; align-items: flex-start;">
                                <span style="color: #dc2626; font-size: 18px; margin-right: 12px;">🔒</span>
                                <div>
                                    <h4 style="color: #991b1b; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Confidentiality Notice</h4>
                                    <p style="color: #991b1b; margin: 0; font-size: 13px; line-height: 1.5;">
                                        Please keep your login credentials secure. All student information and school data accessed through the portal are confidential and should be handled with utmost care.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #1e293b; padding: 25px 30px; text-align: center;">
                        <p style="color: #cbd5e1; margin: 0 0 10px 0; font-size: 14px;">Welcome to our educational community!</p>
                        <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                            Kisii School Care Center - Administration<br>
                            Email: admin@kisiicare.edu | HR: hr@kisiicare.edu
                        </p>
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155;">
                            <p style="color: #64748b; margin: 0; font-size: 11px;">
                                © 2024 Kisii School Care Center. All rights reserved.<br>
                                Together, we shape the future - one student at a time.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `
        );
        const results = await db.collection("teachers").insertOne(teacherFormat);
        res.status(201).json(
            {"message":`Teacher ${teacherFormat.username} added successfully` }
        )

    } catch (error) {
         res.status(500).json({"message": `${error.message}`});
    }
}
module.exports = addNewTeacher