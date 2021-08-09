//Importación de configuración para inciar el servidor
const config = require('../config')

//Importación de módulos
const express = require('express');
const morgan = require('morgan');
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


// Importación de clases, middlewares y listas.
const {User} = require('../models/User')
const {Product} = require('../models/Product')
const {Order} = require('../models/Order')
const {PaymentMethod} = require('../models/PaymentMethod')
let {isLoggedIn, orderStatus, hasPrivileges, productExist, productInOrder} = require('./middleware');

//Importo de init.js porque necesito los datos agregados en la listas
let {userList, productList, orderList, paymentMethodList} = require('../models/init');

//Lista de usuarios logeados. 
let {logList} = require('../models/logList')

// Inicialización de Express, Morgan y Swagger
const app = express();
app.use(express.json());
app.use(morgan('dev')); 
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Creación de ENDPOINTS
app.get('/',(req,res) =>{
    res.json({"respuesta":"Sprint Project 01 - v1.0.1"})
})

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

/**
 * @swagger
 * /users/register:
 *  post:
 *    summary: Registro de Usuarios.
 *    description : Registro de usuarios.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: usuario
 *        description: usuario  a crear
 *        schema:
 *          type: object
 *          required:
 *            - username
 *            - pass
 *            - full_name
 *            - phone_number
 *            - email
 *            - telefono
 *          properties:
 *            username:
 *              description: Nombre del usuario
 *              type: string
 *              example: armando
 *            pass:
 *              description: Contraseña
 *              type: password
 *              example: pokemones
 *            full_name:
 *              description: Nombre completo del usuario 
 *              type: string
 *              example: Armando Esteban Quito
 *            phone_number:
 *              description: Número de teléfono
 *              type: string
 *              example: +5492964685742
 *            email:
 *              description: Dirección de correo
 *              type: email
 *              example: armandoestebanquito@gmail.com
 *            address:
 *              description: Dirección de envío
 *              type: string
 *              example: Bancos Armados 112
 *    responses:
 *      201:
 *       description: Usuario registrado
 *      401:
 *       description: El nombre de usuario o email se encuentra registrado
 *      
 */

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
    res.status(201).json({"respuesta": `El usuario ${newUser.username} ha sido creado exitosamente`});
});

/**
 * @swagger
 * /users/login:
 *  post:
 *    summary: Inicio de sesión.
 *    description : Inicio de sesión del usuario.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: datos
 *        description: E-mail o nombre de usuario y contraseña para loguear
 *        schema:
 *          type: object
 *          required:
 *            - userLog
 *            - passLog
 *          properties:
 *            userLog:
 *              description: Email de usuario a loguearse.
 *              type: string
 *              example: admin
 *            passLog:
 *              description: Contraseña de usuario a loguearse 
 *              type: string
 *              example: admin
 *    responses:
 *      200:
 *       description: Login de usuario satisfactorio. 
 *      400:
 *       description: Usuario no encontrado (email y/o contraseña incorrecta)
 *      401:
 *       description: Ya se encuentra logueado.
 */

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
        return res.status(200).json({"respuesta" : `Has iniciado sesión.`, "ID" : `${userID}`});
    } else {
        return res.status(400).json({"respuesta" : "El nombre de usuario o contraseña son incorrectos."})
    }
});

/**
 * @swagger
 * /users/logout:
 *  post:
 *    summary: Cerrado de sesión.
 *    description : Cerrado de sesión
 *    consumes:
 *      - application/json
 *    responses:
 *      200:
 *       description: Cerrado de sesión satisfactorio. 
 *      400:
 *       description: No estas logueado
 */

app.post('/users/logout', (req,res) =>{
    //Check if there is an user logged in.
    if (!logList[0]){
        return res.status(400).json({"respuesta": 'Tienes que iniciar sesión.'})
    }
    //If there is an user logged in, remove the user from the list.
    username = logList[0].username
    logList.pop()
    res.status(200).json({"respuesta":`El usuario ${username} ha cerrado la sesión.`})
})

