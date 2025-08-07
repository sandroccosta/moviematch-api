import express from "express";
import { buscarFilme } from "../../controllers/filmeController.js";

const router = express.Router();

router.get("/", buscarFilme);

export default router;
