class User {
    constructor(username, pass, full_name, phone_number, email, address) {
        this.username = username;
        this.pass = pass;
        this.full_name = full_name;
        this.email = email;
        this.phone_number = phone_number;
        this.address = address;
        this.userID = userList.length;
        this.admin = false;
        this.deleted = false; //Tener en cuenta para chequear la existencia de usuarios.
    }
    
    setAdmin(bool) {
        this.admin = bool;
    }

    isAdmin(){
        return this.admin;
    }

    deleteUser(){
        this.deleted = true;
    }

    isDeleted(){
        return this.deleted;
    }
}

let userList = []

module.exports = {User, userList};