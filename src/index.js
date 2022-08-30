import express from "express";
import cors from "cors";
import { router as emailRouter } from "./routes/index.js";
import { corsDefaults } from "./consts.js";
import { db } from "./models/db.js";

const PORT = process.env.port || 3001;
const app = express();

app.use(cors(corsDefaults));
app.use(express.json());
db.then(() => console.log("DB connected")).catch((err) =>
  console.log(err)
);
app.listen(PORT, () => console.log(`Now listening on ${PORT}`));

app.use("/email", emailRouter);
