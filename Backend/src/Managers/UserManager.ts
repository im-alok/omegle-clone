import { Socket } from "socket.io"
import { RoomManager } from "./RoomManager"

export interface User {
    name: string,
    socket: Socket
}

export class UserManager {
    private users: User[]
    private queue: string[]
    private roomManager: RoomManager
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();

    }

    addUser(name: string, socket: Socket) {
        this.users.push({
            name, socket
        })
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socketId: string) {
        this.users = this.users.filter((x) => x.socket.id !== socketId);
        this.queue.filter(x => x !== socketId);
    }

    clearQueue() {
        if (this.queue.length < 2) {
            // console.log("Not sufficent user is present");
            return;
        };

        //got the two user now we can talk to each other by sharing sdp
        const socket1 = this.queue.pop();
        const user1 = this.users.find(x => x.socket.id === socket1);
        const socket2 = this.queue.pop();
        const user2 = this.users.find(x => x.socket.id === socket2);

        if (!user1 || !user2)
            return

        const roomId = this.roomManager.createRoom(user1, user2);
    }

    initHandlers(socket: Socket) {
        socket.on("offer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            console.log("offer received, now asked to send the offer")
            this.roomManager.onOffer(roomId, sdp, socket.id)
        })

        socket.on("answer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            console.log("answer received");
            // console.log(sdp)
            this.roomManager.onAnswer(roomId, sdp, socket.id)
        })

        socket.on("add-ice-candidate",({roomId,candidate,type})=>{
            console.log(candidate)
            this.roomManager.onIceCandidate(roomId,socket.id,type,candidate)
        })
    }
}