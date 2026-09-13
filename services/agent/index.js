import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import { router } from "./graph/router.js";
dotenv.config();
const app=express();    

app.use(express.json());

app.use("/",router)
app.use((err,res,req,next)=>{
    console.log(err)

    if(err.status){
        return res.status(err.status).json(err.data)
    }
    return res.status(500).json({message:`agent error ${err}`})
})
app.use("/",(req,res)=>{
    res.send("agent is live")
})
connectDb();
const port=process.env.PORT
app.listen(port,()=>{
    console.log(`agent is running on Port ${port}`)
})

