//Importación de configuración para inciar el servidor
const config = require('../config')

//Importación de módulos
const express = require('express');
const morgan = require('morgan');
/*
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express')
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Sprint Project 01',
            version: '1.0.1'
        }
    },
    apis: ['./app.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
*/

// Importación de clases, middlewares y listas.
const {User} = require('../models/User')
const {Product} = require('../models/Product')
const {Order} = require('../models/Order')
let {isLoggedIn, orderStatus, hasPrivileges, productExist, productInOrder} = require('./middleware');

//Importo de init.js porque necesito los datos agregados en la listas
let {userList, productList, orderList} = require('../models/init');

//Lista de usuarios logeados. 
let {logList} = require('../models/logList')

// Inicialización de Express, Morgan y Swagger
const app = express();
app.use(express.json());
app.use(morgan('dev')); 
//app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Creación de ENDPOINTS

//Lista de Usuarios
app.get('/users', (req, res) => {
    //Solo para el desarrollo
    res.json(userList);
});

//Lista de Productos
app.get('/products', (req, res) => {
    //Solo para el desarrollo
    res.json(productList);
});

//Lista de logueados (tiene que ser solo 1)
app.get('/login', (req, res) => {
    //Solo para el desarrollo
    res.json(logList);
});

/*
//Lista de Ordenes
app.get('/orders', isLoggedIn, hasPrivileges,(req, res) => {
    res.json(orderList);
});
*/

//Registro de usuario
app.post('/users/register', (req, res) => {
    //Parse information from the request.
    const {username, pass, full_name, phone_number, email, address} = req.body;

    //Check if the email or used is already in the user list.
    if (userList.find(user => user.email == email || user.username == username)) {
        return res.status(401).json({"respuesta" : "El nombre de usuario o email ya está registrado."});
    };

    //Create a new Object User
    newUser = new User(username,pass,full_name,phone_number,email,address);

    //Push the new Object User to the registered user list.
    userList.push(newUser);
    res.json({"respuesta": `El usuario ${newUser.username} ha sido creado exitosamente`});
});

//Inicio de sesión
app.post('/users/login',(req, res) => {
    //Parse information from the request.
    const {userLog, passLog} = req.body;

    //Check if there is an user logged in.
    if (logList[0]){
        return res.status(401).json({"respuesta":`Cierra la sesión actual para continuar.`})
    }

    //Find a match for the user email or username in the registered users list.
    userID = userList.findIndex(user => (user.email == userLog || user.username == userLog));
    user = userList[userID];

    //If the user exists, check if the password is correct, and add the user to the logged user lists.
    if(user && user.pass == passLog){
        logList.push(user);
        return res.json({"respuesta" : `Has iniciado sesión.`, "ID" : `${userID}`});
    } else {
        return res.status(400).json({"respuesta" : "El nombre de usuario o contraseña son incorrectos."})
    }
});

//Cerrado de sesión
app.post('/users/logout', (req,res) =>{
    //Check if there is an user logged in.
    if (!logList[0]){
        return res.status(400).json({"respuesta": 'Tienes que iniciar sesión.'})
    }
    //If there is an user logged in, remove the user from the list.
    username = logList[0].username
    logList.pop()
    res.json({"respuesta":`El usuario ${username} ha cerrado la sesión.`})
})

//Realizar pedido
app.post('/orders/', isLoggedIn,(req,res) => {
    //Check if the user has a pending order, if it does, don't allow to open a new one.
    order = orderList.find(order => order.user.username == req.user.username)
    if (order && !order.deleted) {
        if (order.status == 1) { 
            return res.json({"respuesta":"Tiene otro pedido pendiente."})
        }
    }

    //Parse information from the request.
    const {paymenthMethod} = req.body

    //Create a new Object Order with the user and it's address and add it to the orders list.
    newOrder = new Order(req.user, paymenthMethod, req.user.address)
    orderList.push(newOrder);

    //Get the ID of the new Order to get a reference.
    orderNumber = newOrder.getOrderNumber();

    res.json({"respuesta":`El usuario ${req.user.username} ha comenzado un pedido.`,"ID":`${orderNumber}`})
});

//Agregar un producto a un pedido no confirmado
app.post('/orders/:order_number', isLoggedIn, orderStatus, productExist, (req,res) => {
    //1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado

    //Checks the current status of the order
    if (req.status == 100) {
        return res.json({"respuesta":'Su pedido fue rechazado.'})
    }

    if (req.status >= 2) {
        return res.json({"respuesta":'No puede modificar el pedido.'}) 
    }

    //Add the product to the order.
    orderList[req.order_index].addProduct(req.product)
    res.json({"respuesta":`El producto ${req.product.name} fue agregado`})
});

//Remover un producto del pedido.
app.put('/orders/:order_number',isLoggedIn, orderStatus, productExist, productInOrder, (req,res) => {
    if (req.status == 100) {
        return res.send('Su pedido fue rechazado.')
    }

    if (req.status >= 2) {
        return res.send('No puede modificar el pedido.')    
    }

    orderList[req.order_index].removeProduct(req.product_index_in_order);
    res.json({"respuesta":`El producto ${req.product.name} fue removido`})
});


