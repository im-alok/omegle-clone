import { Socket } from "socket.io"
import { RoomManager } from "./RoomManager"

export interface User{
    name:string,
    socket:Socket
}

export class UserManager{
    private users:User[]
    private queue:string[]
    private roomManager:RoomManager
    constructor(){
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();

    }

    addUser(name:string,socket:Socket){
        this.users.push({
            name,socket
        })
        this.queue.push(socket.id);

        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socketId:string){
        this.users = this.users.filter((x)=>x.socket.id !== socketId);
        this.queue.filter(x => x !== socketId);
    }

    clearQueue(){
        if(this.queue.length < 2) return;

        //got the two user now we can talk to each other by sharing sdp
        const user1 = this.users.find(x => x.socket.id === this.queue.pop());
        const user2 = this.users.find( x => x.socket.id === this.queue.pop());
        
        if(!user1 || !user2)
            return

        const roomId = this.roomManager.createRoom(user1,user2);
        return roomId
    }

    initHandlers(socket:Socket){
        socket.on("offer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onOffer(roomId,sdp)
        })

        socket.on("answer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onAnswer(roomId,sdp)
        })
    }
}