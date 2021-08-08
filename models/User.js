let userList = []

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
    //privilegios 1 = usuario, 2 = manager, 3 = admin
    privilege = 1
    //Cambiar privilegios del usuario
    setPrivileges(id) {
        this.privilege = id;
    }

    getPrivileges(){
        return this.privilege;
    }
}

module.exports = {User, userList};