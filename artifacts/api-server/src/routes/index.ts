import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import articlesRouter from "./articles.js";
import savedRouter from "./saved.js";
import profileRouter from "./profile.js";
import momentosRouter from "./momentos.js";
import eventsRouter from "./events.js";
import spotsRouter from "./spots.js";
import rutaRouter from "./ruta.js";
import edicionRouter from "./edicion.js";
import ttsRouter from "./tts.js";

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/articles", articlesRouter);
router.use("/momentos", momentosRouter);
router.use("/events", eventsRouter);
router.use("/spots", spotsRouter);
router.use("/ruta", rutaRouter);
router.use("/edicion", edicionRouter);
router.use("/tts", ttsRouter);
router.use("/saved", savedRouter);
router.use("/profile", profileRouter);

export default router;