"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.Rooms = new Map();
    }
    roomDetails(roomId) {
        console.log(roomId);
        const users = this.Rooms.get(roomId);
        return users;
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.Rooms.set(roomId.toString(), {
            user1, user2
        });
        user1.socket.data.roomId = roomId;
        user2.socket.data.roomId = roomId;
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("send-offer", {
            roomId
        });
    }
    deleteRoom(roomId) {
        this.Rooms.delete(roomId);
    }
    onOffer(roomId, sdp, socketId) {
        const rooms = this.Rooms.get(roomId);
        const receivingUser = (rooms === null || rooms === void 0 ? void 0 : rooms.user1.socket.id) === socketId ? rooms.user2 : rooms === null || rooms === void 0 ? void 0 : rooms.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            roomId,
            sdp
        });
    }
    onAnswer(roomId, sdp, socketId) {
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
    onConversation(roomId, message, sender) {
        //get the room id
        console.log("from omConv handler", sender);
        const members = this.Rooms.get(roomId);
        const user1 = members === null || members === void 0 ? void 0 : members.user1;
        const user2 = members === null || members === void 0 ? void 0 : members.user2;
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("conversation", {
            message,
            sender
        });
        user2 === null || user2 === void 0 ? void 0 : user2.socket.emit("conversation", {
            message,
            sender
        });
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
