import express, { Request, Response } from 'express';

import { createServer } from 'http';

import { Server, Socket } from 'socket.io';

const app = express();

const server = createServer(app);
const io = new Server(server);

const PORT = 3000

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'connection created successfully'
    })
})

app.listen(PORT, () => {
    console.log('setup completed');
    console.log('nodemon setup complete');
})


io.on('connection', (socket: Socket) => {
    console.log('socket connection created successfully lets go', socket.connected)
})