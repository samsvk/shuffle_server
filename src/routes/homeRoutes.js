import express from "express";
import fetch from "node-fetch";
import querystring from "querystring";

function generateRandomLetter() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

export const router = express.Router();

router.get("/", async (req, res) => {
  async function randomSpotifyAritst() {
    await fetch(
      `https://api.spotify.com/v1/search?q="%25${generateRandomLetter()}%25"k&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OAUTH_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data.tracks.items);
      });
  }

  await randomSpotifyAritst();

  res.status(201).json({ working: true });
});
