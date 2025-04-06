import { User } from "./UserManager"

let GLOBAL_ROOM_ID = 1;

export interface Room {
    user1: User,
    user2: User
}

export class RoomManager {
    private Rooms: Map<string, Room>
    constructor() {
        this.Rooms = new Map<string, Room>();
    }

    roomDetails(roomId: string): Room | undefined {
        const users = this.Rooms.get(roomId);

        return users;
    }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString();
        this.Rooms.set(roomId.toString(), {
            user1, user2
        })

        user1.socket.data.roomId = roomId;
        user2.socket.data.roomId = roomId;
        user1?.socket.emit("send-offer", {
            roomId
        })


    }

    deleteRoom(roomId: string) {
        this.Rooms.delete(roomId);
    }

    onOffer(roomId: string, sdp: string, socketId: string) {

        const rooms = this.Rooms.get(roomId);

        const receivingUser = rooms?.user1.socket.id === socketId ? rooms.user2 : rooms?.user1

        receivingUser?.socket.emit("offer", {
            roomId,
            sdp
        })
    }

    onAnswer(roomId: string, sdp: string, socketId: string) {
        const rooms = this.Rooms.get(roomId);

        const receivingUser = rooms?.user1.socket.id === socketId ? rooms.user2 : rooms?.user1

        receivingUser?.socket.emit("answer", {
            roomId,
            sdp
        })
    }

    onIceCandidate(roomId: string, senderId: string, type: string, candidate: string) {
        const room = this.Rooms.get(roomId);
        if (!roomId) return;

        const receivingUser = room?.user1.socket.id === senderId ? room.user2 : room?.user1

        receivingUser?.socket.emit("add-ice-candidate", {
            candidate,
            type,
            roomId
        })
    }

    onConversation(roomId: string, message: string, sender: string) {

        const members = this.Rooms.get(roomId);
        const user1 = members?.user1;
        const user2 = members?.user2;
        

        user1?.socket.emit("conversation",{
            message,
            sender
        })
        user2?.socket.emit("conversation",{
            message,
            sender
        })
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }

}