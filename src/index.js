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

const lobbies = [];

io.on("connection", (socket) => {
  socket.on("joinLobby", (userObj) => {
    socket.join(userObj.lobbyData.id);
    const lobby = lobbies.find(
      (lobby) => lobby.id === userObj.lobbyData.id
    );

    if (lobby) {
      lobby.users = [...lobby.users, userObj.userData];
      io.to(userObj.lobbyData.id).emit("updateLobbyData", lobby);
    } else {
      const lobby = {
        users: [userObj.userData],
        id: userObj.lobbyData.id,
      };
      lobbies.push(lobby);
      io.to(userObj.lobbyData.id).emit("updateLobbyData", lobby);
    }
  });
});
