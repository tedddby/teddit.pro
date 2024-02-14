const setPrice = (modelVersion) => {

    var price = 0;

    if(modelVersion.includes("iPhone 5S") || modelVersion == "iPhone 5S"){
        price = 22;
      }else{
        if(modelVersion.includes("iPhone 6 ") || modelVersion == "iPhone 6"){
          price = 27;
        }else{
          if(modelVersion.includes("iPhone 6 Plus") || modelVersion == "iPhone 6 Plus"){
            price = 27;
          }else{
            if(modelVersion.includes("iPhone 6S") || modelVersion == "iPhone 6S"){
              price = 32;
            }else{
              if(modelVersion.includes("iPhone 6S Plus") || modelVersion == "iPhone 6S Plus"){
                price = 32;
              }else{
                if(modelVersion.includes("iPhone 7") || modelVersion == "iPhone 7"){
                  price = 42;
                }else{
                  if(modelVersion.includes("iPhone 7 Plus") || modelVersion == "iPhone 7 Plus"){
                    price = 42;
                  }else{
                    if(modelVersion.includes("iPhone 8") || modelVersion == "iPhone 8"){
                      price = 52;
                    }else{
                      if(modelVersion.includes("iPhone 8 Plus") || modelVersion == "iPhone 8 Plus"){
                        price = 52;
                      }else{
                        if(modelVersion.includes("iPhone X") || modelVersion == "iPhone X"){
                          price = 62;
                        }else{
                            if(modelVersion.includes("iPhone 11") || modelVersion == "iPhone 11"){
                                price = 62;
                            }else{
                                if(modelVersion.includes("iPhone 12") || modelVersion == "iPhone 12"){
                                    price = 62;
                                }else{
                                    if(modelVersion.includes("iPhone 13") || modelVersion == "iPhone 13"){
                                        price = 62;
                                    }else{
                                        if(modelVersion.includes("iPhone 14") || modelVersion == "iPhone 14"){
                                            price = 62;
                                        }else{
                                            if(modelVersion.includes("iPad")){
                                                price = 62;
                                            }else{
                                                if(modelVersion.includes("iMac")){
                                                    price = 62;
                                                }else{
                                                    if(modelVersion.includes("iWatch")){
                                                        price = 62;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

    return price;
}

module.exports = { setPrice }