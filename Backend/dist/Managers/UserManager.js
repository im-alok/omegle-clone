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
        this.clearQueue();
        this.initHandlers(socket);
    }
    removeUser(socketId) {
        this.users = this.users.filter((x) => x.socket.id !== socketId);
        this.queue.filter(x => x !== socketId);
    }
    clearQueue() {
        if (this.queue.length < 2)
            return;
        //got the two user now we can talk to each other by sharing sdp
        const user1 = this.users.find(x => x.socket.id === this.queue.pop());
        const user2 = this.users.find(x => x.socket.id === this.queue.pop());
        if (!user1 || !user2)
            return;
        const roomId = this.roomManager.createRoom(user1, user2);
        return roomId;
    }
    initHandlers(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            this.roomManager.onOffer(roomId, sdp);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            this.roomManager.onAnswer(roomId, sdp);
        });
    }
}
exports.UserManager = UserManager;
