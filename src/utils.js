import CryptoJS from "crypto-js";

// function encrypt(token) {
//   return CryptoJS.AES.encrypt(token, "0038");
// }

// function decrypt(token) {
//   return CryptoJS.AES.decrypt(token, "0038");
// }

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

function enc(plainText) {
  let b64 = CryptoJS.AES.encrypt(plainText, "0038").toString();
  let e64 = CryptoJS.enc.Base64.parse(b64);
  let eHex = e64.toString(CryptoJS.enc.Hex);
  return eHex;
}

function dec(cipherText) {
  let reb64 = CryptoJS.enc.Hex.parse(cipherText);
  let bytes = reb64.toString(CryptoJS.enc.Base64);
  let decrypt = CryptoJS.AES.decrypt(bytes, "0038");
  let plain = decrypt.toString(CryptoJS.enc.Utf8);
  return plain;
}

function isAuth(req, res, next) {
  if (req.user) {
    console.log(req.user.username);
    next();
  } else {
    console.log("user is not logged in KEKW");
    res.redirect("/");
  }
}

export { enc, dec, encodeFromData };
