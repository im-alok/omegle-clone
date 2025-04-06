"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const UserManager_1 = require("./Managers/UserManager");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173"
}));
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});
const PORT = 3000;
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'connection created successfully'
    });
});
server.listen(PORT, () => {
    console.log('setup completed');
    console.log('nodemon setup complete');
});
const userManager = new UserManager_1.UserManager();
io.on('connection', (socket) => {
    socket.on("initiate-call", ({ userName }) => {
        userManager.addUser(userName, socket);
    });
    socket.on("disconnect", () => {
        userManager.removeUser(socket.id, socket.data.roomId);
    });
    socket.on("skip", ({ roomId }) => {
        userManager.closeRoom(roomId);
    });
});
