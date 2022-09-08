import express from "express";

import {
  login,
  logged,
  getUser,
  getUserPlaylistTracks,
  createUserPlaylist,
  setCookie,
} from "./controllers/auth.js";

export const router = express.Router();

router.get("/login", login);

router.get("/logged", logged);

router.get("/getUser", getUser);

router.post("/getUserPlaylistTracks", getUserPlaylistTracks);

router.post("/createUserPlaylist", createUserPlaylist);

router.get("/setCookie", setCookie);
