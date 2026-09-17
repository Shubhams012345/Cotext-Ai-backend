import express from "express";
import connectDb from "./config/db.js";
import chatRoutes from "./routes/chat.route.js"
import dotenv from "dotenv";
dotenv.config();
const port=process.env.PORT || 8002;
const app=express();

app.use(express.json());

app.use("/api/chatRoutes",chatRoutes)
app.use("/",(req,res)=>{
    res.send("chat is running");
})

connectDb();
app.listen(port,()=>{
    console.log(`chat is running on port ${port}`);
})