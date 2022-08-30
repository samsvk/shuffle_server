import express from "express";
import { doSomething } from "./controllers.js";

export const router = express.Router();

router.get("/", doSomething);
