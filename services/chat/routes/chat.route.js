import express from "express";
const router=express.Router()
 import {createConversation,getConversation,saveMessage,getMessage,updateConversation} from "../controllers/chat.controller.js"

 router.post("/create-conversation",createConversation)
 router.get("/get-Conversations",getConversation)
 router.post("/update-conversation",updateConversation)
router.post("/save-message",saveMessage);
router.get("/get-messages/:conversationId",getMessage)

export default router