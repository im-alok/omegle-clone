"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.Rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate();
        this.Rooms.set(roomId.toString(), {
            user1, user2
        });
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("send-offer", {
            roomId
        });
        return roomId;
    }
    onOffer(roomId, sdp) {
        var _a;
        const user2 = (_a = this.Rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user2;
        user2 === null || user2 === void 0 ? void 0 : user2.socket.emit("offer", {
            sdp
        });
    }
    onAnswer(roomId, sdp) {
        var _a;
        const user1 = (_a = this.Rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user1;
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("answer", {
            sdp
        });
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;
