const {userList} = require('../models/User')
const {productList} = require('../models/Product')
const {orderList} = require('../models/Order')
const {logList} = require('../models/logList')


//Needs the ID of the USER to verify if it's logged in. (logList)
const isLoggedIn = (req,res,next) => {
    let user_id = req.params.user_id;

    //Is there someone logged in ? If not you need to be logged in.
    if (logList[0] == undefined) {
        return res.status(403).json({"respuesta":'Por favor, inicia sesión'})
    }
    //Search in the Database for the user Object by ID
    //IF there is an user logged it must be in the database, therefore it should NEVER return -1
    index = userList.findIndex(user => user.username == user_id);

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
    //To do certain actions you need a certain privilege level.
    //So we capture the privilege of the current logged in user.
    let privileges = userList[req.user_index].getPrivileges()
    req.user_privileges = privileges;

    //#################################################################################################
    //TODO: How do we check what privileges are required? We can do it with a boolean to check for an admin
    //in the user current logged in. If so, we have to setup the requirement of every request in 
    //I suppose each request... is it worth it?
    let privileges_required = req.body.privileges //??????

    //Maybe we can do another middleware to check what level it need to do the request with a very
    //well used MATCH, may
    //#################################################################################################
    //And we check if the privileges matches with the privileges requred to do the request.
    if (privileges_required > privileges){
        return res.status(401).json({"respuesta" : "No tiene los privilegios necesarios para realizar esta petición"})
    }

    next();
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