"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const PORT = 3000;
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'connection created successfully'
    });
});
app.listen(PORT, () => {
    console.log('setup completed');
    console.log('nodemon setup complete');
});
io.on('connection', (socket) => {
    console.log('socket connection created successfully lets go', socket.connected);
});