/**
 * @swagger
 * /orders:
 *  post:
 *    summary: Creado de pedido.
 *    description : Creado de pedido.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: query
 *        name: id
 *        required: true
 *        description: Index del usuario logueado.
 *        schema:
 *          type: integer
 *          example: 4
 *      - in: body
 *        name: paymentMethod
 *        required : true
 *        description: Método de pago
 *        schema:
 *          type: object
 *          required:
 *            - paymentMethod
 *          properties:
 *            paymentMethod:
 *              description: ID del método de pago .
 *              type: integer
 *              example: 0
 *    responses:
 *      201:
 *       description: Pedido creado
 *      401:
 *       description: Pedido no creado
 *      
 */

app.post('/orders', isLoggedIn,(req,res) => {
    //Check if the user has a pending order, if it does, don't allow to open a new one.
    order = orderList.find(order => order.user.username == req.user.username)
    if (order && !order.deleted) {
        if (order.status == 1) { 
            return res.status().json({"respuesta":"Tiene otro pedido pendiente."})
        }
    }

    //Parse information from the request.
    const {paymentMethod} = req.body
    newPayment = paymentMethodList[paymentMethod] 
    //Create a new Object Order with the user and it's address and add it to the orders list.
    newOrder = new Order(req.user, newPayment, req.user.address)
    orderList.push(newOrder);

    //Get the ID of the new Order to get a reference.
    orderNumber = newOrder.getOrderNumber();

    res.json({"respuesta":`El usuario ${req.user.username} ha comenzado un pedido.`,"ID":`${orderNumber}`})
});

/**
 * @swagger
 * /orders/{order_number}:
 *  put:
 *    summary: Modificación de un pedido.
 *    description : Modifica un pedido que no se encuentre confirmado.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: path
 *        name: order number
 *        required: true
 *        description: Número del pedido.
 *        schema:
 *          type: integer
 *          example: 4
 *      - in: query
 *        name: id
 *        required: true
 *        description: Index del usuario logueado.
 *        schema:
 *          type: integer
 *          example: 4
 *      - in: query
 *        name: action
 *        required: false
 *        description: Elige entre agregar o remover un producto
 *        schema:
 *          type: string
 *          example: add
 *      - in: body
 *        name: Valores
 *        required : false
 *        description: Valores a modificar de la orden seleccionada
 *        schema:
 *          type: object
 *          properties:
 *            paymentMethod:
 *              description: ID del método de pago.
 *              type: integer
 *              example: 0
 *            address:
 *              description: Dirección de envío.
 *              type: string
 *              example: Calle Verdadera 123
 *            productNumber:
 *              description: Número del producto a agregar / remover
 *              type: integer
 *              example: 4
 * 
 *    responses:
 *      201:
 *       description: Pedido creado
 *      401:
 *       description: No puede modificar el pedido.
 *      400:
 *       description: El pedido no se encuentra en la orden
 *      406:
 *       description: Su pedido fue rechazado
 *      
 */

app.put('/orders/:order_number', isLoggedIn, orderStatus, productExist, (req,res) => {
    
    //Checks the current status of the order
    if (req.status == 100) {
        return res.json({"respuesta":'Su pedido fue rechazado.'})
    }
    
    if (req.status >= 2) {
        return res.status(401).json({"respuesta":'No puede modificar el pedido.'}) 
    }
    
    const {paymentMethod, address, productNumber} = req.body
    let modificaciones = ""

    if (paymentMethod != undefined){
        newPayment = paymentMethodList[paymentMethod];
        if (newPayment) {
        orderList[req.order_index].paymentMethod = newPayment;
        modificaciones += "Método de pago actualizado. "
        }
    }
    if (address != undefined){
        orderList[req.order_index].address = address;
        modificaciones += "Dirección de envio actualizada. "
    }

    if (productNumber != undefined){
        if (req.query.action == "add"){
        //Add the product to the order.
        orderList[req.order_index].addProduct(req.product);
        modificaciones += "Lista de productos actualizada. "
    } else if (req.query.action == "remove"){
        let product_name = req.product.name
        let index = orderList[req.order_index].orderProducts.findIndex(product => product.name == product_name)
        
        if (index == -1){
            return res.status(400).json({"respuesta":"El producto no se encuentra en la orden"})
        }

        orderList[req.order_index].removeProduct(index);
        modificaciones += "Lista de productos actualizada. "
    } 
    }

    res.json({"respuesta": `El pedido ha sido modificado ${modificaciones}`})

});
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
//######################################################################################################################
/**
 * @swagger
 * /orders/{order_number}:
 *  delete:
 *    summary: Cancela un pedido
 *    description : Cancela como usuario un pedido
 *    consumes:
 *      - application/json
 *    parameters:
 */

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


