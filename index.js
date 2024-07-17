const express = require("express");
const app = express();
const rootRouter = require("./routes/index.js");

const cors = require("cors")
//all of these are middlewares
app.use(cors());

app.use(express.json());

app.use("/api/v1", rootRouter) //another base URL localhost:3000/api/v1/...

app.listen(3000, ()=> {
    console.log("Listening on Port 3000")
})

