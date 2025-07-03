import express,{Application,Response} from "express";
import dotenv from "dotenv"
import cors from "cors"

dotenv.config();

const app:Application = express()
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/',(req,res:Response) =>{
    res.send("Welcome to our Mpesa Integration Api using Node Js and Express Js")
})


app.listen(PORT,()=>{
    console.log(`🌟🌟Server is running on http://localhost:${PORT}`)
})

