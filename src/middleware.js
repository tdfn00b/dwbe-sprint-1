const {logList} = require('../models/logList')
let {userList, productList, orderList, paymentMethodList} = require('../models/init');

//Needs the ID of the USER to verify if it's logged in. (logList)
const isLoggedIn = (req,res,next) => {
    //Is there someone logged in ? If not you need to be logged in.
    if (logList[0] == undefined) {
        return res.status(403).json({"respuesta":"Debes iniciar sesión."})
    }

    //Parsing the index from the QUERY of the request.
    let index = parseInt(req.query.id);
    let user = userList[index]

    //Does the user exist? Is it the one logged in?
    if (!user || user.deleted || logList[0].userID != user.userID){
        return res.status(400).json({"respuesta":"Acceso denegado"})
    }

    //Add the user Object and the user Index to the html request.
    req.user = userList[index];
    req.user_index = index;
    
    //Continue the execution.
    next();
}

const hasPrivileges = (req,res,next) => {
    //TODO: probar condicional ternario
    if (req.user.isAdmin() === false){
        return res.status(401).json({"respuesta":"No tienes permisos."})
    } 
    if (req.user.isAdmin() === true){
        next();
    }
    
}

const orderStatus = (req,res,next) => {
    //Request the index of the order in the orders database.
    let orderNumber = req.params.order_number;
    let index = orderList.findIndex(order => order.orderNumber == orderNumber);

    //Check if the order exists.
    if (index == -1 || orderList[index].deleted){
        return res.status(400).json({"respuesta": `El pedido no existe`})
    }
    
    //If it exists, add the order Object, order index and order status to the request.
    req.order = orderList[index]
    req.order_index = index
    req.status = orderList[index].status;
    next();
}

const productExist = (req,res,next) => {
    let productNumber
    
    if (req.body.productNumber != undefined){
        productNumber = req.body.productNumber;
    } else if (req.params.product_number != undefined) {
        productNumber = req.params.product_number
    }
    
    let index = productList.findIndex(product => product.getProductNumber() == productNumber)

    if (index == -1 || productList[index].deleted) {
        return res.status(400).json({"respuesta":"El producto no existe"})
    }

    if (req.body.productNumber != undefined){
        if (productList[index].getStock() == false){
            return res.status(400).json({"respuesta":"El producto no tiene stock"})
    }
    }
    req.product = productList[index]
    req.product_index = index
    req.productNumber = productList[index].getProductNumber()
    next();
}

const productInOrder = (req,res,next) => {
    let product_name = req.product.name
    let index = orderList[req.order_index].orderProducts.findIndex(product => product.name == product_name)
    
    if (index == -1){
        return res.status(400).json({"respuesta":"El producto no se encuentra en la orden"})
    }

    req.product_index_in_order = index
    next();
}
/*
const paymentExist = (req,res,next) => {  
    let index = paymentMethodList.findIndex(payment => payment.code == req.body.code)

    if (index == -1 || paymentMethodList[index].deleted) {
        return res.status(400).json({"respuesta":"El método de pago no existe"})
    }
    req.payment = productList[index]
    req.payment_index = index
    next();
}
*/
module.exports = {isLoggedIn, orderStatus, hasPrivileges, productExist, productInOrder};