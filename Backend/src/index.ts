import express, { Request, Response } from 'express';

import { createServer } from 'http';

import { Server, Socket } from 'socket.io';
import cors from "cors"
import { UserManager } from './Managers/UserManager';

const app = express();

app.use(cors({
    origin:["https://omegle-clone-frontend-im-aloks-projects.vercel.app","http://localhost:5173/"]
}))

const server = createServer(app);
const io = new Server(server, {
    cors:{
        
        origin:["https://omegle-clone-frontend-im-aloks-projects.vercel.app","http://localhost:5173/"]
    }
});

const PORT = 3001

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'connection created successfully'
    })
})

server.listen(PORT, () => {
    console.log('setup completed');
    console.log('nodemon setup complete');
})

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {
    socket.on("initiate-call",({userName})=>{
        userManager.addUser(userName,socket);
    })

    socket.on("disconnect",()=>{
        userManager.removeUser(socket.id,socket.data.roomId);
    })


    socket.on("skip",({roomId})=>{
        userManager.closeRoom(roomId);
    })
})