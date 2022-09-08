import fetch from "node-fetch";
import querystring from "querystring";
import {
  enc,
  dec,
  encodeFromData,
  shuffle,
  randomInteger,
} from "../../utils.js";

const login = (req, res) => {
  let scope = `user-modify-playback-state user-read-playback-state user-read-currently-playing user-library-modify user-library-read playlist-read playlist-read-private playlist-modify-public`;
  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECTURI}&scope=${scope}&show_dialog=true`
  );
};

const logged = async (req, res) => {
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
};

const getUser = async (req, res) => {
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
      const data = {
        playlists: await fetchPlaylists(dec_at, user),
        id: user.id,
        href: user.external_urls.spotify,
        image: user.images[0].url,
        name: user.display_name,
        followers: user.followers.total,
      };
      res.json(data);
    });
};

const getUserPlaylistTracks = async (req, res) => {
  const access_token = req.headers.cookie;
  const at = access_token.split("=")[1];
  const dec_at = dec(at);
  const playlists = req.body;
  const playlistTracks = await Promise.all(
    playlists.map(async (playlist) => {
      return await fetchPlaylistTracks(
        dec_at,
        playlist.id,
        playlist.length
      );
    })
  );
  const final = [].concat.apply(
    [],
    playlistTracks.map((playlist) => playlist)
  );
  res.status(200).json({
    data: shuffle(final),
  });
};

const createUserPlaylist = async (req, res) => {
  const access_token = req.headers.cookie;
  const at = access_token.split("=")[1];
  const dec_at = dec(at);

  const data = {
    name: `Shuff.le ${randomInteger(0, 100)}`,
    description: "This playlist was generated by SHUFF.LE",
    public: true,
  };
  await fetch(
    `https://api.spotify.com/v1/users/${req.body.id}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dec_at}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(data),
    }
  )
    .then((response) => response.json())
    .then(async (data) => {
      const songs = req.body.playlistTunes
        .map((playlist) => playlist.uri)
        .join(",");
      await addSongToPlaylist(dec_at, data.id, songs);
    });
};

const setCookie = (req, res) => {
  let { cookie } = req.query;
  res.cookie("at", `${cookie}`, {
    expires: new Date(Date.now() + 2 * (60 * 60 * 1000)),
    httpOnly: true,
  });
  res.send("");
};

export {
  login,
  logged,
  getUser,
  getUserPlaylistTracks,
  createUserPlaylist,
  setCookie,
};

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
      return data.items.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        image: playlist?.images[0]?.url,
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

async function fetchPlaylistTracks(dec_at, id, length) {
  const offset = randomInteger(0, length - 20);
  const data = await fetch(
    `https://api.spotify.com/v1/playlists/${id}/tracks?offset=${offset}&limit=20`,
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
      return data.items.map((d) => ({
        url: d.track.external_urls.spotify,
        name: d.track.name,
        image: d.track.album.images[0].url,
        id: d.track.id,
        artists: d.track.artists.map((item) => item.name),
        uri: d.track.uri,
      }));
    })
    .catch((err) => console.log(err));
  return data;
}

async function addSongToPlaylist(dec_at, id, songs) {
  await fetch(
    `	https://api.spotify.com/v1/playlists/${id}/tracks?uris=${songs}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dec_at}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => null);
}