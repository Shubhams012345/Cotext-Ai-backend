import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";
import cors from "cors";
import protect from "./middleware/auth.middleware.js";
import getCurrentUser from "./controller/user.controller.js";
import cookieParser from "cookie-parser";
import {proxyWithHeader} from "./utils/proxyWithHeader.js"
dotenv.config();
const port=process.env.PORT || 8000;
const app=express();

app.use(cors({
    origin:process.env.FRONTEND_URL || "http://localhost:5173",
    credentials:true,
}))
app.use(cookieParser())
app.use(
  "/api/auth",
  proxy(process.env.AUTH_SERVICE, {
    proxyReqPathResolver: (req) => {
      return `/auth${req.url}`; // Auth service ko poora '/auth/login' path milega
    },
  })
);
app.use(
  "/api/chat",
  protect,
  proxyWithHeader(process.env.CHAT_SERVICE, "/api/chatRoutes")
);
app.use(
  "/api/billing",
  protect,
  proxyWithHeader(process.env.BILLING_SERVICE, "/billing")
);
app.use(
  "/api/agent",
  protect,
   proxyWithHeader(process.env.AGENT_SERVICE, "/agent")
);
app.get("/api/me",protect,getCurrentUser)

app.get("/",(req,res)=>{
    res.send("Gateway is running");
})
app.listen(port,()=>{
    console.log(`Gateway is running on port ${port}`);
})