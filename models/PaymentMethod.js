let paymentMethodList = []

class PaymentMethod {
    constructor(code,name){
        this.code = code;
        this.name = name;
        this.deleted = false;
    }
}

module.exports = {PaymentMethod, paymentMethodList};