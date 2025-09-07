import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP for development
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}

// No authentication middleware - allow all requests through
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Always set a default user for any routes that might need it
  (req as any).user = {
    id: 'agent_user',
    email: 'agent@system.local',
    firstName: 'Agent',
    lastName: 'User'
  };
  return next();
};