import { Socket } from "socket.io"
import { Room, RoomManager } from "./RoomManager"

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

    removeUser(socketId: string, roomId: string) {
        console.log("from remove user", roomId);
        this.users = this.users.filter((x) => x.socket.id !== socketId);
        this.queue.filter(x => x !== socketId);
        if (roomId)
            this.closeRoom(roomId);
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
        this.clearQueue();
    }

    initHandlers(socket: Socket) {
        socket.on("offer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id)
        })

        socket.on("answer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id)
        })

        socket.on("add-ice-candidate", ({ roomId, candidate, type }) => {
            this.roomManager.onIceCandidate(roomId, socket.id, type, candidate)
        })

        socket.on("conversation",({roomId,message,sender})=>{
            this.roomManager.onConversation(roomId,message,sender);
        });
    }

    //close the room if anyone of the user left the room and send back to the queue

    closeRoom(roomId: string) {
        const user: Room | undefined = this.roomManager.roomDetails(roomId);

        const user1 = user?.user1;
        const user2 = user?.user2;

        //remove the room and send the user back to the queue
        this.roomManager.deleteRoom(roomId);



        //push the user back to the queue
        if (user1?.socket.connected) {
            user1?.socket.emit("room-ends");
            this.queue.unshift(user1.socket.id);
        }
        if (user2?.socket.connected) {
            user2?.socket.emit("room-ends");
            this.queue.push(user2.socket.id);
        }

        console.log(this.queue);
        this.clearQueue();
    }
}