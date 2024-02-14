const express = require("express");
const router = express.Router();
const controller = require("../controllers/verification");
const StripeController = require("../controllers/payments");
const bodyParser = require("body-parser");
const { response } = require("express");


router.get("/", (req, res) => {
    res.render("index.hbs");
});

router.get("/index", (req, res) => {
    res.render("index.hbs");
});

router.get("/privacy", (req, res) => {
    res.render("privacy.hbs");
});

router.get("/terms-of-service", (req, res) => {
    res.render("tos.hbs");
});

router.get("/refund-policy", (req, res) => {
    res.render("refund.hbs");
});



router.get("/*/callback", (req, res) => {

    const serial = req.originalUrl.replace("/callback", "").replace("/", "");
    if(serial.length != 12){
        return res.render("404", {path:req.originalUrl})
    }else{
        return res.render("index", {serial:serial})
    }
});

router.post("/verification/serial/*", controller.VerifySerial);
router.post("/verification/promo/*", controller.VerifyPromo);
router.post("/fmi/modify/cookie/soldby", controller.ModifyCookieAddSoldBy);

router.get("/checkout", controller.VerifyCheckout, (req, res) => {
    if(req.serial && req.service && req.price){
        var obj;
        if(req.service == "FMI OFF"){
            obj = {
                serial:req.serial,
                service:req.service,
                price:req.price,
                model:req.model,
                type:req.type
            }
            return res.render("fmi", obj);
        }else{
            if(req.iremoval){
                obj = {
                    serial:req.serial,
                    service:req.service,
                    price:req.price,
                    model:req.model,
                    type:req.type,
                    iremoval:req.iremoval
                }
            }else{
                obj = {
                    serial:req.serial,
                    service:req.service,
                    price:req.price,
                    model:req.model,
                    orderID:req.orderID,
                    type:req.type
                }
            }
            return res.render("checkout", obj);
        }
    }else{
        return res.redirect("/");
    }
});

router.post("/stripe/session", StripeController.GenerateSession);

router.get("/success", StripeController.PaymentSuccess, (req, res) => {
    if(req.serial && req.service){
        res.render("success", {
            serial:req.serial,
            service:req.service
        })
    }else{
        return res.redirect("/");
    }
});


router.get("/tedddbyActivator.rar", (req, res) => {
    return res.download("./tedddbyActivatorV5.3.zip")
});





module.exports = router;