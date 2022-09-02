import express from "express";
import fetch from "node-fetch";
import { generateRandomLetter } from "../utils.js";
import dotenv from "dotenv";
export const router = express.Router();
dotenv.config();

const basic = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

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

router.get("/", async (req, res) => {
  const { access_token } = await getAccessToken();

  async function randomSpotifyAritst() {
    await fetch(
      `https://api.spotify.com/v1/search?q="%25${generateRandomLetter()}%25"k&type=artist&limit=1`,
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
        console.log(data);
        res.status(200).json({ data });
      })
      .catch((err) => console.log(err));
  }
  await randomSpotifyAritst();
});
