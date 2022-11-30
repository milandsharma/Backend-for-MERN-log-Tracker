const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT||5000;
const mongoose = require("mongoose");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://milandsharma:Sasni123@cluster0.iypepdn.mongodb.net", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const userData = new mongoose.Schema({
  customerName: String,
  address: String,
  phone: String,
  amount: [String],
  billNo: String,
  date: [String],
  received: [String],
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  UserData: [userData],
});
// 

const User = mongoose.model("User", userSchema);

app.get("/add", (req, res) => {
  res.send("Server is running");
});

app.post("/register", (req, res) => {
  const { username, email, password, UserData } = req.body;
  const user = new User({ username, email, password});

  user.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.send({ message: "Success", username: username });
    }
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email }, (err, found) => {
    if (found === null) {
      res.send({ message: "Register your account" });
    } else {
      if (password === found.password) {
        res.send({ message: found.username, verify: found.password });
      } else {
        res.send({ message: "wrong key" });
      }
    }
  });
});

app.post("/log", (req, res) => {
  const { owner, customerData } = req.body;
  const { name, email } = owner;
  const{customerName,address,phone,amount,billNo,date,received} = customerData;
  User.findOne({ email: email }, (err, found) => {
    if(found === null) {
      res.send({message: "Register your account"});
    }else{
      User.findOne({"UserData.billNo":String(billNo)}, (err, found) => {
        if(found === null){
          User.findOneAndUpdate({ email: email }, { $push: { UserData: customerData } }, (err, found) => {
                if (err) {
                  console.log(err);
                } else {
                  res.send({message:"customer log is created"})
                }
              });
        }else{
          res.send({message:`customer already exists bill no : ${billNo} `})
        }
      })
    }
    
  });

  









});

app.post("/update", (req, res)=>{
  const {email, billNo, date,received} = req.body;
  User.findOneAndUpdate({email:email, "UserData.billNo":billNo}, {$push:{"UserData.$.date":date, "UserData.$.received":received}}, (err, found)=>{
    if(err){
      console.log(err);
    }else{
      if(found === null){
        res.send({message:"Bill No Not Found"})
      }else{
        found.UserData.forEach((item)=>{
          if(item.billNo === billNo){
            const amount = Number(item.amount[item.amount.length - 1]) - Number(item.received[item.received.length - 1]);
            User.findOneAndUpdate({email:email, "UserData.billNo":billNo}, {$push:{"UserData.$.amount":amount}}, (err, found)=>{
              if(err){
                console.log(err);
              }else{
                res.send({message:"updated"})
              }
            })
          }
        })
      }
      
      
    }
  })
})

app.post("/data", (req, res)=>{
  const {email} = req.body;
  User.findOne({ email: email }, (err, found)=>{
    
      res.send({UserData:found.UserData});
    
  })
 
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