/**
 * @swagger
 * /orders/{order_number}:
 *  patch:
 *    summary: Cambiar estado de pedido
 *    description : Cambiar estado de pedido. 1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado.
 *    consumes:
 *      - application/json
 *    parameters:
 */

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

/**
 * @swagger
 * /orders/users/{user_id}:
 *  get:
 *    summary: Ver historial
 *    description : Ver el historial de pedidos del usuario que se encuentra haciendo la petición si no es admin.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.get('/orders/users/:user_id', isLoggedIn, (req, res) => {
    let userOrderList = [];

    //Check in the orders list if the user has any order in any status
    orderList.forEach((order) => {
        if (order.getUserId() == userList[req.params.user_id].userID && !order.deleted) {
            userOrderList.push(order)
        }});

    //Check if the orders of the current user is empty
    if (userOrderList.length == 0){
        return res.status(444).json({"respuesta" : `No hay pedidos para mostrar.`})
    }

    if (userOrderList[0].getUserId() == req.user.userID || req.user.isAdmin()){
        return res.json(userOrderList)
    }
});

/**
 * @swagger
 * /orders/{order_number}:
 *  get:
 *    summary: Ver un pedido.
 *    description : Ve un pedido como admin o como usuario si es el propietario.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.get('/orders/:order_number', isLoggedIn, orderStatus,(req,res)=>{
    if (req.user.isAdmin()){
        return res.json(orderList[req.order_index]);
    }
    if (req.user.userID != req.order.user.userID){
        return res.status(444).json({"respuesta": `No puede ver este pedido`});
    }

    res.json(orderList[req.order_index])
});

/**
 * @swagger
 * /orders:
 *  get:
 *    summary: Ver lista de pedidos
 *    description : Obtiene toda la lista de pedidos, borrados y no.  Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.get('/orders', isLoggedIn, hasPrivileges, (req, res) => {
    res.json({orderList})
});

/**
 * @swagger
 * /products:
 *  post:
 *    summary: Crear un producto.
 *    description : Crea un objeto de clase Producto y lo agrega a la lista de productos. Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: producto
 *        description: producto a crear
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - desc
 *            - price
 *            - stock
 *          properties:
 *            name:
 *              description: Nombre del producto
 *              type: string
 *              example: Tarta JyQ M
 *            desc:
 *              description: Descripción del producto
 *              type: string
 *              example: Tarta de jamón y queso tamaño mediana.
 *            price:
 *              description: Precio del producto
 *              type: integer
 *              example: 480
 *            stock:
 *              description: Stock del producto.
 *              type: boolean
 *              example: true
 */

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

/**
 * @swagger
 * /products/{product_number}:
 *  put:
 *    summary: Modificación de un producto.
 *    description : Modifica los valores de un producto. Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: producto
 *        description: producto a crear
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - desc
 *            - price
 *            - stock
 *          properties:
 *            name:
 *              description: Nombre del producto
 *              type: string
 *              example: Tarta JyQ M
 *            desc:
 *              description: Descripción del producto
 *              type: string
 *              example: Tarta de jamón y queso tamaño mediana.
 *            price:
 *              description: Precio del producto
 *              type: integer
 *              example: 480
 *            stock:
 *              description: Stock del producto.
 *              type: boolean
 *              example: true
 */

app.put('/products/:product_number',isLoggedIn, hasPrivileges, productExist, (req,res) => {
    const {name, desc, price, stock} = req.body  
    let modificaciones = ""
    if(name != undefined){
        let is_name_repeated = productList.find(product => product.name == name)
        if(is_name_repeated != undefined){
            return res.status(444).json({"respuesta":`El nombre ${name} ya está siendo usado`});
        }
        productList[req.product_index].setName(name) 
        modificaciones += " " + "nombre"
    }
    if (desc != undefined){
        productList[req.product_index].setDesc(desc) 
        modificaciones += " " + "descripción"
    }

    if (price != undefined){
        productList[req.product_index].setPrice(price)
        modificaciones +=  " " + "precio"
    }
    if (stock != undefined){
        productList[req.product_index].setStock(stock) 
        modificaciones += " " + "stock"
    }

    res.json({"respuesta":`El producto ${req.product.name} ha actualizado su:${modificaciones}`})

});

