const env = require("dotenv");
env.config({path:"./sec.env"});
const envData = process.env;

//const stripe = require("stripe")(envData.stripeKey);
const jwt = require("jsonwebtoken");
const WebhookSecret = "whsec_u9ebgprB8MMjCp3KTPoutL0MzWdS5a6x";
const request = require("request");

const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));


const GenerateSession = async (req, res) => {
    if(req.cookies.checkout){
        try{
            const decoded = await promisify(jwt.verify)(req.cookies.checkout, envData.jwtKey);

            var stripe;

            if(decoded.Service == "MEID/GSM Bypass With Signal"){
                stripe = require("stripe")(envData.stripeKeyBingon);
            }else{
                stripe = require("stripe")(envData.stripeKey);
            }

            var accessToken;

            if(decoded.SoldBy){
                accessToken = jwt.sign({
                    Service:decoded.Service,
                    SerialNumber:decoded.SerialNumber,
                    Price:decoded.Price,
                    Model:decoded.Model,
                    SoldBy:decoded.SoldBy
                }, envData.jwtKey, {expiresIn: 30 * 60 * 1000});
            }else{
                accessToken = jwt.sign({
                    Service:decoded.Service,
                    SerialNumber:decoded.SerialNumber,
                    Price:decoded.Price,
                    Model:decoded.Model
                }, envData.jwtKey, {expiresIn: 30 * 60 * 1000});
            }


            if(decoded.Price){
            const options = {
                    payment_method_types: ["card"],
                    line_items: [
                        {
                            price_data: {
                                currency: "usd",
                                product_data: {
                                    name: "Activation",
                                    description:decoded.Service.split(" ")[0]+"#"+decoded.SerialNumber
                                },
                                unit_amount: decoded.Price * 100,
                            },
                            quantity: 1,
                        },
                    ],
                    mode: "payment",
                    success_url: `https://tedddby.com/success?hex=${accessToken}`,
                    cancel_url: `https://tedddby.com/checkout/?cancelled`,
                }

                const session = await stripe.checkout.sessions.create(options);
                return res.status(200).json({
                    id:session.id
                });
            }else{
                return res.status(500).json({
                    failed:true
                });
            }

        }catch(e){
            console.log(e)
            return res.status(401).json({
                failed:true
            });
        }
    }else{
        return res.status(401).json({
            failed:true
        });
    }
}

const PaymentSuccess = async (req, res, next) => {
    if(req.cookies.checkout){
        try{
            const decoded = await promisify(jwt.verify)(req.cookies.checkout, envData.jwtKey);
            req.serial = decoded.SerialNumber;
            req.service = decoded.Service;

            res.cookie("checkout", "completed", {
                expires:new Date(Date.now() + 2 * 1000),
                httpOnly:true
            })
            next();
        }catch(e){
            next();
        }
    }else{
        next();
    }
}


module.exports = {GenerateSession, PaymentSuccess}