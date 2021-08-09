const {productList} = require('./Product')

class Order {
    constructor(user, paymentMethod, address) {
        this.user = user;
        this.paymentMethod = paymentMethod;
        this.orderNumber = orderList.length + 1;
        this.orderDate = new Date(); //Verificar como dar dd/mm/aa + mm:hh
        this.orderProducts = [];
        this.orderPrice = 0;
        this.orderDeliveryAddress = address;
        this.status = 1; //1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado
        this.deleted = false // Para borrar voy a hacer un borrado lógico, tener en cuenta a la hora de la existencia de ordenes.
    }
    //Obtener precio de la orden
    setPrice() {
        let newPrice = 0;
        
        if (this.orderProducts.length > 0) {
            this.orderProducts.forEach(product => {newPrice += product.getPrice()})};
        this.orderPrice = newPrice;
    }

    setStatus(user, newStatus){
        if (this.status != newStatus){
            if (user.isAdmin() || (newStatus < 2)) {
                this.status = newStatus;
            } else if (!user.isAdmin() && newStatus > 2) {
                console.log('El usuario no tiene permisos para acceder a esta propiedad')
            } 
        } else {
            console.log(`El pedido ya está ${newStatus}`)
        }
    }
    
    addProduct(product){
        this.orderProducts.push(product)
        this.setPrice()
    }

    removeProduct(product_index){    
        this.orderProducts.splice(product_index)
        this.setPrice()
    }

    getUserId(){
        return this.user.userID
    }


    
    getOrderNumber(){
        return this.orderNumber
    }

    deleteOrder(){
        this.deleted = true;
    }

    isProductInOrder(product_name){
        let searchByName = this.orderProducts.find(product => product.name == product_name)
        if (searchByName == undefined){
            return false
        } else {
            return true
        }
    }
}

let orderList = []

module.exports = {Order, orderList};