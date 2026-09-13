export const getCurrentUser=async(req,res)=>{
    try{
       res.status(200).json(req.user)
    }
    catch(err){
      return res.status(500).json({success:false,message:`get current user error ${err}`})
    }
}
export default getCurrentUser