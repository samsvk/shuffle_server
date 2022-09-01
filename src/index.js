import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { router as emailRouter } from "./routes/index.js";
import { corsDefaults } from "./consts.js";
import { db } from "./models/db.js";

const PORT = process.env.port || 3001;
const app = express();

app.use(cors(corsDefaults));
app.use(express.json());
app.use(bodyParser.json());
db.then(() => console.log("DB connected")).catch((err) =>
  console.log(err)
);
app.listen(PORT, () => console.log(`Now listening on ${PORT}`));

app.use("/", (req, res) =>
  res.json({
    msg: "hello working",
  })
);
app.use("/email", emailRouter);

app.post("/incoming_mails/", (req, res) => {
  const mail = req.body;
  res.status(201).json(mail);
});
