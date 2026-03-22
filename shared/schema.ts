import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── USERS ───────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["STUDENT", "INSTRUCTOR", "ADMIN"] }).notNull().default("STUDENT"),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── INSTRUCTORS ─────────────────────────────────────
export const instructors = sqliteTable("instructors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  displayName: text("display_name").notNull(),
  bio: text("bio").notNull(),
  expertiseAreas: text("expertise_areas").notNull(), // JSON array
  experienceYears: integer("experience_years").notNull(),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  bankIban: text("bank_iban"),
  bankAccountName: text("bank_account_name"),
  status: text("status", { enum: ["PENDING", "REVIEW", "APPROVED", "REJECTED", "SUSPENDED"] }).notNull().default("PENDING"),
  avgRating: real("avg_rating").notNull().default(0),
  totalStudents: integer("total_students").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertInstructorSchema = createInsertSchema(instructors).omit({ id: true, createdAt: true });
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type Instructor = typeof instructors.$inferSelect;

// ─── CATEGORIES ──────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  imageUrl: text("image_url"),
  courseCount: integer("course_count").notNull().default(0),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ─── COURSES ─────────────────────────────────────────
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  instructorId: integer("instructor_id").references(() => instructors.id),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  descriptionShort: text("description_short").notNull(),
  descriptionDetail: text("description_detail").notNull(),
  durationHours: integer("duration_hours").notNull(),
  format: text("format", { enum: ["PHYSICAL", "ONLINE", "HYBRID"] }).notNull(),
  price: real("price").notNull(),
  imageUrl: text("image_url"),
  curriculum: text("curriculum"), // JSON
  requirements: text("requirements"), // JSON
  faq: text("faq"), // JSON
  tags: text("tags"), // JSON array
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  status: text("status", { enum: ["DRAFT", "REVIEW", "ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  avgRating: real("avg_rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  totalEnrolled: integer("total_enrolled").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// ─── SESSIONS ────────────────────────────────────────
export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  locationType: text("location_type", { enum: ["PHYSICAL", "ONLINE"] }).notNull(),
  address: text("address"),
  onlineLink: text("online_link"),
  city: text("city"),
  capacity: integer("capacity").notNull().default(20),
  enrolled: integer("enrolled").notNull().default(0),
  earlyBirdPrice: real("early_bird_price"),
  earlyBirdDeadline: text("early_bird_deadline"),
  status: text("status", { enum: ["SCHEDULED", "FULL", "COMPLETED", "CANCELLED"] }).notNull().default("SCHEDULED"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true, createdAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// ─── REVIEWS ─────────────────────────────────────────
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  instructorReply: text("instructor_reply"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// ─── ORDERS ──────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  orderNo: text("order_no").notNull().unique(),
  subtotal: real("subtotal").notNull(),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull(),
  couponCode: text("coupon_code"),
  paymentMethod: text("payment_method", { enum: ["CREDIT_CARD", "BANK_TRANSFER"] }),
  paymentStatus: text("payment_status", { enum: ["PENDING", "PAID", "FAILED", "REFUNDED"] }).notNull().default("PENDING"),
  invoiceType: text("invoice_type", { enum: ["INDIVIDUAL", "CORPORATE"] }),
  invoiceData: text("invoice_data"), // JSON
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  paidAt: text("paid_at"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// ─── ORDER ITEMS ─────────────────────────────────────
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id),
  sessionId: integer("session_id").notNull().references(() => sessions.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  instructorId: integer("instructor_id").references(() => instructors.id),
  unitPrice: real("unit_price").notNull(),
  platformFee: real("platform_fee").notNull(),
  instructorShare: real("instructor_share").notNull(),
  status: text("status", { enum: ["ACTIVE", "CANCELLED", "REFUNDED"] }).notNull().default("ACTIVE"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// ─── FAVORITES ───────────────────────────────────────
export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// ─── CART ITEMS ──────────────────────────────────────
export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").notNull().references(() => sessions.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
