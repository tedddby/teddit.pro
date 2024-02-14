const env = require("dotenv");
const request = require("request");
const jwt = require("jsonwebtoken");
const ms_pricing = require("./pricing");
const fetch = require("node-fetch");
const fmi_pricing = require("./fmi_pricing");

env.config({
    path:"./sec.env"
});

const envData = process.env;
const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));

const VerifySerial = (req, res) => { 
    const getSerial = req.originalUrl.replace("/verification/serial/", "");
    const iFreeUrl = "https://api.ifreeicloud.co.uk";

    if(getSerial == "" || getSerial.includes("-") == false){
        console.log("failed");
        return res.status(401).json({status:"invalid serial number"})
    }else{
        const serialNumber = getSerial.split("-")[0].toUpperCase();
        const service = decodeURI(getSerial.split("-")[1]);
        const orderID = "#"+Math.floor(Math.random()*90000) + 10000;

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
                var price = ms_pricing.setPrice(data.object.model);
                var cookie = signCheckoutCookie(service, serialNumber, price, data.object.model, orderID);

                res.cookie("checkout", cookie, {
                    expires: new Date(Date.now() + 60 * 60 * 1000),
                    httpOnly: true
                })

                return res.status(200).json({status:"success"});
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

            if(decoded.Service == "MEID/GSM Bypass With Signal"){
                const iremovalCheck = await fetch(`https://s13.iremovalpro.com/API/tedcheck.php?SerialNumber=${decoded.SerialNumber}&apiKey=${envData.iRemovalProAPI}`, {
                    method:"GET"
                })
                .then(res => res.text())
                .then(data => {
                    var x = "";
                    switch(data){
                        case "Device not checked yet":
                            x = "Not checked with iRemoval";
                        break;

                        case "Device not supported":
                            x = "Device Not Supported";
                        break;

                        case "Device already registered":
                            x = "Device Already Registered";
                        break;

                        case "Device supported":
                            x = "Device SUPPORTED";
                        break;

                        default:
                            x = "Check Failed";
                        break;
                    }
                    return x;
                })
                .catch(e => {
                    return e;
                });

                req.iremoval = iremovalCheck;

                token = jwt.sign({
                    Service:decoded.Service,
                    SerialNumber:decoded.SerialNumber,
                    Price:decoded.Price,
                    Model:decoded.Model,
                    Type:decoded.Type,
                    iremoval: iremovalCheck
                }, 
                envData.jwtKey,
                {
                    expiresIn:"1h"
                });

                res.cookie("checkout", token, {
                    expires:new Date(Date.now() + 60 * 60 * 1000),
                    httpOnly:true
                });
            }
            next();
        }catch{
            next();
        }
    }else{
        next();
    }
}

const VerifyPromo = (req, res) => { 
    const promo = req.originalUrl.replace("/verification/promo/", "");

    if(promo == ""){
        return res.status(401).json({status:"Invalid Promo Code"})
    }else{
        //Check promo code in promo database

    }

}

const ModifyCookieAddSoldBy = async (req,res) => {
    if(req.cookies.checkout){
        //console.log(req.body);
        if(req.body.soldby){
            try{
                const decoded = await promisify(jwt.verify)(req.cookies.checkout, envData.jwtKey);
    
                token = jwt.sign({
                    Service:decoded.Service,
                    SerialNumber:decoded.SerialNumber,
                    Price:decoded.Price,
                    Model:decoded.Model,
                    Type:decoded.Type,
                    SoldBy:req.body.soldby
                }, 
                envData.jwtKey,
                {
                    expiresIn:"1h"
                });
    
                res.cookie("checkout", token, {
                    expires:new Date(Date.now() + 60 * 60 * 1000),
                    httpOnly:true
                });
                
                return res.status(200).json({msg:"success"});
            }catch{
                return res.status(400).json({msg:"Internal server error"});
            }
        }else{
            return res.status(400).json({msg:"Mo valid soldby"});
        }
    }else{
        return res.status(400).json({msg:"No valid cookie"});
    }
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

module.exports = {VerifySerial, VerifyCheckout, VerifyPromo, ModifyCookieAddSoldBy}