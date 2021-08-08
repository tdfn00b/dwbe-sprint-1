const {userList} = require('../models/User')
const {productList} = require('../models/Product')
const {orderList} = require('../models/Order')
const {logList} = require('../models/logList')


//Needs the ID of the USER to verify if it's logged in. (logList)
const isLoggedIn = (req,res,next) => {
    //Is there someone logged in ? If not you need to be logged in.
    if (logList[0] == undefined) {
        return res.status(403).json({"respuesta":"Debes iniciar sesión."})
    }
    
    /*  
    //#### Search in the Database for the user Object by ID #### 
    //       |
    //       v
    //We are not doing this, assuming that the request already knows the ID of the user.

    
  
    //IF there is an user logged it must be in the database, therefore it should NEVER return -1
    index = userList.findIndex(user => user.username == user_id);
    */

    //Parsing the index from the QUERY of the request.
    index = parseInt(req.query.id);
    user = userList[index]

    //Does the user exist? Is it the one logged in?
    if (!user || user.deleted || logList[0].email != user.email){
        return res.status(400).json({"respuesta":"Acceso denegado"})
    }

    //Add the user Object and the user Index to the html request.
    req.user = userList[index];
    req.user_index = index;
    
    //Continue the execution.
    next();
}

/*
const isOwner = (req,res,next) => {
    if (logList[0].username != userList[req.user_index].username){
        return res.send('No tiene autorización para ver esta página')
    } 

    next()
}
*/
const hasPrivileges = (req,res,next) => {
    //TODO: usar ternario
    if (req.user.isAdmin() == false){
        return res.status(401).json({"respuesta":"No tienes permisos."})
    } 
    if (req.user.isAdmin() == true){
        next();
    }
    
}

const orderStatus = (req,res,next) => {
    //Request the index of the order in the orders database.
    let orderNumber = req.params.order_number;
    index = orderList.findIndex(order => order.orderNumber == orderNumber);

    //Check if the order exists.
    if (index == -1){
        return res.status(400).json({"respuesta": `El pedido no es válido`})
    }
    
    //If it exists, add the order Object, order index and order status to the request.
    req.order = orderList[index]
    req.order_index = index
    req.status = orderList[index].status;
    next();
}

module.exports = {isLoggedIn, orderStatus, hasPrivileges};