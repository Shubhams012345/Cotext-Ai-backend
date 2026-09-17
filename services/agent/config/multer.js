import fs from "fs"
import path from "path"
import multer from "multer"
const uploadDir=path.resolve("./temp")

 if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true})
 }

 const storage=multer.diskStorage({
    destination(req,file,cb){
        cb(null,uploadDir)
    },
    filename(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
 })

 const fileFilter=(req,file,cb)=>{
    const extension=path.extname(file.originalname).toLowerCase()
    const imageExtensions=[".jpg",".jpeg",".png",".webp",".gif"]
    const presentationExtensions=[".ppt",".pptx"]
    if(
      (file.mimetype.startsWith("image/") && imageExtensions.includes(extension)) ||
      (file.mimetype==="application/pdf" && extension===".pdf") ||
      (presentationExtensions.includes(extension) &&
        ["application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation","application/octet-stream"].includes(file.mimetype))
    ){
     cb(null,true)
   }
    else {
      const error=new Error("Only JPG, JPEG, PNG, WEBP, GIF, PDF, PPT, and PPTX files are allowed.")
      error.status=400
      cb(error)
    }
 }
 export default multer({storage,fileFilter,limits:{fileSize:20*1024*1024}})