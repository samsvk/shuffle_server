import express from "express";
import fetch from "node-fetch";
import querystring from "querystring";
import { encrypt } from "../utils.js";

function encodeFromData(data) {
  return Object.keys(data)
    .map(
      (key) =>
        encodeURIComponent(key) +
        "=" +
        encodeURIComponent(data[key])
    )
    .join("&");
}

export const router = express.Router();

router.get("/login", (req, res) => {
  let scope = `user-modify-playback-state user-read-playback-state user-read-currently-playing user-library-modify user-library-read playlist-read playlist-read-private playlist-modify-public`;

  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECTURI}&scope=${scope}&show_dialog=true`
  );
});

router.get("/logged", async (req, res) => {
  let body = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.REDIRECTURI,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };

  await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: encodeFromData(body),
  })
    .then((resp) => resp.json())
    .then((data) => {
      let query = querystring.stringify(data);
      let token = query.split("=")[1];
      console.log(token);
      const encryptedAccessToken = encrypt(token).toString();

      res.redirect(
        `http://localhost:3000/lobby?user=${encryptedAccessToken}`
      );
    });
});

router.get("/getUser/:token", async (req, res) => {});
