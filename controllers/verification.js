const env = require("dotenv");
const jwt = require("jsonwebtoken");
const GlobalPricing = require("./pricing");
const fetch = require("node-fetch");
const mysql = require("mysql");


env.config({
    path:"./sec.env"
});

const envData = process.env;
const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));

const db = mysql.createConnection({
    host:envData.dbHost,
    database:envData.dbName,
    user:envData.dbUser,
    password:envData.dbPassword
  });
  
  db.connect((error) => {
    if(error){
    //console.log(error);
    }else{
    console.log("DB Connected");
    }
  });

const VerifySerial = (req, res) => { 
    const getSerial = req.originalUrl.replace("/verification/serial/", "");
    const iFreeUrl = "https://api.ifreeicloud.co.uk";

    if(getSerial == "" || getSerial.includes("-") == false){
        console.log("failed");
        return res.status(401).json({status:"invalid serial number"})
    }else{
        const serialNumber = getSerial.split("-")[0].toUpperCase();
        const service = decodeURI(getSerial.split("-")[1]);
        const orderID = parseInt(Math.floor(100000 + Math.random() * 900000));

        const iFreePostData = {
            key: envData.iFreeKey,
            service: 0,
            imei: serialNumber
        };
        
        fetch(iFreeUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
              },
            body: convertToUrlEncoded(iFreePostData)
        })
        .then((response) => response.json())
        .then((data) => {
            if(data.success == true){

                /*Modify model to go with our pricing system*/

                var modelToPass = "none";
                if(data.object.model.includes("Plus") || data.object.model.includes("Pro") && data.object.model.includes("Max") == false){
                    var model_split = data.object.model.toUpperCase().split(" ");
                    modelToPass = model_split[0]+" "+model_split[1]+" "+model_split[2];
                }else{
                    if(data.object.model.includes("Max")){
                        var model_split = data.object.model.toUpperCase().split(" ");
                        modelToPass = model_split[0]+" "+model_split[1]+" "+model_split[2]+" "+model_split[3];
                    }else{
                        var model_split = data.object.model.toUpperCase().split(" ");
                        modelToPass = model_split[0]+" "+model_split[1];
                    }
                }

                /* **************************************** */

                /*Retriving price for detected device model*/

                GlobalPricing.setPrice(service, modelToPass, function(result){
                    
                    var cookie = signCheckoutCookie(service, serialNumber, result, data.object.model, orderID);

                    res.cookie("checkout", cookie, {
                        expires: new Date(Date.now() + 60 * 60 * 1000),
                        httpOnly: true
                    });

                    return res.status(200).json({status:"success"});

                });

                /* **************************************** */

            }else{
                return res.status(300).json({status:"failed"});
            }
        });
    }

}


const VerifyCheckout = async (req, res, next) => {
    if(req.cookies.checkout){
        try{
            const decoded = await promisify(jwt.verify)(req.cookies.checkout, envData.jwtKey);
            req.serial = decoded.SerialNumber;
            req.service = decoded.Service;
            req.price = decoded.Price;
            req.model = decoded.Model;
            req.orderID = decoded.OrderID;
            req.type = decoded.Type;
            next();
        }catch{
            next();
        }
    }else{
        next();
    }
}

const VerifyPromo = async (req, res) => {
    const promo = req.originalUrl.replace("/verification/promo/", "");
    const decoded = await promisify(jwt.verify)(req.cookies.checkout, envData.jwtKey);

    if(promo == ""){
        return res.status(401).json({status:"Invalid Promo Code"})
    }else{
        //////////////////////////////////////////////

        /*Modify model to go with our pricing system*/
        var modelToPass = "none";
        if(decoded.Model.includes("Plus") || decoded.Model.includes("Pro") && decoded.Model.includes("Max") == false){
            var model_split = decoded.Model.toUpperCase().split(" ");
            modelToPass = model_split[0]+" "+model_split[1]+" "+model_split[2];
        }else{
            if(decoded.Model.includes("Max")){
                var model_split = decoded.Model.toUpperCase().split(" ");
                modelToPass = model_split[0]+" "+model_split[1]+" "+model_split[2]+" "+model_split[3];
            }else{
                var model_split = decoded.Model.toUpperCase().split(" ");
                modelToPass = model_split[0]+" "+model_split[1];
            }
        }
        /* **************************************** */

        GlobalPricing.setPrice(decoded.Service, modelToPass, function(result){
            if(decoded.Price == result){
                db.query("SELECT * FROM promos WHERE promo = ?", [promo], (error, result) => {
                    if(error){
                      console.log(error);
                      return res.status(400).json({status:"failed", msg:"Internal Server Error."});
                    }else{
                      if(result && result != ""){
                        var promoVal = result[0].value;
                        ApplyPromo(req, promoVal, function(cookie, newPrice){
                            //console.log(cookie);
                            res.cookie("checkout", cookie, {
                                expires: new Date(Date.now() + 60 * 60 * 1000),
                                httpOnly: true
                            });
                            return res.status(200).json({status:"success", msg:"Promo Applied!", price:newPrice});
                        });
                      }else{
                        return res.status(200).json({status:"failed", msg:"Invalid/Expired Promo."});
                      }
                    }
                });
            }else{
                return res.status(200).json({status:"failed", msg:"You have already used a promo!"});
            }
        });
        //////////////////////////////////////////////
    }

}

const ApplyPromo = async (req, promoVal, callback) => {
    const decoded = await promisify(jwt.verify)(req.cookies.checkout, envData.jwtKey);

    var newPrice = parseFloat(decoded.Price) * (1-parseFloat(promoVal));

    newPrice = Number((newPrice).toFixed(1));

    var cookie = signCheckoutCookie(decoded.Service, decoded.SerialNumber, newPrice, decoded.Model, decoded.OrderID);
    callback(cookie, newPrice);
}

function convertToUrlEncoded(data){
    var iFreePostBody = [];
        for (var property in data) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(data[property]);
          iFreePostBody.push(encodedKey + "=" + encodedValue);
        }
    iFreePostBody = iFreePostBody.join("&");
    return iFreePostBody;
}

function signCheckoutCookie(service, serial, price, model, orderID){
    var token = jwt.sign({
        Service:service,
        SerialNumber:serial,
        Price:price,
        Model:model,
        OrderID:orderID,
        Type:"type"
    }, 
    envData.jwtKey,
    {
        expiresIn:"1h"
    });

    return token;
}

module.exports = {VerifySerial, VerifyCheckout, VerifyPromo}