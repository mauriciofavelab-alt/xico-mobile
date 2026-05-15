import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import rateLimit from "express-rate-limit";
import { logger } from "./lib/logger.js";
import router from "./routes/index.js";

const app: Express = express();

// Trust Railway's edge proxy so req.ip reflects the real client IP for
// rate-limit keying. Without this every request looks like it comes from
// the same Railway internal IP and rate limiting becomes useless.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ─── CORS allowlist · 2026-05-15 security pass ─────────────────────────────
// Previously `cors()` with no options sent Access-Control-Allow-Origin: *
// which weakened defense-in-depth. The native iOS app fetches without an
// Origin header so it ignores CORS regardless · only browsers care, and the
// only browsers that should be calling this API are xico.app + dev origins.
const ALLOWED_ORIGINS = [
  "https://xico.app",
  /\.xico\.app$/,
  // Local dev origins for xico-web marketing site
  "http://localhost:3001",
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser requests (mobile native fetch, server-to-server) have
      // no Origin header · allow them through. CORS is browser-only defense.
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGINS.some((rule) =>
        typeof rule === "string" ? rule === origin : rule.test(origin),
      );
      if (allowed) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: false,
  }),
);

app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb" }));

// ─── Rate limiting · 2026-05-15 security pass ──────────────────────────────
// Three tiers:
//   1. Global · 120 req/min per IP · catches blind hammering
//   2. Strict · 12 req/min for visit-token + sello-earn · anti-cheat
//   3. Auth · 6 req/min for magic-link triggers · anti-enumeration
//
// Keyed by req.ip (Express trusts the proxy header thanks to trust proxy
// above). For authenticated routes we could key by user id, but visit-token
// happens BEFORE the sello-earn auth check so IP is the only stable key
// at that boundary.

const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Try again in a moment." },
});

const strictLimiter = rateLimit({
  windowMs: 60_000,
  limit: 12,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Slow down." },
});

const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 6,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Wait a minute." },
});

app.use("/api", globalLimiter);
// Strict ceiling on the gamification mutation endpoints.
app.use(/^\/api\/ruta-stops\/[^/]+\/visit-token$/, strictLimiter);
app.use("/api/sellos-rumbo", strictLimiter);
// Magic-link triggers (any future auth endpoint) get the tighter cap.
app.use("/api/auth", authLimiter);

app.use("/api", router);

// 404 handler · no console.log spam · structured log only
app.use((req: Request, res: Response) => {
  logger.debug({ method: req.method, url: req.url }, "404 unmatched route");
  res.status(404).json({ error: "Not found" });
});

// Global error handler · strips internal stack traces in production
// Avoids leaking schema/column names from Supabase errors back to clients.
const IS_PROD = process.env.NODE_ENV === "production";
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, url: req.url }, "request failed");
  if (res.headersSent) return;
  if (IS_PROD) {
    res.status(500).json({ error: "Internal error" });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export default app;
