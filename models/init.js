//Importo de las clases y sus listas para agregar datos
const {User, userList} = require('../models/User')
const {Product, productList} = require('../models/Product')
const {Order, orderList} = require('../models/Order')
const {PaymentMethod, paymentMethodList} = require('../models/PaymentMethod')

//##############################################################
//La manera en que agregué ciertos datos puede crear problemas,
//sería mejor agregar los datos desde Swagger o Postman.
//##############################################################

//Creo y agrego usuario a la lista de usuarios
userList.push(new User("admin","admin", null, null, "superadmin@supermail.com", null));
userList.push(new User("tdfn00b","pokemon","David Maximiliano Guerrero","+5492964609475","guerrerodavidm@gmail.com", "Calle falsa 123"));
userList.push(new User("felipemoralesquerol","felpe1234","Felipe Morales","12345678","felipe.morales.querol@gmail.com", "Calle verdadera 123"));
userList.push(new User("juancit0","contraseña","Juancito Perez","123213214","juancitoperez@gmail.com", "Mi casa 321"));

//Cambio los privilegios del admin
let adminAcc = userList.find(user => user.username == "admin");
adminAcc.setAdmin(true)

//Creo y agrego productos a la lista de productos
productList.push(new Product("Panqueque de manzana", "Panqueques de manzana verde con caramelo", 100, true))
productList.push(new Product("Hamburguesa clásica", "Hamburguesa con queso, lechuga y tomate", 200, true))
productList.push(new Product("Ensalada Veggie", "Hamburguesa con lechuga, tomate y sin hamburguesa", 300))
productList.push(new Product("Coca-Cola 1L", "Coca-Cola sabor original de 1 litro", 120, true))

//Creo y agrego métodos de pago

let efectivo = new PaymentMethod("EF", "Efectivo")
let debito = new PaymentMethod("TD", "Tarjeta Debito")

paymentMethodList.push(efectivo)
paymentMethodList.push(debito)

//Agrego ordenes a la lista de ordenes
orderList.push(new Order(userList[1], paymentMethodList[0], userList[1].address))
orderList.push(new Order(userList[2], paymentMethodList[0], userList[2].address))
orderList.push(new Order(userList[3], paymentMethodList[1], userList[3].address))

//Agrego productos a las ordenes
orderList[0].addProduct(productList[0])
orderList[0].addProduct(productList[0])
orderList[0].addProduct(productList[0])
orderList[1].addProduct(productList[1])
orderList[1].addProduct(productList[1])
orderList[1].addProduct(productList[3])
orderList[2].addProduct(productList[3])

//Exporto para el uso en app.js
module.exports = {User, userList, Product, productList, Order, orderList, PaymentMethod, paymentMethodList}