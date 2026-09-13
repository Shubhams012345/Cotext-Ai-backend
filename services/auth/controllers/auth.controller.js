import {getAuth} from "firebase-admin/auth";
import {app} from "../config/firebase.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import redis from "../../../shared/redis/redis.js";
export const login=async(req,res)=>{
    try{
       const{token}=req.body;
       const decoded=await getAuth(app).verifyIdToken(token);
       let user=await User.findOne({firebaseUid:decoded.uid});

       if(!user){
        user=await User.create({
            firebaseUid:decoded.uid,
            name:decoded.name,
            email:decoded.email,
            avatar:decoded.picture
        })
       }

       const sessionId=crypto.randomUUID();
       await redis.set(`user-session-${user?._id}`,sessionId,"EX",7*24*60*60)

       redis.set(`session-${sessionId}`,JSON.stringify({
          userID:user._id,
          name:user.name,
          email:user.email,
          avatar:user.avtar
       }),"EX",7*24*60*60)

       res.cookie("session",sessionId, {
            httpOnly:true,
            samesite:"strict",
            secure:false,
            maxAge:7*24*60*60*1000
        }
       )
       
       return res.status(200).json({message:"Login successful",user});
    }
    catch(err){
      res.status(500).json({message:"Internal server error",error:err.message})
    }
}

export const logout=async(req,res)=>{
    try{
       const sessionId=req.cookies?.session
       await redis.del(`session-${sessionId}`)

       res.clearCookie("session");
       return res.status(200).json({
        success:true,
        message:"User logged out successfully"
       })
    }
    catch(err){
      res.status(500).json({success:false,message:`error while logging out ${err}`})
    }
}

export const updatUserPayment=async(req,res)=>{
    try{
      const{plan,credits,userId}=req.body;
      const user=await User.findById(userId)
      if(!user){
        return res.status(400).json({success:false,message:"user not found"})
      }
      user.plan=plan,
      user.credits +=credits,
      user.totalCredits+=credits,
      user.planExpiresAt=new Date(Date.now()+30*24*60*60*1000)
      await user.save()

        const sessionId= await redis.get(`user-session-${user?._id}`)
       redis.set(`session-${sessionId}`,JSON.stringify({
          userID:user._id,
          name:user.name,
          email:user.email,
          avatar:user.avtar,
          plan:user.plan,
          credits:user.credits,
          totalCredits:user.totalCredits,
          planExpiresAt:user.planExpiresAt
       }),"EX",7*24*60*60)

       return res.status(200).json({success:true,message:"user updated successFully,"})
    }
    catch(err){
     return res.status(500).json({message:`Error while updating user payment`})
    }
}

export const deductCredits=async(req,res)=>{
    try{
       const {userId,agent}=req.body
       const COST={
        chat:1,
        search:5,
        coding:10,
        pdf:10,
        ppt:10,
        imageGen:10
       }
       const user=await User.findById(userId);
       if(!user){
        return res.status(400).json({success:false,messsage:"user not found"})
       }
       const requiredCredits=COST[agent];
       if(user.credits<requiredCredits){
        return res.status(400).json({success:false,message:"Not enough credits"})
       }
       user.credits-=requiredCredits
       await user.save();

        const sessionId= await redis.get(`user-session-${user?._id}`)
       redis.set(`session-${sessionId}`,JSON.stringify({
          userID:user._id,
          name:user.name,
          email:user.email,
          avatar:user.avtar,
          plan:user.plan,
          credits:user.credits,
          totalCredits:user.totalCredits,
          planExpiresAt:user.planExpiresAt
       }),"EX",7*24*60*60)

       return res.status(200).json({success:true,message:"user updated successFully,"})
    }
    catch(err){
      res.status(500).json({
        success:false,
        message:`Error while deducting credits ${err.message}`
      })
    }
}