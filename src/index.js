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

io.on("connection", (socket) => {
  socket.on("joinLobby", (userObj) => {
    upsertUser({ _id: socket.id, ...userObj });
    const user = getUser(socket.id);
    const lobby = getLobby(user.lobbyData.id); // check if lobby exists
    socket.join(user.lobbyData.id); // join room/lobby via id provided in emitter
    if (lobby) {
      const _l = upsertLobby({
        ...lobby,
        users: [...lobby.users, user],
      });
      io.to(lobby.id).emit("updateLobbyData", _l); // emit to the entire lobby userbase the new member
    } else {
      const _l = upsertLobby({
        users: [user],
        id: user.lobbyData.id,
        tracks: [],
      }); // create lobby if required;
      io.to(_l.id).emit("updateLobbyData", _l); // send data to the members of new lobby;
    }
  });

  socket.on("sendPlaylistTracks", (dataObj) => {
    const lobby = getLobby(dataObj.id);
    const user = getUser(socket.id);
    upsertUser({
      ...user,
      userData: { ...user.userData, isReady: true },
      tracks: [...dataObj.playlistTunes],
    });

    const _l = upsertLobby({
      ...lobby,
      tracks: shuffle([...lobby.tracks, ...dataObj.playlistTunes]),
    });

    if (
      lobby?.users
        .map((user) => getUser(user._id))
        .every((u) => u.userData.isReady === true)
    ) {
      io.to(lobby.id).emit("updateLobbyData", _l);
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (!user) return null;
    const lobby = getLobby(user.lobbyData.id);
    const _l = upsertLobby({
      ...lobby,
      users: lobby.users.filter((u) => u._id !== user._id),
    });
    deleteUser(user._id);
    io.to(lobby.id).emit("updateLobbyData", _l);
    if (_l.users.length === 0) {
      deleteLobby(_l.id);
    }
  });
});
