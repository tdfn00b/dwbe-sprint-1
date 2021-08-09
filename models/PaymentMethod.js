class PaymentMethod {
    constructor(code,name){
        this.code = code;
        this.name = name;
        this.deleted = false;
    }

    deletePaymentMethod(){
        this.deleted = true;
    }
    isDeleted(){
        return this.deleted;
    }

    getCode(){
        return this.code
    }
}

let paymentMethodList = []

module.exports = {PaymentMethod, paymentMethodList};