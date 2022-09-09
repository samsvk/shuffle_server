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

const getLobby = (id) =>
  lobbies.find((lobby) => lobby.id === id);
const createLobby = (lobby) => lobbies.push(lobby);
const upsertLobby = (lobbyObj) => {
  const lobbyExists = getLobby(lobbyObj.id);
  if (!lobbyExists) return createLobby(lobbyObj);
  const index = lobbies.findIndex((l) => l.id === lobbyObj.id);
  lobbies[index] = lobbyObj;
};

const getUser = (id) => users.find((user) => user._id === id);
const createUser = (user) => users.push(user);
const deleteUser = (id) => {
  users = users.filter((u) => u._id !== id);
};

const upsertUser = (userObj) => {
  const userExists = getUser(userObj._id);
  if (!userExists) return createUser(userObj);
  const index = users.findIndex((u) => u.id === userObj._id);
  users[index] = userObj;
};

io.on("connection", (socket) => {
  socket.on("joinLobby", (userObj) => {
    upsertUser({ _id: socket.id, ...userObj });
    const user = getUser(socket.id);
    const lobby = getLobby(user.lobbyData.id); // check if lobby exists
    socket.join(user.lobbyData.id); // join room/lobby via id provided in emitter

    if (lobby) {
      const _l = { ...lobby, users: [...lobby.users, user] };
      upsertLobby(_l);
      io.to(lobby.id).emit("updateLobbyData", _l); // emit to the entire lobby userbase the new member
    } else {
      upsertLobby({
        users: [user],
        id: user.lobbyData.id,
      }); // create lobby if required;
      io.to(getLobby(user.lobbyData.id).id).emit(
        "updateLobbyData",
        getLobby(user.lobbyData.id)
      ); // send data to the members of new lobby;
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (!user) return null;
    const lobby = getLobby(user.lobbyData.id);
    const temp = {
      ...lobby,
      users: lobby.users.filter((u) => u._id !== user._id),
    };
    upsertLobby(temp);
    deleteUser(user._id);
    io.to(lobby.id).emit("updateLobbyData", temp);
  });
});
