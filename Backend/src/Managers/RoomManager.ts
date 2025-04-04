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

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString();
        this.Rooms.set(roomId.toString(), {
            user1, user2
        })

        console.log("1. user is asked to send the offer")

        user1?.socket.emit("send-offer",{
            roomId
        })

        
    }

    onOffer(roomId:string,sdp:string, socketId: string){

        console.log("2. offer received now asked to send the answer")
        const rooms = this.Rooms.get(roomId);

        const receivingUser = rooms?.user1.socket.id === socketId ? rooms.user2 : rooms?.user1

        receivingUser?.socket.emit("offer",{
            roomId,
            sdp
        })
    }

    onAnswer(roomId:string,sdp:string,socketId:string){
        console.log("answer is received")
        const rooms = this.Rooms.get(roomId);

        const receivingUser = rooms?.user1.socket.id === socketId ? rooms.user2 : rooms?.user1

        receivingUser?.socket.emit("answer",{
            roomId,
            sdp
        })
    }

    onIceCandidate(roomId:string,senderId:string,type:string,candidate:string){
        const room = this.Rooms.get(roomId);
        if(!roomId) return;

        const receivingUser =room?.user1.socket.id === senderId ? room.user2 : room?.user1
        
        receivingUser?.socket.emit("add-ice-candidate",{
            candidate,
            type,
            roomId
        })
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }
}