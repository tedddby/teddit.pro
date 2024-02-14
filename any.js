request.post(url, {
    form:{
        key:envData.iFreeKey,
        service:0,
        imei:serial.split("-")[1]
    }
},
(error, response, data) => {
    if(error){
        return res.status(500).json({status:"server error"});
    }else{
        if(response.statusCode === 200){
            var parsed = JSON.parse(data);
            var finalRes;
            var type;
            var token;

            if(parsed.success == true){
                var model = parsed.object.model;
                if(model.includes("iPhone 5") || model.includes("iPhone 6") || model.includes("iPhone 11") || model.includes("iPhone 12")){
                    type = "MEID";
                }else{
                    type = "GSM";
                }

                finalRes = {
                    serial:parsed.object.serial,
                    model:parsed.object.model,
                    type:type,
                    status:"success"
                }

                token = jwt.sign({
                    Service:jwtService,
                    SerialNumber:serial.split("-")[1],
                    Price:price,
                    Model:parsed.object.model,
                    Type:type
                }, 
                envData.jwtKey,
                {
                    expiresIn:"1h"
                });

            }else{
                finalRes = {status:"failed"}
                token = null
            }
            if(token != null){
                res.cookie("checkout", token, {
                 expires: new Date(Date.now() + 60 * 60 * 1000),
                 httpOnly: true
                })
            }
            return res.status(200).json(finalRes);
        }else{
            return res.status(403).send("Contact site Admin");
        }
    }
})



/////////////////////////////////////////////////////



token = jwt.sign({
    Service:jwtService,
    SerialNumber:serial.split("-")[1],
    Price:fmi_pricing.setPrice(obj.object.model),
    Model:obj.object.model,
    Type:"FMI OFF"
    }, 
    envData.jwtKey,
    {
        expiresIn:"1h"
    });



///////////////////////////////


res.cookie("checkout", token, {
    expires:new Date(Date.now() + 60 * 60 * 1000),
    httpOnly:true
});

return res.status(200).json(finalResp);