import express,{Application,Request,Response} from "express";
import dotenv from "dotenv"
import cors from "cors"

dotenv.config();

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
app.post('/stk',(req:Request,res:Response)=> {
    // console.log("STK Endpoint is Working")
    
    //Add a error handler
    try{
        //Safaricom Phone Number(2547......), amount(num),productName("")
        const {phoneNumber,amount,productName} = req.body;

        //Initiate STK PUSH
        //1.Authorization
    }catch(error:any){
        res.status(500).json({error:error.message})
    }


})

app.listen(PORT,()=>{
    console.log(`🌟🌟Server is running on http://localhost:${PORT}`)
})

