class PaymentMethod {
    constructor(code,name){
        this.code = code;
        this.name = name;
        this.deleted = false;
    }
}

let paymentMethodList = []

module.exports = {PaymentMethod, paymentMethodList};