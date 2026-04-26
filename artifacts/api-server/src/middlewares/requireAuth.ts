import { type Request, type Response, type NextFunction } from "express";
import { supabase } from "../supabase.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  (req as Request & { userId: string }).userId = user.id;
  next();
}
