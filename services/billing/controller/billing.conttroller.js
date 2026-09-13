import razorpay from "../config/razorpay";
import Payment from "../models/payment.model";
import { PLANS } from "../utils/plan"

export const createOrder=async(req,res)=>{
    try{
      const userID=req.headers["x-user-id"]
      const plan=req.body;
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
        orderID:order.id,
        amount:selectedPlan.amount,
        credits:selectedPlan.credits,
        plan:selectedPlan.id,
        currency:order.currency,
        statuse:"created"
      })
      res.status(200).json({
        success:true,
        message:"Order created successFully",
        order,
        plan:selectedPlan
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
            return res.json(401).json({message:"Payment verification failed"})
        }
        const payment=await Payment.findOne({orderId:razorpay_order_id})
        if(!payment){
            return res.json(400).json({message:"Payment not found"})
        }
        payment.status="paid"
        payment.paymentId=razorpay_payment_id
        await payment.save()

        await axios.post(`${process.env.AUTH_SERVICE}/update-plan`,{userId:payment.userId,plan:payment.plan,
            credits:payment.credits
        })

        return res.status(200).json({success:true,message:"Payment verified "})
    }
    catch(err){
     return res.json(500).json({message:`verify payment error ${err.message}`})
    }
}