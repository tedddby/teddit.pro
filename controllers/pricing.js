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

  fs.writeFileSync('./log_ted2.txt', model);

  db.query("SELECT * FROM "+service.replace(/ /g,"_")+" WHERE model = ?", [model.toUpperCase()], (error, result) => {
    if(error){
      fs.writeFileSync('./log_ted3.txt', error.toString());
      callback(20000);
    }else{
      if(result && result != ""){
        fs.writeFileSync('./log_ted3.txt', result[0].price);
        if(result[0].model == model){
          callback(result[0].price);
        }else{
          callback(10000);
        }
      }else{
        fs.writeFileSync('./log_ted3.txt', "nothing");
        callback(30000);
      }
    }
  })

}

module.exports = { setPrice }