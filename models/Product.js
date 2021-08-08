let productList = []

class Product {
    constructor(name, desc, price, stock) {
        this.productNumber = productList.length + 1;
        this.name = name;
        this.desc = desc;
        this.price = price;
        this.stock = stock === undefined ? false : stock; //Booleano
        this.deleted = false
    }

    getStock(){
        return this.stock
    }

    getProductNumber(){
        return this.productNumber;
    }

    setStock(newStock){
        this.stock = newStock;
    }

    getPrice(){
        return this.price;
    }

}

module.exports = {Product, productList};