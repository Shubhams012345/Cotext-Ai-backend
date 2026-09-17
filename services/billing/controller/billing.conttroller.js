import crypto from "node:crypto";
import axios from "axios";
import razorpay from "../config/razorpay.js";
import Payment from "../models/payment.model.js";
import { PLANS } from "../utils/plan.js";

export const createOrder=async(req,res)=>{
    try{
      const userId=req.headers["x-user-id"]
      const { plan, purchaseType="plan" }=req.body;
      const selectedPlan=PLANS[plan]
      if(!selectedPlan){
        return res.status(404).json({success:false,message:"Plan not found"})
      }
      const order=await razorpay.orders.create({
        amount:selectedPlan.amount*100,
        currency:"INR",
        receipt:`receipt-${Date.now()}`
      })
      await Payment.create({
        userId,
        orderId:order.id,
        amount:selectedPlan.amount,
        credits:selectedPlan.credits,
        plan:selectedPlan.id,
        purchaseType,
        currency:order.currency,
        status:"created"
      })
      res.status(200).json({
        success:true,
        message:"Order created successFully",
        order,
        plan:selectedPlan,
        keyId:process.env.RAZORPAY_KEY_ID
      })
    }
    catch(err){
     return res.status(500).json({
        success:false,
        message:`Error while creating order ${err.message}`
     })
    }
}

export const verifyPayment=async(req,res)=>{
    try{
     const {razorpay_order_id ,razorpay_payment_id,razorpay_signature}=req.body
     const genrateSignature=crypto
                            .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
                            .update(`${razorpay_order_id}|${razorpay_payment_id}`)  
                            .digest("hex")

        if(genrateSignature!==razorpay_signature){
            return res.status(401).json({success:false,message:"Payment verification failed"})
        }
        const payment=await Payment.findOne({orderId:razorpay_order_id})
        if(!payment){
            return res.status(400).json({success:false,message:"Payment not found"})
        }
        payment.status="paid"
        payment.paymentId=razorpay_payment_id
        await payment.save()

        await axios.post(`${process.env.AUTH_SERVICE}/auth/update-plan`,{userId:payment.userId,
            plan:payment.purchaseType === "plan" ? payment.plan : undefined,
            credits:payment.credits
        })

        return res.status(200).json({
          success:true,
          message:"Payment verified ",
          plan:payment.plan,
          credits:payment.credits
        })
    }
    catch(err){
     return res.status(500).json({success:false,message:`verify payment error ${err.message}`})
    }
}