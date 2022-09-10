import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsDefaults } from "./consts.js";
import { router as authRouter } from "./routes/authRoutes.js";
import { router as homeRouter } from "./routes/homeRoutes.js";
import { Server } from "socket.io";
import http from "http";
import { shuffle } from "./utils.js";

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

const getLobby = (id) => lobbies.find((lobby) => lobby.id === id);
const createLobby = (lobby) => {
  lobbies.push(lobby);
  return lobby;
};
const deleteLobby = (id) => {
  lobbies = lobbies.filter((l) => l.id !== id);
};

const upsertLobby = (lobbyObj) => {
  const lobbyExists = getLobby(lobbyObj.id);
  if (!lobbyExists) return createLobby(lobbyObj);
  const index = lobbies.findIndex((l) => l.id === lobbyObj.id);
  lobbies[index] = lobbyObj;
  return lobbies[index];
};

const getUser = (id) => users.find((user) => user._id === id);
const createUser = (user) => {
  users.push(user);
  return user;
};
const deleteUser = (id) => {
  users = users.filter((u) => u._id !== id);
};

const upsertUser = (userObj) => {
  const userExists = getUser(userObj._id);
  if (!userExists) return createUser(userObj);
  const index = users.findIndex((u) => u._id === userObj._id);
  users[index] = userObj;
  return users[index];
};

const logAllUsers = () => {
  console.log(users, "users in store");
};

const logAllLobbies = () => {
  console.log(lobbies, `lobbies in store`);
};

const getUserDataFromLobbyIds = (id) => {
  const lobby = getLobby(id);
  return lobby.users.map((user) => getUser(user));
};

io.on("connection", (socket) => {
  socket.on("joinLobby", (userObj) => {
    const user = upsertUser({ _id: socket.id, ...userObj });
    const lobby = getLobby(user.lobbyId);
    socket.join(user.lobbyId);
    if (lobby) {
      const _l = upsertLobby({
        ...lobby,
        users: [...lobby.users, user._id],
      });
      io.to(lobby.id).emit("updateLobbyData", _l);
      io.to(lobby.id).emit("setLobbyUsers", getUserDataFromLobbyIds(lobby.id));
    } else {
      const _l = upsertLobby({
        users: [user._id],
        id: user.lobbyId,
        tracks: [],
      });
      io.to(_l.id).emit("updateLobbyData", _l);
      io.to(_l.id).emit("setLobbyUsers", getUserDataFromLobbyIds(_l.id));
    }
  });

  socket.on("sendPlaylistTracks", (dataObj) => {
    const lobby = getLobby(dataObj.id);
    const user = getUser(socket.id);

    upsertUser({
      ...user,
      isReady: true,
    });

    const _l = upsertLobby({
      ...lobby,
      tracks: shuffle([...lobby.tracks, ...dataObj.playlistTunes]),
    });

    if (_l.users.map((user) => getUser(user)).every((u) => u.isReady === true)) {
      io.to(_l.id).emit("updateLobbyData", _l);
      io.to(_l.id).emit("setLobbyUsers", getUserDataFromLobbyIds(_l.id));
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (!user) return null;
    const lobby = getLobby(user.lobbyId);
    const _l = upsertLobby({
      ...lobby,
      users: lobby.users.filter((u) => u !== user._id),
    });

    deleteUser(user._id);
    io.to(lobby.id).emit("updateLobbyData", _l);
    io.to(_l.id).emit("setLobbyUsers", getUserDataFromLobbyIds(_l.id));

    if (_l.users.length === 0) {
      deleteLobby(_l.id);
    }
  });

  socket.on("logUsers", () => logAllUsers());
  socket.on("logLobbies", () => logAllLobbies());
});
