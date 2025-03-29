import express, { Request, Response } from 'express';

import { createServer } from 'http';

import { Server, Socket } from 'socket.io';
import cors from "cors"
import { UserManager } from './Managers/UserManager';

const app = express();

app.use(cors({
    origin:"http://localhost:5173"
}))

const server = createServer(app);
const io = new Server(server, {
    cors:{
        
        origin:"http://localhost:5173"
    }
});

const PORT = 3000

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
    userManager.addUser("random",socket);
})