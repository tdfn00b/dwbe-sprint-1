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

    setStatus(newStatus){
        this.status = newStatus;
    }
    
    getStatus(){
        return this.status;
    }

    addProduct(product){
        this.orderProducts.push(product)
        this.setPrice()
    }

    removeProduct(product_index){    
        this.orderProducts.splice(product_index, 1)
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

    isDeleted(){
        return this.deleted;
    }
}

let orderList = []

module.exports = {Order, orderList};