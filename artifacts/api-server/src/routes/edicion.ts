import { Router, type IRouter } from "express";
import articlesData from "./articles-data.js";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({
    month: "Marzo 2026",
    headline: "México en Madrid: la nueva presencia",
    subheadline: "Arte, gastronomía, danza y literatura desde la diáspora",
    imageKey: "gastronomia-fina",
    accentColor: "magenta",
    articles: articlesData.filter(a => a.featured)
  });
});

export default router;