const mysql = require("mysql");
const env = require("dotenv");
const fs = require("fs");

env.config({
  path:"./sec.env"
});
const envData = process.env;

const db = mysql.createConnection({
  host:envData.dbHost,
  database:envData.dbName,
  user:envData.dbUser,
  password:envData.dbPassword
});

db.connect((error) => {
  if(error){
  console.log(error);
  fs.writeFileSync('./log_ted.txt', error.toString())
  }else{
  console.log("DB Connected");
  fs.writeFileSync('./log_ted', "DB Connected");
  }
});

const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));

const setPrice = (service, model, callback) => {

  db.query("SELECT * FROM "+service.replace(/ /g,"_")+" WHERE model = ?", [model.toUpperCase()], (error, result) => {
    if(error){
      callback(0);
    }else{
      if(result && result != ""){
        if(result[0].model == model){
          //console.log(result[0].price)
          callback(result[0].price);
        }
      }else{
        callback(0);
      }
    }
  })

}

module.exports = { setPrice }