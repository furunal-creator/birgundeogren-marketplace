import {
  type User, type InsertUser, users,
  type Instructor, type InsertInstructor, instructors,
  type Category, type InsertCategory, categories,
  type Course, type InsertCourse, courses,
  type Session, type InsertSession, sessions,
  type Review, type InsertReview, reviews,
  type Order, type InsertOrder, orders,
  type OrderItem, type InsertOrderItem, orderItems,
  type Favorite, type InsertFavorite, favorites,
  type CartItem, type InsertCartItem, cartItems,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, like, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

// ── DB MIGRATION ────────────────────────────────────────
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'STUDENT',
    email_verified INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS instructors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    display_name TEXT NOT NULL,
    bio TEXT NOT NULL,
    expertise_areas TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    linkedin_url TEXT,
    portfolio_url TEXT,
    bank_iban TEXT,
    bank_account_name TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    avg_rating REAL NOT NULL DEFAULT 0,
    total_students INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    image_url TEXT,
    course_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructor_id INTEGER REFERENCES instructors(id),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    description_short TEXT NOT NULL,
    description_detail TEXT NOT NULL,
    duration_hours INTEGER NOT NULL,
    format TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    curriculum TEXT,
    requirements TEXT,
    faq TEXT,
    tags TEXT,
    seo_title TEXT,
    seo_description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    is_featured INTEGER NOT NULL DEFAULT 0,
    avg_rating REAL NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    total_enrolled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location_type TEXT NOT NULL,
    address TEXT,
    online_link TEXT,
    city TEXT,
    capacity INTEGER NOT NULL DEFAULT 20,
    enrolled INTEGER NOT NULL DEFAULT 0,
    early_bird_price REAL,
    early_bird_deadline TEXT,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    is_visible INTEGER NOT NULL DEFAULT 1,
    instructor_reply TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_no TEXT NOT NULL UNIQUE,
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    coupon_code TEXT,
    payment_method TEXT,
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    invoice_type TEXT,
    invoice_data TEXT,
    created_at TEXT NOT NULL,
    paid_at TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    session_id INTEGER NOT NULL REFERENCES sessions(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    instructor_id INTEGER REFERENCES instructors(id),
    unit_price REAL NOT NULL,
    platform_fee REAL NOT NULL,
    instructor_share REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE'
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    session_id INTEGER NOT NULL REFERENCES sessions(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    created_at TEXT NOT NULL
  );
`);

// ── AUTO SEED (if database is empty) ────────────────────
const userCount = sqlite.prepare("SELECT COUNT(*) as cnt FROM users").get() as any;
if (userCount?.cnt === 0) {
  console.log("🌱 Database is empty, running auto-seed...");
  try {
    require("child_process").execSync("npx tsx server/seed.ts", {
      cwd: process.cwd(),
      stdio: "inherit",
      timeout: 120000,
    });
    console.log("✅ Auto-seed completed");
  } catch (e) {
    console.error("⚠️ Auto-seed via script failed, creating admin user...");
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256").update("Admin2026!" + "birgundeogren_salt").digest("hex");
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run("admin@birgundeogren.com", hash, "Admin", "BGO", "ADMIN", 1, 1, new Date().toISOString());
    console.log("✅ Created admin user: admin@birgundeogren.com / Admin2026!");
  }
}



// ── STORAGE INTERFACE ───────────────────────────────────
export interface IStorage {
  // Users
  getUser(id: number): User | undefined;
  getUserByEmail(email: string): User | undefined;
  createUser(user: InsertUser): User;
  updateUser(id: number, data: Partial<InsertUser>): User | undefined;

  // Instructors
  getInstructor(id: number): Instructor | undefined;
  getInstructorByUserId(userId: number): Instructor | undefined;
  createInstructor(data: InsertInstructor): Instructor;
  updateInstructor(id: number, data: Partial<InsertInstructor>): Instructor | undefined;
  listInstructors(): Instructor[];

  // Categories
  getCategory(id: number): Category | undefined;
  getCategoryBySlug(slug: string): Category | undefined;
  listCategories(): Category[];
  createCategory(data: InsertCategory): Category;
  updateCategoryCourseCount(id: number): void;

  // Courses
  getCourse(id: number): Course | undefined;
  getCourseBySlug(slug: string): Course | undefined;
  getCourseByCode(code: string): Course | undefined;
  listCourses(filters?: CourseFilters): { courses: Course[]; total: number };
  listFeaturedCourses(limit?: number): Course[];
  createCourse(data: InsertCourse): Course;
  updateCourse(id: number, data: Partial<InsertCourse>): Course | undefined;

  // Sessions
  getSession(id: number): Session | undefined;
  listSessionsByCourse(courseId: number): Session[];
  createSession(data: InsertSession): Session;
  updateSession(id: number, data: Partial<InsertSession>): Session | undefined;

  // Reviews
  getReview(id: number): Review | undefined;
  listReviewsByCourse(courseId: number): Review[];
  createReview(data: InsertReview): Review;

  // Cart
  getCartItems(userId: number): CartItem[];
  addCartItem(data: InsertCartItem): CartItem;
  removeCartItem(id: number, userId: number): boolean;
  clearCart(userId: number): void;

  // Orders
  getOrder(id: number): Order | undefined;
  listOrdersByUser(userId: number): Order[];
  createOrder(data: InsertOrder): Order;
  createOrderItem(data: InsertOrderItem): OrderItem;
  listOrderItems(orderId: number): OrderItem[];

  // Favorites
  getFavorites(userId: number): Favorite[];
  addFavorite(data: InsertFavorite): Favorite;
  removeFavorite(userId: number, courseId: number): boolean;

  // Instructor stats
  getInstructorStats(instructorId: number): InstructorStats;
  listCoursesByInstructor(instructorId: number): Course[];

  // Admin
  getAdminStats(): AdminStats;
  listAllUsers(): User[];
  listAllInstructors(): InstructorWithUser[];
  countOrders(): number;
}

export interface AdminStats {
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  totalOrders: number;
}

export interface InstructorWithUser extends Instructor {
  user?: User;
}

export interface CourseFilters {
  categoryId?: number;
  format?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export interface InstructorStats {
  totalRevenue: number;
  activeCourses: number;
  totalStudents: number;
  avgRating: number;
}

// ── DATABASE STORAGE IMPLEMENTATION ────────────────────
export class DatabaseStorage implements IStorage {
  // ── USERS ─────────────────────────────────────────────
  getUser(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByEmail(email: string): User | undefined {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  createUser(insertUser: InsertUser): User {
    const now = new Date().toISOString();
    return db.insert(users).values({ ...insertUser, createdAt: now }).returning().get();
  }

  updateUser(id: number, data: Partial<InsertUser>): User | undefined {
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  }

  // ── INSTRUCTORS ───────────────────────────────────────
  getInstructor(id: number): Instructor | undefined {
    return db.select().from(instructors).where(eq(instructors.id, id)).get();
  }

  getInstructorByUserId(userId: number): Instructor | undefined {
    return db.select().from(instructors).where(eq(instructors.userId, userId)).get();
  }

  createInstructor(data: InsertInstructor): Instructor {
    const now = new Date().toISOString();
    return db.insert(instructors).values({ ...data, createdAt: now }).returning().get();
  }

  updateInstructor(id: number, data: Partial<InsertInstructor>): Instructor | undefined {
    return db.update(instructors).set(data).where(eq(instructors.id, id)).returning().get();
  }

  listInstructors(): Instructor[] {
    return db.select().from(instructors).all();
  }

  // ── CATEGORIES ────────────────────────────────────────
  getCategory(id: number): Category | undefined {
    return db.select().from(categories).where(eq(categories.id, id)).get();
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return db.select().from(categories).where(eq(categories.slug, slug)).get();
  }

  listCategories(): Category[] {
    return db.select().from(categories).all();
  }

  createCategory(data: InsertCategory): Category {
    return db.insert(categories).values(data).returning().get();
  }

  updateCategoryCourseCount(id: number): void {
    const result = db.select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(and(eq(courses.categoryId, id), eq(courses.status, "ACTIVE")))
      .get() as { count: number } | undefined;
    db.update(categories)
      .set({ courseCount: result?.count ?? 0 })
      .where(eq(categories.id, id))
      .run();
  }

  // ── COURSES ───────────────────────────────────────────
  getCourse(id: number): Course | undefined {
    return db.select().from(courses).where(eq(courses.id, id)).get();
  }

  getCourseBySlug(slug: string): Course | undefined {
    return db.select().from(courses).where(eq(courses.slug, slug)).get();
  }

  getCourseByCode(code: string): Course | undefined {
    return db.select().from(courses).where(eq(courses.code, code)).get();
  }

  listCourses(filters: CourseFilters = {}): { courses: Course[]; total: number } {
    const {
      categoryId, format, priceMin, priceMax,
      search, sort = "recommended", page = 1, limit = 12,
    } = filters;
    const status = filters.status !== undefined ? filters.status : "ACTIVE";

    // Build the query with wheres
    let baseQuery = db.select().from(courses).$dynamic();

    const conditions: any[] = [];
    if (status) conditions.push(eq(courses.status, status as any));
    if (categoryId) conditions.push(eq(courses.categoryId, categoryId));
    if (format) conditions.push(eq(courses.format, format as any));
    if (priceMin !== undefined) conditions.push(gte(courses.price, priceMin));
    if (priceMax !== undefined) conditions.push(lte(courses.price, priceMax));
    if (search) conditions.push(like(courses.title, `%${search}%`));

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    // Get total for pagination
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(courses).$dynamic();
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = countQuery.get();
    const total = totalResult?.count ?? 0;

    // Sorting
    switch (sort) {
      case "price_asc":
        baseQuery = baseQuery.orderBy(asc(courses.price));
        break;
      case "price_desc":
        baseQuery = baseQuery.orderBy(desc(courses.price));
        break;
      case "rating":
        baseQuery = baseQuery.orderBy(desc(courses.avgRating));
        break;
      case "newest":
        baseQuery = baseQuery.orderBy(desc(courses.createdAt));
        break;
      default:
        baseQuery = baseQuery.orderBy(desc(courses.isFeatured), desc(courses.totalEnrolled));
    }

    const offset = (page - 1) * limit;
    const result = baseQuery.limit(limit).offset(offset).all();

    return { courses: result, total };
  }

  listFeaturedCourses(limit = 8): Course[] {
    return db.select().from(courses)
      .where(and(eq(courses.isFeatured, true), eq(courses.status, "ACTIVE")))
      .orderBy(desc(courses.avgRating))
      .limit(limit)
      .all();
  }

  createCourse(data: InsertCourse): Course {
    const now = new Date().toISOString();
    return db.insert(courses).values({ ...data, createdAt: now }).returning().get();
  }

  updateCourse(id: number, data: Partial<InsertCourse>): Course | undefined {
    return db.update(courses).set(data).where(eq(courses.id, id)).returning().get();
  }

  // ── SESSIONS ──────────────────────────────────────────
  getSession(id: number): Session | undefined {
    return db.select().from(sessions).where(eq(sessions.id, id)).get();
  }

  listSessionsByCourse(courseId: number): Session[] {
    return db.select().from(sessions)
      .where(and(eq(sessions.courseId, courseId), eq(sessions.status, "SCHEDULED")))
      .orderBy(asc(sessions.date))
      .all();
  }

  createSession(data: InsertSession): Session {
    const now = new Date().toISOString();
    return db.insert(sessions).values({ ...data, createdAt: now }).returning().get();
  }

  updateSession(id: number, data: Partial<InsertSession>): Session | undefined {
    return db.update(sessions).set(data).where(eq(sessions.id, id)).returning().get();
  }

  // ── REVIEWS ───────────────────────────────────────────
  getReview(id: number): Review | undefined {
    return db.select().from(reviews).where(eq(reviews.id, id)).get();
  }

  listReviewsByCourse(courseId: number): Review[] {
    return db.select().from(reviews)
      .where(and(eq(reviews.courseId, courseId), eq(reviews.isVisible, true)))
      .orderBy(desc(reviews.createdAt))
      .all();
  }

  createReview(data: InsertReview): Review {
    const now = new Date().toISOString();
    const review = db.insert(reviews).values({ ...data, createdAt: now }).returning().get();
    // Update course avg rating
    const stats = db.select({
      avg: sql<number>`avg(rating)`,
      count: sql<number>`count(*)`,
    }).from(reviews).where(eq(reviews.courseId, data.courseId)).get();
    if (stats) {
      db.update(courses)
        .set({ avgRating: stats.avg ?? 0, reviewCount: stats.count ?? 0 })
        .where(eq(courses.id, data.courseId))
        .run();
    }
    return review;
  }

  // ── CART ──────────────────────────────────────────────
  getCartItems(userId: number): CartItem[] {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId)).all();
  }

  addCartItem(data: InsertCartItem): CartItem {
    const now = new Date().toISOString();
    return db.insert(cartItems).values({ ...data, createdAt: now }).returning().get();
  }

  removeCartItem(id: number, userId: number): boolean {
    const result = db.delete(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)))
      .run();
    return result.changes > 0;
  }

  clearCart(userId: number): void {
    db.delete(cartItems).where(eq(cartItems.userId, userId)).run();
  }

  // ── ORDERS ────────────────────────────────────────────
  getOrder(id: number): Order | undefined {
    return db.select().from(orders).where(eq(orders.id, id)).get();
  }

  listOrdersByUser(userId: number): Order[] {
    return db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .all();
  }

  createOrder(data: InsertOrder): Order {
    const now = new Date().toISOString();
    return db.insert(orders).values({ ...data, createdAt: now }).returning().get();
  }

  createOrderItem(data: InsertOrderItem): OrderItem {
    return db.insert(orderItems).values(data).returning().get();
  }

  listOrderItems(orderId: number): OrderItem[] {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();
  }

  // ── FAVORITES ─────────────────────────────────────────
  getFavorites(userId: number): Favorite[] {
    return db.select().from(favorites).where(eq(favorites.userId, userId)).all();
  }

  addFavorite(data: InsertFavorite): Favorite {
    const now = new Date().toISOString();
    return db.insert(favorites).values({ ...data, createdAt: now }).returning().get();
  }

  removeFavorite(userId: number, courseId: number): boolean {
    const result = db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.courseId, courseId)))
      .run();
    return result.changes > 0;
  }

  // ── INSTRUCTOR STATS ──────────────────────────────────
  getInstructorStats(instructorId: number): InstructorStats {
    const activeCourses = db.select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.status, "ACTIVE")))
      .get()?.count ?? 0;

    const instructor = this.getInstructor(instructorId);
    const totalStudents = instructor?.totalStudents ?? 0;
    const avgRating = instructor?.avgRating ?? 0;

    // Revenue from paid orders
    const revenueResult = db.select({ total: sql<number>`sum(instructor_share)` })
      .from(orderItems)
      .where(eq(orderItems.instructorId, instructorId))
      .get();

    return {
      totalRevenue: revenueResult?.total ?? 0,
      activeCourses,
      totalStudents,
      avgRating,
    };
  }

  listCoursesByInstructor(instructorId: number): Course[] {
    return db.select().from(courses)
      .where(eq(courses.instructorId, instructorId))
      .orderBy(desc(courses.createdAt))
      .all();
  }

  // ── ADMIN ─────────────────────────────────────────────
  getAdminStats(): AdminStats {
    const totalUsers = db.select({ count: sql<number>`count(*)` }).from(users).get()?.count ?? 0;
    const totalInstructors = db.select({ count: sql<number>`count(*)` }).from(instructors).get()?.count ?? 0;
    const totalCourses = db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.status, "ACTIVE")).get()?.count ?? 0;
    const totalOrders = db.select({ count: sql<number>`count(*)` }).from(orders).get()?.count ?? 0;
    return { totalUsers, totalInstructors, totalCourses, totalOrders };
  }

  listAllUsers(): User[] {
    return db.select().from(users).orderBy(desc(users.createdAt)).all();
  }

  listAllInstructors(): InstructorWithUser[] {
    const instrList = db.select().from(instructors).orderBy(desc(instructors.createdAt)).all();
    return instrList.map(instr => {
      const u = db.select().from(users).where(eq(users.id, instr.userId)).get();
      return { ...instr, user: u };
    });
  }

  countOrders(): number {
    return db.select({ count: sql<number>`count(*)` }).from(orders).get()?.count ?? 0;
  }
}

export const storage = new DatabaseStorage();
