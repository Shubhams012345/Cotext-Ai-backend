 import redis from "../../shared/redis/redis.js";
 const protect=async(req,res,next)=>{
    try{
      const sessionId=req.cookies?.session
      if(!sessionId){
       return  res.status(400).json({success:false,message:"unauthorized access"})
      }
      const session=await redis.get(`session-${sessionId}`);
      if(!session){
        return res.status(400).json({success:false,message:"session expired"})
      }
      req.user=JSON.parse(session)
      next();
    }
    catch(err){
      res.status(500).json({success:false,message:`protect error ${err}`})
    }
}
export default protect