/**
 * @swagger
 * /products/{product_number}:
 *  delete:
 *    summary: Elimina un producto
 *    description : Elimina un producto de forma lógica.  Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.delete('/products/:product_number',isLoggedIn, hasPrivileges, productExist, (req,res) => {
    productList[req.product_index].deleteProduct()
    res.json({"respuesta":`El producto ${req.product.name} fue eliminado.`})
});

/**
 * @swagger
 * /payments:
 *  post:
 *    summary: Crea medio de pago.
 *    description : Crea un nuevo medio de pago. Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.post('/payments',isLoggedIn, hasPrivileges, (req,res) => {
    const {code, name} = req.body;
    let index = paymentMethodList.findIndex(payments => payments.getCode() == code);
    
    if (index != -1){
        return res.json({"respuesta":`El método de pago con código ${code} ya existe`})
    }

    let newPayment = new PaymentMethod(code,name);
    paymentMethodList.push(newPayment);

    let newIndex = paymentMethodList.findIndex(payments => payments.getCode() == code)
    
    res.json({"respuesta": `El método de pago ${code} ha sido agregado.`,"ID": `${newIndex}`})})

/**
 * @swagger
 * /payments/{payment_id}:
 *  put:
 *    summary: Edita un medio de pago.
 *    description : Edita parcial o completamente el medio de pago seleccionado. Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.put('/payments/:payment_id',isLoggedIn, hasPrivileges, (req,res) => {
    const {code,name} = req.body;
    let modificaciones = "";
    
    if (!paymentMethodList[req.params.payment_id] || paymentMethodList[req.params.payment_id].isDeleted()){
        return res.json({"respuesta":"El método de pago no existe"});
    }
    
    if (code != undefined){
        paymentMethodList[req.params.payment_id].code = code
        modificaciones += " " + "Código cambiado. "
    }

    if (name != undefined){
        paymentMethodList[req.params.payment_id].name = name  
        modificaciones +=  " " + "Nombre cambiado."}
    
        res.json({"respuesta":`${modificaciones}`})
});

/**
 * @swagger
 * /payments/{payment_id}:
 *  delete:
 *    summary: Borra un medio de pago.
 *    description : Borra lógicamente el medio de pago seleccionado.  Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.delete('/payments/:payment_id',isLoggedIn, hasPrivileges, (req,res) => {
    if (!paymentMethodList[req.params.payment_id] || paymentMethodList[req.params.payment_id].isDeleted()){
        return res.json({"respuesta":"El método de pago no existe"});
    }
    let codigo = paymentMethodList[req.params.payment_id].getCode();
    paymentMethodList[req.params.payment_id].deletePaymentMethod();
    res.json({"respuesta":`El método de pago con código ${codigo} ha sido borrado`})
});

/**
 * @swagger
 * /payments:
 *  get:
 *    summary: Ver lista de los medios de pagos.
 *    description : Obtiene toda la lista de medios de pagos, borrados y no.  Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.get('/payments',isLoggedIn, hasPrivileges, (req,res) => {
    res.json({paymentMethodList})
});

/**
 * @swagger
 * /user/{user_id}/orders/{order_number}:
 *  get:
 *    summary: Ver todos los pedidos de un usuario.
 *    description : Muestra toda la lista de todos los pedidos en todos los estados del usuario seleccionado. Solo para administradores.
 *    consumes:
 *      - application/json
 *    parameters:
 */

app.get('user/:user_id/orders/:order_number',isLoggedIn, hasPrivileges, orderStatus, (req,res) => {
    res.json(orderList[req.order_index])
});

//Routeo de Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Inicio server
app.listen(config.port, function () {
    console.log(`Servidor iniciado. Escuchando el puerto ${config.port}!`);
});

//TODO: buscar bugs!
//TODO: investigar como usar router para tener este archivo más organizado
//TODO: Investigar ERROR / ERR