export const deductCredits=async(userId,agent)=>{
    try{
       const {data}=await axios.post(`${process.env.AUTH_SERVICE}/deduct-credits`,{userId,agent})
        return data;
    }
    catch(err){
       console.log(err)
       return null;
    }
}