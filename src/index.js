import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsDefaults } from "./consts.js";
import { router as authRouter } from "./routes/authRoutes.js";
import { router as homeRouter } from "./routes/homeRoutes.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();
const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);

app.use(cors(corsDefaults));
app.use(express.json());
server.listen(PORT);

app.use("/", authRouter);
app.use("/home", homeRouter);

const io = new Server(server, {
  cors: ["http://localhost:3000"],
});

let lobbies = [];
let users = [];

io.on("connection", (socket) => {
  const _id = socket.id;

  socket.on("joinLobby", (userObj) => {
    let newUser = { ...userObj, _id };
    socket.join(newUser.lobbyData.id);
    users = [...users, newUser];

    const lobby = lobbies.find(
      (lobby) => lobby.id === newUser.lobbyData.id
    );

    if (lobby) {
      lobby.users = [...lobby.users, newUser];
      io.to(newUser.lobbyData.id).emit("updateLobbyData", lobby);
    } else {
      const lobby = {
        users: [newUser],
        id: newUser.lobbyData.id,
      };
      lobbies.push(lobby);
      io.to(newUser.lobbyData.id).emit("updateLobbyData", lobby);
    }
    console.log(users, "after joined ");
  });

  socket.on("disconnect", () => {
    const disconUser = users.find(
      (user) => user._id === socket.id
    );
    const usersWithoutDiscon = users.filter(
      (user) => user._id !== disconUser._id
    );
    io.to(disconUser.lobbyData.id).emit("updateLobbyData", {
      ...disconUser.lobbyData,
      users: usersWithoutDiscon,
    });
    users = usersWithoutDiscon;
    console.log(users, "once disconnected");
  });
});

// class Lobby {
//   constructor() {
//     this.id = 0;
//     this.users = [];
//   }

//   static create(room) {
//     const roomId = `R_${room.id}`;
//     const alreadyExists = Room.findById(roomId);

//     if (alreadyExists) return null;
//     const withDefaults = {
//       ...room,
//       id: roomId,
//       users: [],
//     };
//     return new Room(withDefaults);
//   }

//   static findById(roomId) {
//     const room = store.findRoomById(roomId);
//     if (!room) return null;
//     return new Room(room);
//   }
// }
