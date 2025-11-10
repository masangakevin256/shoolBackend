const {getDb} = require("../model/schoolDb");
const {format} = require("date-fns");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const addNewAdmin = async (req,res) => {
    const sendEmail = require("../utils/sendEmail");
    const roles = "admin"
    const db = getDb();
    const {email, username , password, secretReg  } = req.body;
    if(!db) return res.status(404).json({"message": "Database not initialized"});
    if(!email || !username || !password || !secretReg){
        return res.status(400).json({"message": "email, username, password secret registration number and phone number required"})
    }
    
    try {
        // check if he has the correct secret code to register
        const usedAdminCode = await db.collection("admins").findOne({adminId: secretReg});
        if(!usedAdminCode){
            return res.status(400).json({"message": "Failed to verify secret registration number"});
        }
        // check for duplicates
        const duplicateUsernameEmail = await db.collection("admins").findOne({email: email}, {username: username});

        //assign id 
        
            const lastAdmin = await db.collection("admins")
            .find()
            .sort({ adminId: -1 })
            .limit(1)
            .toArray();

            let adminId;

            if (lastAdmin.length === 0) {
            // No parent yet → start with TC001
                adminId = "AD001";
            } else {
            // Extract the last adminId
            const lastId = lastAdmin[0].adminId; 
            
            // Extract numeric part using regex
            const num = parseInt(lastId.match(/\d+/)[0]);
            
            // Increment and pad to 3 digits
            const nextNum = String(num + 1).padStart(3, "0");
            
            // Combine with prefix
                adminId = "AD" + nextNum;
            }
        if(duplicateUsernameEmail) return res.status(409).json({"message": `Admin with email ${email} and username ${username} already exists`});
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminFormat ={
            "email": email,
            "username": username,
            "adminId": adminId,
            "password":hashedPassword,
            "amountPaid": 100000,
            // "phoneNumber": phoneNumber,
            "roles": roles,
            "registeredBy": usedAdminCode.username,
            "createdAt": `${format(new Date() ,"yyyy/MM/dd  HH:mm:ss")}`,
        }
        // await sendEmail(
            
        //     email,
        //     "Admin Account Created - Kisii Care Center School",
        //     `Dear ${username}, your admin account for Kisii Care School Center. Your Admin ID: ${adminId}`,
        //     `
        //     <!DOCTYPE html>
        //     <html>
        //     <head>
        //         <meta charset="utf-8">
        //         <style>
        //             @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        //         </style>
        //     </head>
        //     <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
        //         <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        //             <!-- Header -->
        //             <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center;">
        //                 <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">🏥 Kisii School</h1>
        //                 <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Care center</p>
        //             </div>
                    
        //             <!-- Main Content -->
        //             <div style="padding: 40px 30px;">
        //                 <!-- Success Icon -->
        //                 <div style="text-align: center; margin-bottom: 25px;">
        //                     <div style="background: #e6f4ea; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
        //                         <span style="font-size: 36px; color: #28a745;">✓</span>
        //                     </div>
        //                 </div>
                        
        //                 <!-- Welcome Message -->
        //                 <h2 style="color: #1a202c; text-align: center; margin-bottom: 20px; font-weight: 600;">Welcome, ${username}!</h2>
        //                 <p style="color: #4a5568; text-align: center; line-height: 1.6; margin-bottom: 30px;">
        //                     Your administrator account for the <strong>Kisii Care Center School</strong> has been successfully created and is now active.
        //                 </p>
                        
        //                 <!-- Admin Details Card -->
        //                 <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #28a745;">
        //                     <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px; font-size: 16px; font-weight: 600;">📋 Account Information</h3>
        //                     <div style="display: flex; align-items: center; margin-bottom: 10px;">
        //                         <span style="color: #718096; min-width: 100px;">Admin ID:</span>
        //                         <span style="color: #2d3748; font-weight: 500; background: #e6f4ea; padding: 4px 12px; border-radius: 6px; font-family: monospace;">${adminId}</span>
        //                     </div>
        //                 </div>
                        
        //                 <!-- Security Notice -->
        //                 <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
        //                     <div style="display: flex; align-items: flex-start;">
        //                         <span style="color: #856404; font-size: 18px; margin-right: 12px;">🔒</span>
        //                         <div>
        //                             <h4 style="color: #856404; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Security Reminder</h4>
        //                             <p style="color: #856404; margin: 0; font-size: 13px; line-height: 1.5;">
        //                                 Please keep your login credentials secure and do not share them with anyone. Contact IT support immediately if you suspect any unauthorized access.
        //                             </p>
        //                         </div>
        //                     </div>
        //                 </div>
                        
        //                 <!-- Next Steps -->
        //                 <div style="margin: 30px 0;">
        //                     <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 16px; font-weight: 600;">🎯 Next Steps</h3>
        //                     <ul style="color: #4a5568; padding-left: 20px; margin: 0;">
        //                         <li style="margin-bottom: 8px;">Check your email for login instructions</li>
        //                         <li style="margin-bottom: 8px;">Set up your password when prompted</li>
        //                         <li>Familiarize yourself with the system dashboard</li>
        //                     </ul>
        //                 </div>
        //             </div>
                    
        //             <!-- Footer -->
        //             <div style="background: #2d3748; padding: 25px 30px; text-align: center;">
        //                 <p style="color: #a0aec0; margin: 0 0 10px 0; font-size: 14px;">Need help? Contact our IT Department</p>
        //                 <p style="color: #718096; margin: 0; font-size: 12px;">
        //                    Kisii IT department school care team<br>
        //                     Email: kisii@gmail.com | Phone: (123) 456-7890
                            
        //                 </p>
        //                 <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #4a5568;">
        //                     <p style="color: #718096; margin: 0; font-size: 11px;">
        //                         © 2024 Kisii Care School Center.<br>
        //                         This is an automated message - please do not reply to this email.
        //                     </p>
        //                 </div>
        //             </div>
        //         </div>
        //     </body>
        //     </html>
        //     `
        // );
        const results = await db.collection("admins").insertOne(adminFormat);
        res.status(201).json(
            {"message":`Admin ${adminFormat.username} added successfully` }
        )

    } catch (error) {
         res.status(500).json({"message": `${error.message}`});
    }
}

module.exports = addNewAdmin