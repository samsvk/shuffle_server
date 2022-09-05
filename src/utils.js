import CryptoJS from "crypto-js";

function encrypt(token) {
  return CryptoJS.AES.encrypt(token, "woopdi");
}

function decrypt(token) {
  return CryptoJS.AES.decrypt(token, "woopdi");
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

export { encrypt, decrypt };
