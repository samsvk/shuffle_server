import express from "express";
import fetch from "node-fetch";
import querystring from "querystring";
import { enc, dec, encodeFromData } from "../utils.js";

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
  const dec_at = dec(at);
  await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${dec_at}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response.json())
    .then(async (user) => {
      const playlists = await fetchPlaylists(dec_at, user);
      const data = {
        playlists,
        id: user.id,
        href: user.external_urls.spotify,
        image: user.images[0].url,
        name: user.display_name,
      };
      console.log(data);
      res.json(data);
    });
});

async function fetchPlaylists(dec_at, user) {
  const data = await fetch(
    `https://api.spotify.com/v1/users/${user.id}/playlists`,
    {
      headers: {
        Authorization: `Bearer ${dec_at}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      return data.items;
    })
    .catch((err) => console.log(err));
  return data;
}

router.get("/setCookie", (req, res) => {
  let { cookie } = req.query;
  res.cookie("at", `${cookie}`, {
    expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
    httpOnly: true,
  });
  res.send("");
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
