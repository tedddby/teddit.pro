const mysql = require("mysql");
const env = require("dotenv");

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
  }else{
  console.log("DB Connected");
  }
});

const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));

const setPrice = (service, model, callback) => {

  db.query("SELECT * FROM "+service.replace(/ /g,"_")+" WHERE model = ?", [model.toUpperCase()], (error, result) => {
    if(error){
      callback(20000);
    }else{
      if(result && result != ""){
        if(result[0].model == model){
          callback(result[0].price);
        }else{
          callback(10000);
        }
      }else{
        callback(30000);
      }
    }
  })

}

module.exports = { setPrice }