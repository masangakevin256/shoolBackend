require("dotenv").config();
const path = require("path")
const express = require("express");
const { logger } = require("./middleware/logEvents");
const errorLog = require("./middleware/errorLog");
const {connectToDb, getDb} = require("./model/schoolDb");
const corsOptions = require("./controller/controlCorsOptions");
const cors = require("cors");
const verifyJwt = require("./middleware/verifyJwt");
let db;
const app = express();
const PORT = process.env.PORT || 3500;

//custom middlewares
app.use(logger)
app.use(cors(corsOptions));
//inbuilt middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

//routes
// registration
app.use("/register/parents", require("./routes/registerParents"));
app.use("/register/admins", require("./routes/registerAdmin"));
app.use("/register/teachers", require("./routes/registerTeachers"));
//login routes
app.use("/login", require("./routes/login"))

//logout routes
app.use("/parents/logout", require("./routes/parentsLogout"));
app.use("/teachers/logout", require("./routes/teachersLogout"));
app.use("/admins/logout", require("./routes/adminsLogout"));
//teachers student parents  routes
app.use(verifyJwt);
app.use("/teachers", require("./routes/teachers"));
app.use("/students", require("./routes/students"));
app.use("/admins", require("./routes/admins"));
app.use("/parents", require("./routes/parents"));

//for auth me
app.use("/authMe", require("./routes/authMe.js"))
//for refresh tokens
app.use("/refresh/parents", require("./routes/parentsRefresh"));
app.use("/refresh/teachers", require("./routes/teachersRefresh"));
app.use("/refresh/admins", require("./routes/adminRefresh"));


app.all(/.*/, (req, res) => {
    res.status(404);
    if(req.accepts("html")){
        res.sendFile(path.join(__dirname, "views", "404.html"));
    }else if(req.accepts("json")){
        res.json({message: "404 Not Found"})
    }else{
        res.type("txt").send("404 Not Found");
    } 
});
app.use(errorLog)
connectToDb((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}.....`);
    });

    db = getDb(); 
    console.log("Database connection established");
  } else {
    console.error("Failed to connect to the database:", err);
  }
});