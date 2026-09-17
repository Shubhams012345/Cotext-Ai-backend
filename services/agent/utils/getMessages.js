import axios from "axios"
export const getMessages=async(conversationId)=>{
    try{
       const {data}=await axios.get(`${process.env.CHAT_SERVICE}/api/chatRoutes/get-messages/${conversationId}`)
       return data.messages || [];
    }
    catch(err){
      console.log(err);
    return [];
    }
}