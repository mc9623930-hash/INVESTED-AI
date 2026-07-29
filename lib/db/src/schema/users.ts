import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  username: text("username").unique(),
  avatarId: text("avatar_id").default("🦁"),
  dob: text("dob"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userDataTable = pgTable("user_data", {
  userId: text("user_id").primaryKey().references(() => usersTable.id, { onDelete: "cascade" }),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  streak: integer("streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  badges: jsonb("badges").$type<string[]>().default([]).notNull(),
  riskProfile: jsonb("risk_profile").$type<Record<string, unknown> | null>().default(null),
  academyProgress: jsonb("academy_progress").$type<Record<string, unknown>>().default({}).notNull(),
  completedModules: jsonb("completed_modules").$type<string[]>().default([]).notNull(),
  watchlist: jsonb("watchlist").$type<string[]>().default([]).notNull(),
  portfolioValue: integer("portfolio_value").default(100000).notNull(),
  portfolioReturn: integer("portfolio_return").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type UserData = typeof userDataTable.$inferSelect;
