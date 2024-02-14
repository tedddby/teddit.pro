function verify(serviceName, serialId, loaderId, formId, cardId){
    ////////////////////////////////////////////////
    var sn = document.getElementById(serialId).value;
    var loader = document.getElementById(loaderId);
    var form = document.getElementById(formId);
    var card = document.getElementById(cardId);
    ////////////////////////////////////////////////

    ////////////////////Actions//////////////////////
    hideForm(formId);
    showLoader(loader);

    fetch("./verification/serial/"+sn+"-"+serviceName, {method:"post"})
        .then(res => res.json())
        .then(data => {
            if(data.status == "success"){
                updateCardSuccess(card, loader);
            }else{
                updateCardFail(card, formId, loader);
            }
        })

    ////////////////////////////////////////////////
    
}

function showLoader(loader){
    loader.style.display = "block";
    return;
}

function hideLoader(loader){
    loader.style.display = "none";
    return;
}

function showForm(formid){
    document.getElementById(formid).style.display = "block";
    return;
}

function hideForm(formid){
    document.getElementById(formid).style.display = "none";
    return;
}

function updateCardSuccess(card, loader){
    setTimeout(function () {
        hideLoader(loader);
        card.innerHTML+=`<br><p style="text-align: center; line-height: 100px;" class="agreement-text">Redirecting to checkout...</p>`;
    setTimeout(() => {
        window.location.assign("/checkout");
    }, 2000);
    }, 2000);
    return;
}

function updateCardFail(card, formid, loader){
    setTimeout(function () {
        hideLoader(loader);
        card.innerHTML+=`<p style="text-align: center; line-height: 100px;" class="agreement-text" id="failed">Invalid serial number...</p>`;
    setTimeout(function () {
        document.getElementById("failed").remove();
        showForm(formid);
    }, 2000);
    }, 2000);
    return;
}