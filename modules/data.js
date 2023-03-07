const {PlayerIO, PlayerIOError, PlayerIOErrorCode} = require("playerio-node");
var client = null;

const config = {
    PLAYER_IO: {
        gameId: 'water-sharing-o7dkbd6w0swqwslckbo0g',
        connectionId: 'public',
        roomType: 'room',
        tableName: 'Rooms'
    }
};

PlayerIO.useSecureApiRequests = true;

function CheckErrorCode(errorCode){
    let msg = errorCode.message.split(": ");
    // console.log(msg[msg.length - 1]);
    let id = 0;

    if (errorCode.code == PlayerIOErrorCode.UnknownUser){
        id = 0;
    }
    else if (errorCode.code == PlayerIOErrorCode.InvalidPassword){
        id = 1;
    }
    else if (errorCode.code == PlayerIOErrorCode.GeneralError){
        id = 2;
    }
    else if (errorCode.code == PlayerIOErrorCode.UnknownTable){
        id = 3;
    }
    else if (errorCode.code == PlayerIOErrorCode.UnknownIndex){
        id = 4;
    } else {
        id = 5;
    }

    return {
        code: errorCode.code,
        code_id: id,
        message: msg[msg.length - 1].replace("]", "")
    };
}

function CheckFraming(roomObject){
    let framing = "Tanpa Framing";
    if (roomObject.roomFraming == 1) {
        framing = "Framing Untung";
    }
    else if (roomObject.roomFraming == 2){
        framing = "Framing Rugi";
    }
    return framing;
}

function CheckSanksi(roomObject){
    let sanksi = "Tanpa Sanksi";
    if (roomObject.roomSanksi == 1){
        sanksi = "Dengan Sanksi";
    }
    return sanksi;
}

async function connectClient(_userId, _password, _register = "false") {
    return new Promise((resolve, reject) => 
    PlayerIO.authenticate(
        config.PLAYER_IO.gameId,
        config.PLAYER_IO.connectionId,
        {
            register: _register,
            username: _userId,
            password: _password
        },
        {},
        resolve,
        reject
    ));
}

async function ConnectToPlayerIO(userId, password){
    return new Promise((resolve, reject) => {
        connectClient(userId, password)
        .then(response => {
            client = response;
            resolve(response);
        })
        .catch(error => {
            console.log("[ConnectToPlayerIO] Code: " + error.code + ", message: " + error.message);
            reject(error);
        });
    });
}

async function RegisterToPlayerIO(userId, password){
    return new Promise((resolve, reject) => {
        connectClient(userId, password, "true")
        .then(result => {
            resolve(result);
        })
        .catch(error => {
            console.log("[RegisterToPlayerIO] Code: " + error.code + ", message: " + error.message);
            reject(error);
        })
    });
}

async function getRoomLists(){
    return new Promise((resolve, reject) => {
        if (client == null) reject({code: PlayerIOErrorCode.GeneralError, code_id: 5, message: "Client is empty"});
        client.bigDB.load(
            config.PLAYER_IO.tableName,
            "Rooms",
            resolve,
            reject
        );
    });
}

async function getResultLists(){
    return new Promise((resolve, reject) => {
        if (client == null) reject({code: PlayerIOErrorCode.GeneralError, code_id: 5, message: "Client is empty"});
        client.bigDB.load(
            config.PLAYER_IO.tableName,
            "Responses",
            resolve,
            reject
        );
    });
}

async function GetRooms(){
    return new Promise((resolve, reject) => {
        getRoomLists()
        .then(result => {
            resolve(result);
        })
        .catch(error => {
            console.log("[GetRooms] Code: " + error.code + ", message: " + error.message);
            reject(error);
        })
    })
}

async function GetResults(){
    return new Promise((resolve, reject) => {
        getResultLists()
        .then(result => {
            resolve(result);
        })
        .catch(error => {
            console.log("[GetResults] Code: " + error.code + ", message: " + error.message);
            reject(error);
        });
    });
}

module.exports = {ConnectToPlayerIO, RegisterToPlayerIO, GetRooms, GetResults, CheckErrorCode, CheckFraming, CheckSanksi};