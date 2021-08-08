class User {
    constructor(username, pass, full_name, phone_number, email, address) {
        this.username = username;
        this.pass = pass;
        this.full_name = full_name;
        this.email = email;
        this.phone_number = phone_number;
        this.address = address;
        this.admin = false;
        this.deleted = false;
    }
    
    setAdmin(bool) {
        this.admin = bool;
    }

    isAdmin(){
        return this.privilege;
    }

    deleteUser(){
        this.deleted = true
    }
}

let userList = []

module.exports = {User, userList};