import express from "express";
import fetch from "node-fetch";
import { generateRandomNumber } from "../utils.js";
import dotenv from "dotenv";
export const router = express.Router();
dotenv.config();

const basic = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

const getAccessToken = async () => {
  const response = await fetch(
    `https://accounts.spotify.com/api/token`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    }
  );

  return response.json();
};

async function fetchArtistDetails(access_token, person) {
  const info = await fetch(
    `	https://api.spotify.com/v1/artists/${person}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
    .then((resp) => resp.json())
    .then((data) => {
      return {
        genres: data.genres,
        image: data.images[0].url,
        name: data.name,
        followers: data.followers.total,
      };
    });
  return info;
}

router.get("/", async (req, res) => {
  const { access_token } = await getAccessToken();

  async function randomSpotifyAritst() {
    await fetch(
      `	https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
      .then((resp) => resp.json())
      .then(async (data) => {
        const newTrack =
          data.tracks.items[generateRandomNumber()].track;
        const info = {
          artists: newTrack.artists.map((item) => item.name),
          name: newTrack.name,
          image: newTrack.album.images[0].url,
          mainArtistInfo: await fetchArtistDetails(
            access_token,
            newTrack.artists[0].id
          ),
        };

        res.status(200).json({
          data: info,
        });
      })
      .catch((err) => console.log(err));
  }
  await randomSpotifyAritst();
});
