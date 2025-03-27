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
        const roomId = this.generate();
        this.Rooms.set(roomId.toString(), {
            user1, user2
        })

        user1?.socket.emit("send-offer",{
            roomId
        })

        return roomId;
    }

    onOffer(roomId:string,sdp:string){
        const user2 = this.Rooms.get(roomId)?.user2;

        user2?.socket.emit("offer",{
            sdp
        })
    }

    onAnswer(roomId:string,sdp:string){
        const user1 = this.Rooms.get(roomId)?.user1;

        user1?.socket.emit("answer",{
            sdp
        })
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }
}