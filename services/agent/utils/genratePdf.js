import { lineGap, moveDown, PDFDocument }from "pdfkit"
import { size } from "pdfkit/js/page"
export const genratePdf=async(data)=>{
    return new Promise((resolve,reject)=>{
        const doc=new PDFDocument({
            size:"A4",
            margin:"50",
            info:{
                Author:"Cotext-AI",
                title:data.title,
                Creator:"Cotext-AI"
            }
        })
        const chunks=[]
        doc.on("data",(chunk=>chunks.push(chunk)));
        doc.on("end",()=>resolve(Buffer.concat(chunks)))
        doc.on("error",()=>reject)
        
        //title
        doc
        .fontSize(28)
        .text(data.title,{
            align:"center"
        })
        .fillColor("#111827")
         
        if(data.subtitle){
             doc.moveDown(0.5)
        }

        //subtitle
        doc
        .fontSize(12)
        .text(data.subtitle,{
            align:"center"
        })
        .fillColor("#6B7280")
      
        doc.moveDown(2)

        //SECTION
        data?.sections?.forEach(s=>{
         doc
        .fontSize(18)
        .text(s.heading)
        .fillColor("#111827")
        doc.moveDown(0.5)

        s?.points?.forEach((p)=>{
             doc
        .fontSize(12)
        .text(". "+p,{
             lineGap:5
        })
        .fillColor("#374151")
    });
    doc.moveDown()

        });
        doc.moveDown()
        doc.fontSize(10)
        .text("Genrated by CotextAI",{
            align:center
        })
       .fillColor("#9CA3AF")

       doc.end()
    })

}