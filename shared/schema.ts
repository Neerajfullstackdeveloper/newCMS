import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  employeeId: text("employee_id").notNull().unique(),
  role: text("role").notNull().default("employee"), // employee, tl, manager, admin
  isActive: boolean("is_active").notNull().default(true),
  loginTime: timestamp("login_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  website: text("website"),
  companySize: text("company_size"),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, inactive
  assignedToUserId: integer("assigned_to_user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // followup, hot, block
  commentDate: timestamp("comment_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dataRequests = pgTable("data_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  requestType: text("request_type").notNull(),
  industry: text("industry"),
  justification: text("justification").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by"),
  companiesAssigned: integer("companies_assigned").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  duration: text("duration").notNull().default("full_day"), // full_day, half_day, extended
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const facebookDataRequests = pgTable("facebook_data_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  justification: text("justification").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  dataRequests: many(dataRequests),
  assignedCompanies: many(companies),
  facebookDataRequests: many(facebookDataRequests),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [companies.assignedToUserId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  company: one(companies, {
    fields: [comments.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const dataRequestsRelations = relations(dataRequests, ({ one }) => ({
  user: one(users, {
    fields: [dataRequests.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [dataRequests.approvedBy],
    references: [users.id],
  }),
}));

export const facebookDataRequestsRelations = relations(facebookDataRequests, ({ one }) => ({
  user: one(users, {
    fields: [facebookDataRequests.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [facebookDataRequests.approvedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  employeeId: true,
  role: true,
});

export const insertCompanySchema = createInsertSchema(companies).pick({
  name: true,
  industry: true,
  email: true,
  phone: true,
  address: true,
  website: true,
  companySize: true,
  notes: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  companyId: true,
  content: true,
  category: true,
  commentDate: true,
});

export const insertDataRequestSchema = createInsertSchema(dataRequests).pick({
  requestType: true,
  industry: true,
  justification: true,
});

export const insertHolidaySchema = createInsertSchema(holidays).pick({
  name: true,
  date: true,
  description: true,
  duration: true,
});

export const insertFacebookDataRequestSchema = createInsertSchema(facebookDataRequests).pick({
  justification: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type DataRequest = typeof dataRequests.$inferSelect;
export type InsertDataRequest = z.infer<typeof insertDataRequestSchema>;
export type Holiday = typeof holidays.$inferSelect;
export type InsertHoliday = z.infer<typeof insertHolidaySchema>;
export type FacebookDataRequest = typeof facebookDataRequests.$inferSelect;
export type InsertFacebookDataRequest = z.infer<typeof insertFacebookDataRequestSchema>;
