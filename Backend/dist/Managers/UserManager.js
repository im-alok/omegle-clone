"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager_1.RoomManager();
    }
    addUser(name, socket) {
        this.users.push({
            name, socket
        });
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        this.users = this.users.filter((x) => x.socket.id !== socketId);
        this.queue.filter(x => x !== socketId);
    }
    clearQueue() {
        if (this.queue.length < 2) {
            // console.log("Not sufficent user is present");
            return;
        }
        ;
        //got the two user now we can talk to each other by sharing sdp
        const socket1 = this.queue.pop();
        const user1 = this.users.find(x => x.socket.id === socket1);
        const socket2 = this.queue.pop();
        const user2 = this.users.find(x => x.socket.id === socket2);
        if (!user1 || !user2)
            return;
        const roomId = this.roomManager.createRoom(user1, user2);
    }
    initHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            console.log("offer received, now asked to send the offer");
            this.roomManager.onOffer(roomId, sdp, socket.id);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            console.log("answer received");
            // console.log(sdp)
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        });
        socket.on("add-ice-candidate", ({ roomId, candidate, type }) => {
            console.log(candidate);
            this.roomManager.onIceCandidate(roomId, socket.id, type, candidate);
        });
    }
}
exports.UserManager = UserManager;
