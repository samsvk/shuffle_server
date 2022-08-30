import express from "express";
import cors from "cors";
import { router as testRouter } from "./routes/index.js";

const PORT = process.env.port || 3001;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.listen(PORT, () => console.log(`Now listening on ${PORT}`));

app.use("/test", testRouter);
