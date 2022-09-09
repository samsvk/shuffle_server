import CryptoJS from "crypto-js";

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

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export { enc, dec, encodeFromData, shuffle, randomInteger };
