function ApplyPromo(promoid, applyid, statText, price, apply_txt){
    var promoCode = document.getElementById(promoid).value;
    var promoButton = document.getElementById(applyid);
    var statText = document.getElementById(statText);
    var price = document.getElementById(price);
    var apply_txt = document.getElementById(apply_txt);

    if(promoCode.length == 0){
        javascript:void(0);
    }else{
        fetch("./verification/promo/"+promoCode, {method:"post"})
        .then(res => res.json())
        .then(data => {
            if(data.status == "success"){
                apply_txt.innerHTML = "Applied!";
                apply_txt.style="color:green;";
                apply_txt.onclick='javascript:void(0);';
                promoButton.onclick='javascript:void(0);';
                document.getElementById(promoid).disabled=true;
                price.innerHTML = `<strong>Total Price</strong>: ${data.price} USD [PROMO APPLIED]`
            }else{
                statText.innerHTML=data.msg;
                statText.style = 'color:red;display:block';
                setTimeout(function(){
                    statText.style="display:none;";
                    statText.innerHTML = "";
                }, 3000);
            }
        })
    }
}

function redirectToStripe(checkbox){

    if(document.getElementById(checkbox).checked == false){
        javascript:void(0);
        return;
    }else{
        var stripe = Stripe("pk_live_51JS5eFDJCYp3oML13Lkal4728vX0IVmjnsDoZNwdoDW1XWrCqkKiQazKLUR8pVNv58KIczOFomBUUtfhHopixu0c00blNmprAq");
        fetch("../stripe/session", {method:"post"})
        .then(res => res.json())
        .then(data => {
            if(data.failed){
                alert("Security Token Missing From Your Request!");
                return false;
            }else{
                if(data.id){
                    return stripe.redirectToCheckout({ sessionId: data.id });
                }else{
                    return false;
                }
            }
        })
        .then(result => {
            if(result.error){
                return alert(result.error.message);
            }
        })
        .catch(err => {
            return alert("Server Error "+err);
        })
    }
}