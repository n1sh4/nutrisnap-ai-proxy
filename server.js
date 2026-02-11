import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors({
    origin:"*",
    methods:["GET","POST","OPTIONS"],
    allowedHeaders:["Content-Type","Authorization"]
}));

app.use(express.json({limit:"10mb"}));
app.options("*", cors());

app.get("/", (req,res)=>{
    res.send("AI Proxy Alive 🔥");
});

app.post("/ai", async (req,res)=>{
try{

    const ai = await fetch("https://api.openai.com/v1/responses",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
            model:"gpt-4.1-mini",
            input:[
                {
                    role:"user",
                    content:[
                        { 
  type:"input_text",
  text:`
Detect ALL food items in the image.

Estimate portion size visually:
small, medium, or large.

Return ONLY valid JSON array.

Format:
[
 { "name":"food", "portion":"small|medium|large", "calories":number, "protein":number, "carbs":number }
]

Estimate nutrition based on portion size.
No explanation.
`
}

,
                        {
                        type:"input_image",
                        image_url: req.body.image
                        }

                    ]
                }
            ]
        })
    });

    const data = await ai.json();
    console.log("OPENAI RAW:", data);

    let text = "[]";

    if(data.output_text){
        text = data.output_text;
    }else if(data.output && data.output[0]?.content){
        text = data.output[0].content[0].text || "[]";
    }

    let result = [];
    try{
        result = JSON.parse(text);
    }catch{
        console.log("JSON PARSE FAIL:", text);
    }

    res.json(result);

}catch(e){
    console.log("SERVER ERROR:", e);
    res.status(500).json({error:e.message});
}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("AI Proxy Running on " + PORT);
});
