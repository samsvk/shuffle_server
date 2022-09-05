import express from "express";
import fetch from "node-fetch";
import querystring from "querystring";
import { enc, dec } from "../utils.js";

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
      const at = enc(token);
      res.redirect(`http://localhost:3000/lobby?at=${at}`);
    });
});

router.get("/getUser", async (req, res) => {
  const access_token = req.headers.cookie;
  const at = access_token.split("=")[1];
  await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${dec(at)}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      res.json(data);
    });
});

// router.post("/getUserPlaylist", async (req, res) => {
//   const access_token = req.headers.cookie;
//   const at = access_token.split("=")[1];
//   console.log(req);
//   await fetch(
//     `https://api.spotify.com/v1/users/${req.body}/playlists`,
//     {
//       headers: {
//         Authorization: `Bearer ${dec(at)}`,
//         Accept: "application/json",
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     }
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//       res.json(data.items);
//     });
// });

router.get("/setCookie", (req, res) => {
  let { cookie } = req.query;
  res.cookie("at", `${cookie}`, {
    expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
    httpOnly: true,
  });
  res.send("");
});
