import express from "express";
import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
dotenv.config();
const port=process.env.PORT || 8001;
const app=express();

app.use(express.json());
app.use("/auth", authRoutes);

app.use("/",(req,res)=>{
    res.send("auth is running");
})

connectDb();
app.listen(port,()=>{
    console.log(`auth is running on port ${port}`);
})