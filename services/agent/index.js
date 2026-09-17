import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import  router  from "./router/agent.router.js";
dotenv.config();
const app=express();    

app.use(express.json());

app.use("/agent",router)
app.use((err,req,res,next)=>{
    console.log(err)

    if(err.code==="LIMIT_FILE_SIZE"){
        return res.status(413).json({success:false,message:"File must be 20 MB or smaller."})
    }
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
