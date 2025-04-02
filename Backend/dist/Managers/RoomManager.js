"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.Rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.Rooms.set(roomId.toString(), {
            user1, user2
        });
        console.log("1. user is asked to send the offer");
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("send-offer", {
            roomId
        });
    }
    onOffer(roomId, sdp, socketId) {
        console.log("2. offer received now asked to send the answer");
        const rooms = this.Rooms.get(roomId);
        const receivingUser = (rooms === null || rooms === void 0 ? void 0 : rooms.user1.socket.id) === socketId ? rooms.user2 : rooms === null || rooms === void 0 ? void 0 : rooms.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            roomId,
            sdp
        });
    }
    onAnswer(roomId, sdp, socketId) {
        console.log("answer is received");
        const rooms = this.Rooms.get(roomId);
        const receivingUser = (rooms === null || rooms === void 0 ? void 0 : rooms.user1.socket.id) === socketId ? rooms.user2 : rooms === null || rooms === void 0 ? void 0 : rooms.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            roomId,
            sdp
        });
    }
    onIceCandidate(roomId, senderId, type, candidate) {
        const room = this.Rooms.get(roomId);
        if (!roomId)
            return;
        const receivingUser = (room === null || room === void 0 ? void 0 : room.user1.socket.id) === senderId ? room.user2 : room === null || room === void 0 ? void 0 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("add-ice-candidate", {
            candidate,
            type,
            roomId
        });
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
