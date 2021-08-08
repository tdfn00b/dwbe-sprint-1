//Creación de lista de datos
let orderList = []

class Order {
    constructor(user, paymentMethod, address) {
        this.user = user,
        this.paymentMethod = paymentMethod;
        this.orderNumber = orderList.length + 1;
        this.orderDate = new Date(); //Verificar como dar dd/mm/aa + mm:hh
        this.orderProducts = [];
        this.orderPrice = 0;
        this.orderDeliveryAddress = address
        this.status = 1; //1 = Pendiente, 2 = Confirmado, 3 = En preparación, 4 = Enviado, 5 = Entregado, 100 = Rechazado
        this.deleted = false // Para borrar voy a hacer un borrado lógico
    }
    //Obtener precio de la orden
    setPrice() {
        let newPrice = 0;
        
        if (this.orderProducts.length > 0) {
            this.orderProducts.forEach(element => (product => {newPrice += product.getPrice()}))};
        this.orderPrice = newPrice;
    }

    setStatus(user, newStatus){
        if (this.status != newStatus){
            if (user.getPrivileges() >= 2 || (user.getPrivileges() == 1 && newStatus < 2)) {
                this.status = newStatus;
            } else if (user.getPrivileges() == 1 && newStatus > 2) {
                console.log('El usuario no tiene permisos para acceder a esta propiedad')
            } 
        } else {
            console.log('El estado del pedido es idéntico al estado propuesto.')
        }
    }
    /*
    addProduct(productNumber, qty){
        let product = productList.find(products => products.productNumber == productNumber);

        if (qty != 0){
            for (let i = 1; i <= qty; i++){
                this.orderProducts.push(product)
            }
        }
        this.setPrice()
    }
    */

    addProduct(productNumber, qty){
        let product = productList.find(products => products.productNumber == productNumber);
        let productArray = [product, qty]
        this.orderProducts.push(productArray)
        this.setPrice()
        }

    removeProduct(productNumber, qty){
        productIndex = this.orderProducts.findIndex(productInList => productInList[0].getProductNumber() == productNumber)
        this.orderProducts.splice(productIndex, 1)
        this.setPrice()
    }

    getUserId(){
        return this.user;
    }

    getOrdersByStatus(user){
        let userOrderList = []
        orderList.filter(function(order) {
            if (order.getUserId() == user && order.status == 5) {
                userOrderList += order;
            }});
        return userOrderList
    }
}

module.exports = {Order, orderList};