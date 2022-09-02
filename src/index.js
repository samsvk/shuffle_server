import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { corsDefaults } from "./consts.js";
// import { router as emailRouter } from "./routes/index.js";
// import { db } from "./models/db.js";
// db.then(() => console.log("DB connected")).catch((err) =>
//   console.log(err)
// );
// const PORT = process.env.PORT || 3001;
import { router as authRouter } from "./routes/authRoutes.js";
import { router as homeRouter } from "./routes/homeRoutes.js";
dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use(cors(corsDefaults));
app.use(express.json());
// app.use(urlencoded({ extended: true }));
app.listen(PORT, () => console.log(`Now listening on ${PORT}`));

// app.use("/", (req, res) =>
//   res.json({
//     msg: "hello working",
//   })
// );

app.use("/", authRouter);

app.use("/home", homeRouter);

// app.use("/email", emailRouter);
