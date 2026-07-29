import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, userDataTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET || "invesed-ai-secret-key-change-in-prod";
const JWT_EXPIRES = "30d";

function makeToken(userId: string) {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token: string): { uid: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { uid: string };
  } catch {
    return null;
  }
}

function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = randomUUID();

    await db.insert(usersTable).values({
      id,
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    await db.insert(userDataTable).values({ userId: id });

    const token = makeToken(id);
    return res.json({
      token,
      user: { uid: id, email: email.toLowerCase().trim(), displayName: null, photoURL: null },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
    if (!user) {
      return res.status(401).json({ error: "No account found with this email address." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    const token = makeToken(user.id);
    return res.json({
      token,
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarId: user.avatarId,
        dob: user.dob,
        photoURL: null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.get("/me", async (req, res) => {
  const token = getTokenFromHeader(req.headers.authorization);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token." });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.uid)).limit(1);
  if (!user) return res.status(404).json({ error: "User not found." });

  const [data] = await db.select().from(userDataTable).where(eq(userDataTable.userId, payload.uid)).limit(1);

  return res.json({
    user: {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      avatarId: user.avatarId,
      dob: user.dob,
      photoURL: null,
    },
    userData: data || null,
  });
});

router.put("/profile", async (req, res) => {
  const token = getTokenFromHeader(req.headers.authorization);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token." });

  try {
    const { displayName, username, avatarId, dob } = req.body as {
      displayName?: string;
      username?: string;
      avatarId?: string;
      dob?: string;
    };

    await db.update(usersTable)
      .set({ displayName, username, avatarId, dob })
      .where(eq(usersTable.id, payload.uid));

    return res.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

router.put("/progress", async (req, res) => {
  const token = getTokenFromHeader(req.headers.authorization);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token." });

  try {
    const { xp, level, streak, longestStreak, badges, riskProfile, academyProgress, completedModules, watchlist, portfolioValue, portfolioReturn } = req.body;

    await db.update(userDataTable)
      .set({
        xp,
        level,
        streak,
        longestStreak,
        badges,
        riskProfile,
        academyProgress,
        completedModules,
        watchlist,
        portfolioValue,
        portfolioReturn,
        updatedAt: new Date(),
      })
      .where(eq(userDataTable.userId, payload.uid));

    return res.json({ success: true });
  } catch (err) {
    console.error("Progress save error:", err);
    return res.status(500).json({ error: "Failed to save progress." });
  }
});

export default router;
