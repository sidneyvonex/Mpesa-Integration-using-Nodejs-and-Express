import express,{Application,Request,Response} from "express";
import dotenv from "dotenv"
import cors from "cors"
import { getAccessToken } from "./lib/Auth.js";
import { stkPush } from "./lib/stkPushGen.js";

dotenv.config();

interface StkRequestBody {
    phoneNumber: string;
    amount: number;
    productName: string;
}

const app:Application = express()
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Default Route
app.get('/',(req,res:Response) =>{
    res.send("Welcome to our Mpesa Integration Api using Node Js and Express Js")
})

//initiate stk endpoint
app.post('/stk',async(req:Request,res:Response)=> {
    // console.log("STK Endpoint is Working")
    
    //Add a error handler
    try{
        //Safaricom Phone Number(2547......), amount(num),productName("")
        const { phoneNumber, amount, productName }:StkRequestBody = req.body;

        //Initiate STK PUSH
        

        //1.Authorization - Get Access Token

        const accessToken = await getAccessToken()
        //Retrive a Response
        

        //2.Initiate STK Push

        const initaiteStkResponse = await stkPush(accessToken,phoneNumber,amount,productName)
        res.json({success:true,initaiteStkResponse})





    }catch(error:any){
        res.status(500).json({error:error.message || "Success was False",success:false})
    }


})
//Callback Endpoint
app.post('/callback',async(req:Request,res:Response)=>{
    try{
        const stkCallbackData = req.body.Body

        let status =null
        if(stkCallbackData.ResultCode === 0){
            status = "Success"
        }else{
            status ="FAILED"
        }

        res.json({status,stkCallbackData})
    }catch(error:any){
        res.status(500).json({error:"Something Went Wrong"})
    }

})
app.listen(PORT,()=>{
    console.log(`🌟🌟Server is running on http://localhost:${PORT}`)
})

