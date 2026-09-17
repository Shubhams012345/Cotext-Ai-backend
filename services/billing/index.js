import express from "express";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import paymentRoute from "../billing/routes/billing.route.js"
dotenv.config();
const port=process.env.PORT || 8004;
const app=express();

app.use(express.json());


app.use("/billing",paymentRoute)
app.get("/",(req,res)=>{
    res.send("billing is running");
})

connectDb();
app.listen(port,()=>{
    console.log(`billing is running on port ${port}`);
})