function ApplyPromo(promoid, applyid){
    var promoCode = document.getElementById(promoid).value;
    var promoButton = document.getElementById(applyid);
    if(promoCode.length == 0){
        alert(promoCode)
        javascript:void(0);
    }else{
        promoButton.style.display = 'none';
    }
}