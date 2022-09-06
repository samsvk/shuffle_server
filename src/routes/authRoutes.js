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

      // const playlistTracks = await Promise.all(
      //   playlists.map(async (playlist) => {
      //     return await fetchPlaylistTracks(dec_at, playlist.id);
      //   })
      // );

      const data = {
        playlists,
        // playlistTracks,
        id: user.id,
        href: user.external_urls.spotify,
        image: user.images[0].url,
        name: user.display_name,
      };
      res.json(data);
    });
});

router.get("/setCookie", (req, res) => {
  let { cookie } = req.query;
  res.cookie("at", `${cookie}`, {
    expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
    httpOnly: true,
  });
  res.send("");
});

// async function fetchPlaylistTracks(dec_at, id) {
//   const data = await fetch(
//     `https://api.spotify.com/v1/playlists/${id}/tracks?limit=50`,
//     {
//       headers: {
//         Authorization: `Bearer ${dec_at}`,
//         Accept: "application/json",
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     }
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       return data.items.map((d) => ({
//         url: d.track.external_urls.spotify,
//         name: d.track.name,
//         image: d.track.album.images[0].url,
//         id: d.track.id,
//         artists: d.track.artists.map((item) => item.name),
//       }));
//     })
//     .catch((err) => console.log(err));
//   return data;
// }

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
      console.log(data.items[2]);
      return data.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        image: playlist.images[0].url,
        length: playlist.tracks.total,
        owner: {
          name: playlist.owner.display_name,
          url: playlist.owner.external_urls.spotify,
        },
      }));
    })
    .catch((err) => console.log(err));
  return data;
}