//Cancelar como usuario un pedido
app.delete('/orders/:order_number',isLoggedIn, orderStatus, (req,res) => {
    //If the status of the order is already sended or more
    //it's not possible to cancel the order as an User.    
    //order status: 1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado
    if (req.status > 3) {
        return res.status(400).json({"respuesta":`No es posible cancelar el pedido número ${req.order.orderNumber}. El pedido se encuentra ${req.status}`, "posibles estados":"1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado"})
    };
    
    orderList[req.order_index].deleted = true;
    res.json({"respuesta":'Su pedido fue cancelado.'});
});

//Cambiar estado de pedido
app.patch('/orders/:order_number',isLoggedIn, orderStatus,(req,res) => {
    const {newStatus} = req.body;
    oldStatus = req.order.getStatus();
    if (req.order.status != newStatus){
        if (user.isAdmin() || newStatus == 2) {
            orderList[req.order_index].setStatus(newStatus);
            return res.json({"respuesta" : `El estado del pedido número ${req.order.orderNumber} fue cambiado de ${oldStatus} a ${orderList[req.order_index].getStatus()}`});
        } else {
            return res.status(403).json({"respuesta":"El usuario no tiene permisos para realizar esta acción"})
        } 
    } else {
        return res.status(400).json({"respuesta":"El estado actual y el estado propuesto son iguales"})
    }
    
});

//Ver historial de pedidos del usuario logueado
app.get('/orders', isLoggedIn, (req, res) => {
    userOrderList = [];
    
    //Check in the orders list if the user has any order in any status
    ordersFromUser = orderList.forEach((order) => {
        if (order.getUserId() == req.user.userID && !order.deleted) {
            userOrderList.push(order)
        }});

    //Check if the orders of the current user is empty
    if (userOrderList.length == 0){
        return res.status(444).json({"respuesta" : `No hay pedidos para mostrar.`})
    }

    res.json(userOrderList)
});

//Ver una orden como usuario
app.get('/orders/:order_number', isLoggedIn, orderStatus,(req,res)=>{
    if (req.user.userID != req.order.user.userID){
        return res.status(444).json({"respuesta": `No puede ver este pedido`})
    }

    res.json(orderList[req.order_index])
});

//Crear nuevo producto
app.post('/products',isLoggedIn, hasPrivileges, (req,res) => {
    const {name, desc, price, stock} = req.body
    //Check if the email or used is already in the user list.
    if (productList.find(product => product.name == name)) {
        return res.status(401).json({"respuesta" : "Un producto con ese nombre ya existe."});
    };

    //Create a new Object product
    newProduct = new Product(name, desc, price, stock);

    //Push the new Object product to the registered product list.
    productList.push(newProduct);
    res.json({"respuesta": `El producto ${newProduct.name} ha sido creado exitosamente.`});
});

//Modificar producto
app.put('/products/:product_number',isLoggedIn, hasPrivileges, productExist, (req,res) => {
    const {name, desc, price, stock} = req.body  
    let modificaciones = ""
    if(name != undefined){
        let is_name_repeated = productList.find(product => product.name == name)
        if(is_name_repeated != undefined){
            return res.status(444).json({"respuesta":`El nombre ${name} ya está siendo usado`});
        }
        productList[req.product_index].setName(name) 
        modificaciones += " nombre"
    }
    if (desc != undefined){
        productList[req.product_index].setDesc(desc) 
        modificaciones += " descripción"
    }

    if (price != undefined){
        productList[req.product_index].setPrice(price)
        modificaciones +=  "precio"
    }
    if (stock != undefined){
        productList[req.product_index].setStock(stock) 
        modificaciones += " stock"
    }

    res.json({"respuesta":`El producto ${req.product.name} ha actualizado su:${modificaciones}`})

});

//Eliminar producto
app.delete('/products/:product_number',isLoggedIn, hasPrivileges, productExist, (req,res) => {
    productList[req.product_index].deleteProduct()
    res.json({"respuesta":`El producto ${req.product.name} fue eliminado.`})
});

//Cambiar nombre de un producto, solo como administrador
app.patch('',isLoggedIn , hasPrivileges, (req,res) => {

});

//Cambiar el precio de un producto,  solo como administrador
app.patch('',isLoggedIn, hasPrivileges, (req,res) => {

});


//Crear nuevos medios de pagos
app.post('/payments',isLoggedIn, hasPrivileges, (req,res) => {

});

//Editar medios de pago
app.put('/payments/:payments_id',isLoggedIn, hasPrivileges, (req,res) => {

});
//Borrar medios de pago
app.delete('/payments/:payments_id',isLoggedIn, hasPrivileges, (req,res) => {

});
//Ver todos los medios de pago
app.get('/payments',isLoggedIn, hasPrivileges, (req,res) => {

});

//Ver pedido de un usuario como admin
app.get('user/:user_id/orders/:order_number',isLoggedIn, hasPrivileges, orderStatus, (req,res) => {
    res.json(orderList[req.order_index])
});

//Inicio server
app.listen(config.port, function () {
    console.log(`Servidor iniciado. Escuchando el puerto ${config.port}!`);
});

//TODO investigar como usar router para tener este archivo más organizado
//Investigar ERROR / ERR