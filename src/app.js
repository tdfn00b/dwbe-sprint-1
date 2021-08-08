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
let {isLoggedIn, orderStatus, hasPrivileges} = require('./middleware');

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

//Lista de Ordenes
app.get('/orders/:user_id', isLoggedIn,(req, res) => {
    if(!req.user.isAdmin()){
        return res.status(401).json({"respuesta":'No puedes ver esta página'})
    } else {
    res.json(orderList);}
});


//Registro de usuario
app.post('/users/register', (req, res) => {
    //Parse information from the request.
    const {username, pass, full_name, phone_number, email, address} = req.body;

    //Check if the email or used is already in the database.
    if (userList.find(user => user.email == email || user.username == username)) {
        return res.status(403).json({"respuesta" : "El nombre de usuario o email ya está registrado."});
    };

    //Create a new Object User
    newUser = new User(username,pass,full_name,phone_number,email,address);

    //Push the new Object User to the registered user list.
    userList.push(newUser);
    res.json({"respuesta": `El usuario ${newUser.username} ha sido creado existosamente`});
});

//Inicio de sesión
app.post('/users/login',(req, res) => {
    //Parse information from the request.
    const {userLog, passLog} = req.body;

    //Check if there is an user logged in.
    if (logList[0]){
        return res.status(403).json({"respuesta":`Cierra la sesión actual para continuar.`})
    }

    //Find a match for the user email or username in the registered users database
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
    if (order) {
        if (order.status == 1) { 
            return res.send('Tiene otro pedido pendiente.')
        }
    }

    //Parse information from the request.
    const {paymenthMethod} = req.body

    //Create a new Object Order with the user and it's address and add it to the orders database.
    newOrder = new Order(req.user, paymenthMethod, req.user.address)
    orderList.push(newOrder);
    res.send(`El usuario ${req.user.username} ha comenzado un pedido.`)
});

//Agregar un producto a un pedido no confirmado
app.post('/orders/:order_number', isLoggedIn, orderStatus,(req,res) => {
    //1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado

    //Checks the current status of the order
    if (req.status == 100) {
        return res.send('Su pedido fue rechazado.')
    }

    if (req.status >= 2) {
        return res.send('No puede modificar el pedido.')    
    }

    //Parse information from the request.
    const {product, qty} = req.body;

    //Add the product to the order.
    orderList[req.order_index].addProduct(product, qty)
    res.send(`Producto agregado`)
});

//Cancelar pedido
app.delete('orders/:order_number',isLoggedIn, orderStatus, (req,res) => {
    //If the status of the order is already sended or more
    //it's not possible to cancel the order as an User.
    //privileges: 1 - usuario, 2 - manager, 3 - admin
    if (req.user.getPrivileges() > 1){
        //order status: 1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado
        if (res.status >= 4) {
            return res.send(`No es posible cancelar el pedido número ${res.order.orderNumber}.`)
        } 
    }

    orderList[req.order_index].deleted = 1
    res.send('Su pedido fue cancelado.')
});

//Ver historial de pedidos completados.
app.get('/orders',isLoggedIn, (req, res) => {
    //Parse information from request
    let ordersFromUser = orderList.getOrdersByStatus(req.user)

    //Check if the orders of the current user is empty
    if (ordersFromUser.length == 0){
        return res.send(`No hay ordenes para mostrar.`)
    }

    res.send(ordersFromUser)
});

//Confirmar pedido 
app.put('/orders/:order_number',isLoggedIn, orderStatus,(req,res) => {
    const {newStatus} = req.body;
    orderList[req.order_index].setStatus(req.user, newStatus);
    res.send('Su pedido fue confirmado');
});

//Cambiar cantidad de un producto seleccionado... IMPORTANTE
app.patch('/orders/:order_number/:product_id',isLoggedIn, orderStatus, (req,res) => {
    let productNumber = req.params.product_id;
    productIndex = ""
    orderList[req.order_index].orderProducts[productIndex];

});

//Cambiar nombre de un producto, solo como administrador
app.patch('',isLoggedIn, (req,res) => {

});

//Cambiar el precio de un producto,  solo como administrador
app.patch('',isLoggedIn, (req,res) => {

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

//Ver pedido
app.get('/orders/:order_number',isLoggedIn, orderStatus, (req,res) => {
    res.json(orderList[req.order_index])
});

//Inicio server
app.listen(config.port, function () {
    console.log(`Servidor iniciado. Escuchando el puerto ${config.port}!`);
});

//TODO investigar como usar router para tener este archivo más organizado
//Investigar ERROR / ERR
//No es correcto que los endpoints usen varibles del usuario en la URL
//Aunque no pensaba en que el ENDPOINT se veía en el URL.
//TODO buscar como buscar esto ja

//Investigar los VERBOS y lo que hacen