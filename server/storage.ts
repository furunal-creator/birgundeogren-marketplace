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
  console.log("🌱 Database empty — seeding 80 courses, 20 instructors...");
  const crypto = require("crypto");
  const adminHash = crypto.createHash("sha256").update("Admin2026!" + "birgundeogren_salt").digest("hex");
  const now = new Date().toISOString();
  try {
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("admin@birgundeogren.com", adminHash, "Admin", "BGO", "ADMIN", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("Gastronomi", "gastronomi", "#D4451A", "\ud83c\udf73", "./assets/categories/cat_gastronomi.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("El Sanatlar\u0131", "el-sanatlari", "#B87333", "\ud83c\udfa8", "./assets/categories/cat_elsanatlari.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("AI & Dijital", "ai-ve-dijital", "#1E3A5F", "\ud83e\udd16", "./assets/categories/cat_ai_dijital.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("Finans", "finans", "#1B5E20", "\ud83d\udcb0", "./assets/categories/cat_finans.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("Giri\u015fimcilik", "girisimcilik", "#E65100", "\ud83d\ude80", "./assets/categories/cat_girisimcilik.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("Yarat\u0131c\u0131 \u00dcretim", "yaratici-uretim", "#6A1B9A", "\u2728", "./assets/categories/cat_yaratici.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("Sa\u011fl\u0131k & Wellbeing", "saglik-ve-wellbeing", "#00695C", "\ud83e\uddd8", "./assets/categories/cat_saglik.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("Sosyal Yetkinlikler", "sosyal-yetkinlikler", "#4E342E", "\ud83e\udd1d", "./assets/categories/cat_sosyal.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("\u00c7ocuklu Ebeveynlere Y\u00f6nelik", "cocuklu-ebeveynlere-yonelik", "#F57F17", "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67", "./assets/categories/cat_ebeveyn.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO categories (name, slug, color, icon, image_url, course_count) VALUES (?, ?, ?, ?, ?, ?)").run("Kurumsal \u00c7al\u0131\u015fanlara Y\u00f6nelik", "kurumsal-calisanlara-yonelik", "#263238", "\ud83c\udfe2", "./assets/categories/cat_kurumsal.jpg", 0);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("dr-ayse-demir@egitimci.com", adminHash, "Dr.", "Ay\u015fe Demir", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("mehmet-ozkan@egitimci.com", adminHash, "Mehmet", "\u00d6zkan", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("prof-dr-elif-yildirim@egitimci.com", adminHash, "Prof.", "Dr. Elif Y\u0131ld\u0131r\u0131m", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("baris-aydin@egitimci.com", adminHash, "Bar\u0131\u015f", "Ayd\u0131n", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("sef-deniz-korkmaz@egitimci.com", adminHash, "\u015eef", "Deniz Korkmaz", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("selin-arslan@egitimci.com", adminHash, "Selin", "Arslan", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("caner-bilgin@egitimci.com", adminHash, "Caner", "Bilgin", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("zehra-sahin@egitimci.com", adminHash, "Zehra", "\u015eahin", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("emre-celik@egitimci.com", adminHash, "Emre", "\u00c7elik", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("gul-erdogan@egitimci.com", adminHash, "G\u00fcl", "Erdo\u011fan", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("hakan-tuncer@egitimci.com", adminHash, "Hakan", "Tuncer", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("burcu-karaca@egitimci.com", adminHash, "Burcu", "Karaca", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("tolga-yilmaz@egitimci.com", adminHash, "Tolga", "Y\u0131lmaz", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("irem-basaran@egitimci.com", adminHash, "\u0130rem", "Ba\u015faran", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("kemal-dogan@egitimci.com", adminHash, "Kemal", "Do\u011fan", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("naz-kaya@egitimci.com", adminHash, "Naz", "Kaya", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("serhat-ozturk@egitimci.com", adminHash, "Serhat", "\u00d6zt\u00fcrk", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("defne-aksoy@egitimci.com", adminHash, "Defne", "Aksoy", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("ozan-gunes@egitimci.com", adminHash, "Ozan", "G\u00fcne\u015f", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, role, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("pinar-cetin@egitimci.com", adminHash, "P\u0131nar", "\u00c7etin", "INSTRUCTOR", 1, 1, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "Dr. Ay\u015fe Demir", "Alanında uzman eğitimci", "[]", 5, "APPROVED", 4.5, 200, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(3, "Mehmet \u00d6zkan", "Alanında uzman eğitimci", "[]", 6, "APPROVED", 4.6, 250, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(4, "Prof. Dr. Elif Y\u0131ld\u0131r\u0131m", "Alanında uzman eğitimci", "[]", 7, "APPROVED", 4.7, 300, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(5, "Bar\u0131\u015f Ayd\u0131n", "Alanında uzman eğitimci", "[]", 8, "APPROVED", 4.8, 350, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(6, "\u015eef Deniz Korkmaz", "Alanında uzman eğitimci", "[]", 9, "APPROVED", 4.9, 400, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(7, "Selin Arslan", "Alanında uzman eğitimci", "[]", 10, "APPROVED", 4.5, 450, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(8, "Caner Bilgin", "Alanında uzman eğitimci", "[]", 11, "APPROVED", 4.6, 500, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(9, "Zehra \u015eahin", "Alanında uzman eğitimci", "[]", 12, "APPROVED", 4.7, 550, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(10, "Emre \u00c7elik", "Alanında uzman eğitimci", "[]", 13, "APPROVED", 4.8, 600, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(11, "G\u00fcl Erdo\u011fan", "Alanında uzman eğitimci", "[]", 14, "APPROVED", 4.9, 650, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(12, "Hakan Tuncer", "Alanında uzman eğitimci", "[]", 15, "APPROVED", 4.5, 700, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(13, "Burcu Karaca", "Alanında uzman eğitimci", "[]", 16, "APPROVED", 4.6, 750, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(14, "Tolga Y\u0131lmaz", "Alanında uzman eğitimci", "[]", 17, "APPROVED", 4.7, 800, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(15, "\u0130rem Ba\u015faran", "Alanında uzman eğitimci", "[]", 18, "APPROVED", 4.8, 850, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(16, "Kemal Do\u011fan", "Alanında uzman eğitimci", "[]", 19, "APPROVED", 4.9, 900, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(17, "Naz Kaya", "Alanında uzman eğitimci", "[]", 5, "APPROVED", 4.5, 950, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(18, "Serhat \u00d6zt\u00fcrk", "Alanında uzman eğitimci", "[]", 6, "APPROVED", 4.6, 1000, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(19, "Defne Aksoy", "Alanında uzman eğitimci", "[]", 7, "APPROVED", 4.7, 1050, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(20, "Ozan G\u00fcne\u015f", "Alanında uzman eğitimci", "[]", 8, "APPROVED", 4.8, 1100, now);
    sqlite.prepare("INSERT OR IGNORE INTO instructors (user_id, display_name, bio, expertise_areas, experience_years, status, avg_rating, total_students, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(21, "P\u0131nar \u00c7etin", "Alanında uzman eğitimci", "[]", 9, "APPROVED", 4.9, 1150, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(3, "E025", "Canva Pro ile Grafik Tasar\u0131m: Marka G\u00f6rseli G\u00fcn\u00fc", "canva-pro-ile-grafik-tasarim-marka-gorseli-gunu", 3, "\"Tasar\u0131mc\u0131 olmadan profesyonel g\u00f6r\u00fcns\u00fcn \u2014 Canva'n\u0131n t\u00fcm g\u00fcc\u00fcn\u00fc bug\u00fcn ke\u015ffedin.\"", "KOB\u0130 sahipleri ve giri\u015fimciler markalar\u0131 i\u00e7in grafik tasar\u0131mc\u0131ya \u00f6deme yapmak yerine kendi tasar\u0131mlar\u0131n\u0131 yapmak istiyor; Canva'y\u0131 y\u00fczeysel kullan\u0131p profesyonel sonu\u00e7 alam\u0131yorlar.", 5, "ONLINE", 1800, "./assets/courses/E025.jpg", "ACTIVE", 1, 4.7, 12, 151, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(7, "E019", "ChatGPT \u0130\u015f Hayat\u0131 H\u0131zland\u0131r\u0131c\u0131: Prompt M\u00fchendisli\u011fi G\u00fcn\u00fc", "chatgpt-is-hayati-hizlandirici-prompt-muhendisligi-gunu", 3, "\"\u00c7al\u0131\u015fma saatlerinizin %40'\u0131n\u0131 geri kazan\u0131n \u2014 tek g\u00fcnl\u00fck ChatGPT ustas\u0131 olun.\"", "\u00c7al\u0131\u015fanlar\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu ChatGPT'yi y\u00fczeysel kullan\u0131yor; sistematik prompt m\u00fchendisli\u011fi bilgisi olmadan verimlilik kazan\u0131m\u0131 %20'de kal\u0131rken, do\u011fru tekniklerle bu oran %70'e \u00e7\u0131kabiliyor.", 6, "ONLINE", 2500, "./assets/courses/E019.jpg", "ACTIVE", 1, 4.9, 44, 36, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(9, "E022", "Dijital Pazarlama Bootcamp: Meta & Google Ads G\u00fcn\u00fc", "dijital-pazarlama-bootcamp-meta-ve-google-ads-gunu", 3, "\"Her lira reklam b\u00fct\u00e7enizi 5 liraya \u00e7evirin \u2014 reklam ba\u015flang\u0131c\u0131n\u0131z\u0131 bug\u00fcn yap\u0131n.\"", "Sosyal medya reklamc\u0131l\u0131\u011f\u0131 T\u00fcrkiye'de hem k\u00fc\u00e7\u00fck hem b\u00fcy\u00fck i\u015fletmelerin zorunlu b\u00fcy\u00fcme kanal\u0131 haline geldi; ancak reklam b\u00fct\u00e7esi bo\u015fa ak\u0131t\u0131lmadan hedefleme ve \u00f6l\u00e7\u00fcm yapabilmek i\u00e7in sistematik e\u011fitim \u015fart.", 7, "ONLINE", 3000, "./assets/courses/E022.jpg", "ACTIVE", 1, 4.5, 30, 115, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(3, "E024", "E-Ticaret Kurulumu: Trendyol & Etsy'de Ma\u011faza A\u00e7ma G\u00fcn\u00fc", "e-ticaret-kurulumu-trendyol-ve-etsy-de-magaza-acma-gunu", 3, "\"Bug\u00fcn ma\u011fazan\u0131z\u0131 a\u00e7\u0131n, bu hafta ilk sipari\u015finizi al\u0131n.\"", "El i\u015fi yapan, \u00fcr\u00fcn \u00fcretenler ve d\u00f6n\u00fc\u015f\u00fcm ge\u00e7irmek isteyenler Trendyol, Etsy veya Instagram Shop kurmak istiyor; ama ma\u011faza a\u00e7\u0131\u015f\u0131ndan \u00fcr\u00fcn listelemeye, fiyatland\u0131rmadan kargo s\u00fcre\u00e7lerine kadar yol haritas\u0131 yok.", 6, "ONLINE", 2200, "./assets/courses/E024.jpg", "ACTIVE", 0, 4.7, 57, 58, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(7, "E020", "Midjourney & AI G\u00f6rsel: Yarat\u0131c\u0131 \u00dcretim H\u0131zland\u0131r\u0131c\u0131s\u0131", "midjourney-ve-ai-gorsel-yaratici-uretim-hizlandiricisi", 3, "\"Fikrinizi 10 saniyede g\u00f6rsele d\u00f6n\u00fc\u015ft\u00fcr\u00fcn \u2014 AI yarat\u0131c\u0131l\u0131\u011f\u0131n\u0131z\u0131n \u00f6n\u00fcn\u00fc a\u00e7\u0131yor.\"", "Grafik tasar\u0131mc\u0131lar, pazarlamac\u0131lar ve i\u00e7erik \u00fcreticileri AI g\u00f6rsel ara\u00e7lar\u0131n\u0131 etkili kullanamad\u0131klar\u0131 i\u00e7in rakiplerine geride kal\u0131yor; Midjourney ve benzeri ara\u00e7larda \"teknik \u00f6\u011frenme e\u011frisi\" \u00e7ok dik g\u00f6r\u00fcn\u00fcyor.", 5, "ONLINE", 2200, "./assets/courses/E020.jpg", "ACTIVE", 0, 4.6, 59, 141, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(9, "E027", "Podcast & Ses Tasar\u0131m\u0131: Yay\u0131na Haz\u0131r B\u00f6l\u00fcm G\u00fcn\u00fc", "podcast-ve-ses-tasarimi-yayina-hazir-bolum-gunu", 3, "\"Fikriniz yay\u0131na haz\u0131r \u2014 bug\u00fcn ilk b\u00f6l\u00fcm\u00fcn\u00fcz\u00fc kaydedin.\"", "T\u00fcrkiye'de podcast b\u00fcy\u00fcme trendine ra\u011fmen teknik bilgi engeli (ses kayd\u0131, d\u00fczenleme, da\u011f\u0131t\u0131m platformlar\u0131) bir\u00e7ok ki\u015finin ba\u015flamadan vazge\u00e7mesine yol a\u00e7\u0131yor.", 6, "PHYSICAL", 2000, "./assets/courses/E027.jpg", "ACTIVE", 0, 4.8, 13, 67, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(3, "E021", "SEO H\u0131zland\u0131r\u0131c\u0131: Google'da Zirveye 1 G\u00fcnde", "seo-hizlandirici-google-da-zirveye-1-gunde", 3, "\"Reklam b\u00fct\u00e7esi harcamadan Google'\u0131n ilk sayfas\u0131na \u00e7\u0131k\u0131n \u2014 bug\u00fcn SEO'yu \u00f6\u011frenin.\"", "KOB\u0130'lerin ve giri\u015fimcilerin b\u00fcy\u00fck \u00e7o\u011funlu\u011fu SEO'nun \u00f6nemini biliyor ama uygulamal\u0131 teknik bilgiden yoksun; ajans b\u00fct\u00e7esi ay\u0131ramayan k\u00fc\u00e7\u00fck i\u015fletmeler organik b\u00fcy\u00fcmeye ula\u015fam\u0131yor.", 7, "ONLINE", 2800, "./assets/courses/E021.jpg", "ACTIVE", 0, 4.7, 37, 61, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(7, "E028", "Siber G\u00fcvenlik Temelleri: Dijital Hayatta Korunma G\u00fcn\u00fc", "siber-guvenlik-temelleri-dijital-hayatta-korunma-gunu", 3, "\"Dijital hayat\u0131n\u0131z\u0131 sigortalay\u0131n \u2014 tek g\u00fcnde kendinizi koruman\u0131n yollar\u0131n\u0131 \u00f6\u011frenin.\"", "Siber doland\u0131r\u0131c\u0131l\u0131k ve veri ihlalleri T\u00fcrkiye'de h\u0131zla artarken, bireylerin b\u00fcy\u00fck \u00e7o\u011funlu\u011fu temel dijital g\u00fcvenlik \u00f6nlemlerini nas\u0131l alacaklar\u0131n\u0131 bilmiyor.", 5, "ONLINE", 1900, "./assets/courses/E028.jpg", "ACTIVE", 0, 4.6, 39, 178, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(9, "E026", "Veri Analizi: Excel & Google Sheets ile Karar Destek G\u00fcn\u00fc", "veri-analizi-excel-ve-google-sheets-ile-karar-destek-gunu", 3, "\"Verileriniz konu\u015fsun \u2014 Excel'i ger\u00e7ekten kullanmay\u0131 bug\u00fcn \u00f6\u011frenin.\"", "\u00c7al\u0131\u015fanlar\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu Excel kullan\u0131yor ama pivot tablo, VLOOKUP ve temel dashboard olu\u015fturmay\u0131 bilmiyor; bu eksiklik hem i\u015f performanslar\u0131n\u0131 hem kariyer geli\u015fimlerini k\u0131s\u0131tl\u0131yor.", 7, "ONLINE", 2500, "./assets/courses/E026.jpg", "ACTIVE", 0, 4.9, 19, 134, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(3, "E023", "Yapay Zeka ile \u0130\u00e7erik \u00dcretimi: Blog, Video Script & Sosyal Medya", "yapay-zeka-ile-icerik-uretimi-blog-video-script-ve-sosyal-medya", 3, "\"1 saatlik \u00e7al\u0131\u015fmayla 1 haftal\u0131k i\u00e7erik \u00fcretin \u2014 AI ile i\u00e7erik makinenizi kurun.\"", "\u0130\u00e7erik \u00fcreticileri ve pazarlamac\u0131lar, AI ara\u00e7lar\u0131n\u0131 i\u00e7erik ak\u0131\u015flar\u0131na entegre edemedikleri i\u00e7in haftalarca s\u00fcren i\u00e7erik \u00fcretimi \u00e7al\u0131\u015fmalar\u0131 h\u00e2l\u00e2 onlarca saatlerini al\u0131yor.", 5, "ONLINE", 2000, "./assets/courses/E023.jpg", "ACTIVE", 0, 4.5, 10, 47, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(6, "E017", "Deri \u0130\u015fleme: Minimal C\u00fczdan & Aksesuar Yap\u0131m\u0131", "deri-isleme-minimal-cuzdan-ve-aksesuar-yapimi", 2, "\"Kendi imzan\u0131z\u0131 ta\u015f\u0131yan deriyi siz diktin \u2014 o his ba\u015fka.\"", "El yap\u0131m\u0131 deri \u00fcr\u00fcn talebi T\u00fcrkiye'de y\u00fcksekken, bu alandaki at\u00f6lye say\u0131s\u0131 son derece az ve mevcut kurslar genellikle \u00e7ok haftal\u0131d\u0131r; tek g\u00fcnl\u00fck profesyonel deri i\u015fleme e\u011fitimi bo\u015f bir ni\u015f.", 6, "PHYSICAL", 2400, "./assets/courses/E017.jpg", "ACTIVE", 0, 4.5, 20, 214, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(12, "E016", "Ebru Sanat\u0131: K\u00e2\u011f\u0131t Marblelama G\u00fcn\u00fc", "ebru-sanati-kagit-marblelama-gunu", 2, "\"Atalar\u0131n\u0131z\u0131n sanat\u0131n\u0131 ellerinizle ya\u015fat\u0131n \u2014 suya renk kat\u0131n, k\u00e2\u011f\u0131da iz b\u0131rak\u0131n.\"", "T\u00fcrklerin atas\u0131 say\u0131lan ebru sanat\u0131, k\u00fclt\u00fcrel miras niteli\u011fi ta\u015f\u0131makla birlikte boya oranlar\u0131 ve tekne haz\u0131rlama s\u00fcreci korkutucu g\u00f6r\u00fcnerek yeni neslin ilgisini kaybettiriyor.", 4, "PHYSICAL", 1700, "./assets/courses/E016.jpg", "ACTIVE", 0, 4.6, 36, 155, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(16, "E015", "Kintsugi: K\u0131r\u0131k G\u00fczellikleri Onarma Sanat\u0131", "kintsugi-kirik-guzellikleri-onarma-sanati", 2, "\"K\u0131r\u0131lm\u0131\u015f \u015feyler daha g\u00fczel olabilir \u2014 Japonlar\u0131n bin y\u0131ll\u0131k s\u0131rr\u0131n\u0131 bir g\u00fcnde \u00f6\u011frenin.\"", "Japon onarma sanat\u0131 kintsugi T\u00fcrkiye'de h\u0131zla pop\u00fclerle\u015fiyor; hem meditasyon etkisiyle hem de sanatsal sonucuyla ilgi g\u00f6r\u00fcyor, ancak tekni\u011fi do\u011fru \u00f6\u011freten e\u011fitimler olduk\u00e7a nadir.", 5, "PHYSICAL", 2200, "./assets/courses/E015.jpg", "ACTIVE", 1, 4.5, 65, 22, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(6, "E013", "Makrame: Modern Duvar Sanat\u0131 & Bohem Dekor G\u00fcn\u00fc", "makrame-modern-duvar-sanati-ve-bohem-dekor-gunu", 2, "\"Bo\u015f duvarlar\u0131n\u0131z bir sanat galerisi bekliyor \u2014 kendi makramenizi bug\u00fcn yap\u0131n.\"", "Sosyal medyada b\u00fcy\u00fck ilgi g\u00f6ren makrame, \u00f6\u011frenmeye ba\u015flamak i\u00e7in gereken temel d\u00fc\u011f\u00fcm tekniklerini d\u00fczg\u00fcn \u00f6\u011fretecek yap\u0131land\u0131r\u0131lm\u0131\u015f bir formattan yoksun; \u00e7o\u011fu ki\u015fi videolardan \u00f6\u011frenmeye \u00e7al\u0131\u015f\u0131p vazge\u00e7iyor.", 5, "PHYSICAL", 1800, "./assets/courses/E013.jpg", "ACTIVE", 0, 4.8, 17, 194, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(12, "E012", "Mozaik Lamba: Geleneksel Cam Sanat\u0131 At\u00f6lyesi", "mozaik-lamba-geleneksel-cam-sanati-atolyesi", 2, "\"Her renk par\u00e7as\u0131 sizin elinizden ge\u00e7sin \u2014 evinizi ayd\u0131nlatan lamba sizin imzan\u0131z olsun.\"", "\u0130stanbul'da turistik deneyim olarak sunulan mozaik lamba at\u00f6lyeleri y\u00fczeysel kal\u0131yor; T\u00fcrk misafirler de dahil olmak \u00fczere kendi evlerine \u00f6zg\u00fcn bir el i\u015fi lamba g\u00f6t\u00fcrmek isteyenler derinlikli bir at\u00f6lye ar\u0131yor.", 5, "PHYSICAL", 2000, "./assets/courses/E012.jpg", "ACTIVE", 0, 4.6, 31, 57, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(16, "E011", "Seramik \u00c7ark\u0131: Temel \u015eekillendirme G\u00fcn\u00fc", "seramik-carki-temel-sekillendirme-gunu", 2, "\"Topra\u011f\u0131 \u015fekillendirin, zihninizi bo\u015falt\u0131n \u2014 seramik \u00e7ark\u0131nda kaybolun.\"", "Seramik merak\u0131 T\u00fcrkiye'de g\u00fc\u00e7l\u00fc b\u00fcy\u00fcyor ancak \u00e7ark kullan\u0131m\u0131n\u0131 \u00f6\u011fretecek yo\u011fun format, tek g\u00fcnl\u00fck at\u00f6lyeler olduk\u00e7a s\u0131n\u0131rl\u0131; \u00e7o\u011fu kurs \u00e7ok haftal\u0131 taahh\u00fct gerektiriyor.", 6, "PHYSICAL", 2200, "./assets/courses/E011.jpg", "ACTIVE", 0, 4.6, 16, 206, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(6, "E014", "Soya Mumu: Do\u011fal Kokulu Mum \u00dcretim At\u00f6lyesi", "soya-mumu-dogal-kokulu-mum-uretim-atolyesi", 2, "\"Kendi mum markan\u0131z\u0131 tek g\u00fcnde kurun \u2014 koku se\u00e7in, etiket tasarlay\u0131n, sat\u0131\u015fa ba\u015flay\u0131n.\"", "Ev i\u00e7i k\u00fc\u00e7\u00fck i\u015fletme trendinin y\u00fckselmesiyle mum yap\u0131m\u0131na ilgi art\u0131yor; ancak do\u011fru soya mumu oranlar\u0131, koku se\u00e7imi ve kal\u0131p tekniklerini \u00f6\u011freten kapsaml\u0131 bir g\u00fcn e\u011fitimi bulunam\u0131yor.", 4, "PHYSICAL", 1500, "./assets/courses/E014.jpg", "ACTIVE", 0, 4.5, 10, 148, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(12, "E018", "Vitray Boyama: Renkli Cam & I\u015f\u0131k Sanat\u0131 At\u00f6lyesi", "vitray-boyama-renkli-cam-ve-isik-sanati-atolyesi", 2, "\"I\u015f\u0131k camdan ge\u00e7ince sanat olur \u2014 bug\u00fcn o sanat\u0131 kendi ellerinizle yarat\u0131n.\"", "Vitray sanat\u0131 hem dekoratif hem terap\u00f6tik bir u\u011fra\u015f olmas\u0131na ra\u011fmen, \u00f6zel malzeme gerektirdi\u011fi d\u00fc\u015f\u00fcncesiyle ki\u015filer denemekten \u00e7ekiniyor; asl\u0131nda temel cam boyama tek g\u00fcnde \u00f6\u011frenilebilir.", 5, "PHYSICAL", 1900, "./assets/courses/E018.jpg", "ACTIVE", 0, 4.8, 63, 80, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "E036", "Alt\u0131n & D\u00f6viz: Enflasyona Kar\u015f\u0131 Korunma Stratejileri G\u00fcn\u00fc", "altin-ve-doviz-enflasyona-karsi-korunma-stratejileri-gunu", 4, "\"Paran\u0131z\u0131n eridi\u011fini izlemeyin \u2014 bug\u00fcn kendinizi koruyan stratejiyi \u00f6\u011frenin.\"", "Y\u00fcksek enflasyon ortam\u0131nda TL tasarruflar\u0131 eriyen bireyler, alt\u0131n ve d\u00f6viz yat\u0131r\u0131m\u0131n\u0131 sezgiyle yap\u0131yor; sistematik bir korunma stratejisine sahip de\u011filler.", 4, "ONLINE", 1600, "./assets/courses/E036.jpg", "ACTIVE", 0, 4.7, 42, 189, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(11, "E029", "Bireysel Yat\u0131r\u0131m 101: Borsa ve Fon Se\u00e7imi G\u00fcn\u00fc", "bireysel-yatirim-101-borsa-ve-fon-secimi-gunu", 4, "\"Paran\u0131z sizin i\u00e7in \u00e7al\u0131\u015fs\u0131n \u2014 borsa yat\u0131r\u0131m\u0131na bug\u00fcn ba\u015flay\u0131n.\"", "T\u00fcrkiye'de y\u00fcksek enflasyon ortam\u0131nda tasarruflar\u0131n\u0131 korumak isteyen bireylerin b\u00fcy\u00fck \u00e7o\u011funlu\u011fu borsada yat\u0131r\u0131m\u0131 bilgisizlik nedeniyle atlamakta; d\u00f6viz ve alt\u0131n d\u0131\u015f\u0131nda de\u011ferlendirme yapam\u0131yorlar.", 6, "ONLINE", 2200, "./assets/courses/E029.jpg", "ACTIVE", 0, 4.9, 29, 140, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(15, "E034", "Emeklilik Planlamas\u0131: BES & \u00d6zel Emeklilik Stratejisi G\u00fcn\u00fc", "emeklilik-planlamasi-bes-ve-ozel-emeklilik-stratejisi-gunu", 4, "\"Emeklili\u011finizi devlete b\u0131rakmay\u0131n \u2014 bug\u00fcn plan\u0131n\u0131z\u0131 yap\u0131n.\"", "T\u00fcrk \u00e7al\u0131\u015fanlar\u0131n\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu BES sistemini yanl\u0131\u015f yap\u0131land\u0131r\u0131yor ya da hi\u00e7 kullanm\u0131yor; devlet katk\u0131s\u0131 ve vergi avantajlar\u0131ndan habersizler.", 5, "ONLINE", 1800, "./assets/courses/E034.jpg", "ACTIVE", 0, 4.5, 25, 100, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "E031", "Finansal \u00d6zg\u00fcrl\u00fck Plan\u0131: B\u00fct\u00e7e, Birikim & FIRE Stratejisi", "finansal-ozgurluk-plani-butce-birikim-ve-fire-stratejisi", 4, "\"Para asla yetmiyorsa sorun gelir de\u011fil, plans\u0131zl\u0131k \u2014 bug\u00fcn de\u011fi\u015ftirin.\"", "Her ay maa\u015f bitip birikime ge\u00e7ilemeyen T\u00fcrk \u00e7al\u0131\u015fanlar\u0131n temel sorunu b\u00fct\u00e7e y\u00f6netimi disiplini de\u011fil, somut bir planlama metodolojisinin yoklu\u011fudur.", 5, "ONLINE", 1800, "./assets/courses/E031.jpg", "ACTIVE", 0, 4.5, 55, 134, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(11, "E032", "Gayrimenkul Yat\u0131r\u0131m\u0131: Ak\u0131ll\u0131 Ev Al\u0131m\u0131 & Kira Getirisi Analizi", "gayrimenkul-yatirimi-akilli-ev-alimi-ve-kira-getirisi-analizi", 4, "\"Pi\u015fman olmayan ilk evinizi al\u0131n \u2014 1 g\u00fcnde gayrimenkul yat\u0131r\u0131m analizi yap\u0131n.\"", "T\u00fcrkiye'de en pop\u00fcler yat\u0131r\u0131m arac\u0131 gayrimenkul olmas\u0131na ra\u011fmen, kira \u00e7arpan\u0131 hesaplama, lokasyon analizi ve de\u011ferleme y\u00f6ntemlerini bilen bireysel yat\u0131r\u0131mc\u0131 say\u0131s\u0131 \u00e7ok d\u00fc\u015f\u00fck.", 7, "ONLINE", 2800, "./assets/courses/E032.jpg", "ACTIVE", 0, 4.9, 61, 180, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(15, "E035", "Giri\u015fim Finansman\u0131: Yat\u0131r\u0131m Turlar\u0131 & De\u011ferleme Temelleri", "girisim-finansmani-yatirim-turlari-ve-degerleme-temelleri", 4, "\"Yat\u0131r\u0131mc\u0131yla masaya oturmadan \u00f6nce onun dilini konu\u015fmay\u0131 \u00f6\u011frenin.\"", "T\u00fcrk giri\u015fimcilerin b\u00fcy\u00fck b\u00f6l\u00fcm\u00fc melek yat\u0131r\u0131m ve VC finansman\u0131 s\u00fcre\u00e7lerine haz\u0131rl\u0131ks\u0131z giriyor; de\u011ferleme mant\u0131\u011f\u0131n\u0131, term sheet okumay\u0131 ve yat\u0131r\u0131m pitchini bilmiyor.", 6, "ONLINE", 3000, "./assets/courses/E035.jpg", "ACTIVE", 0, 4.8, 13, 106, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "E030", "Kripto Para Temelleri: Web3 & DeFi Okuryazarl\u0131\u011f\u0131 G\u00fcn\u00fc", "kripto-para-temelleri-web3-ve-defi-okuryazarligi-gunu", 4, "\"Kripto d\u00fcnyas\u0131nda kaybolmay\u0131n \u2014 temelleri \u00f6\u011frenin, bilin\u00e7li yat\u0131r\u0131m yap\u0131n.\"", "T\u00fcrkiye kripto para kullan\u0131m oran\u0131nda d\u00fcnya genelinde ilk 5'te olmas\u0131na ra\u011fmen, bireylerin b\u00fcy\u00fck \u00e7o\u011funlu\u011fu teknik bilgi eksikli\u011fiyle spek\u00fclasyon yap\u0131yor; c\u00fczdan g\u00fcvenli\u011fi, DeFi ve do\u011fru de\u011ferleme yapam\u0131yor.", 6, "ONLINE", 2400, "./assets/courses/E030.jpg", "ACTIVE", 1, 4.6, 51, 72, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(11, "E033", "Vergi Okuryazarl\u0131\u011f\u0131: Serbest \u00c7al\u0131\u015fanlar & Giri\u015fimciler i\u00e7in Vergi G\u00fcn\u00fc", "vergi-okuryazarligi-serbest-calisanlar-ve-girisimciler-icin-vergi-gunu", 4, "\"Devlete fazla \u00f6demeyin, yasal olarak ak\u0131ll\u0131 vergi y\u00f6netimini bug\u00fcn \u00f6\u011frenin.\"", "Gig ekonomisiyle birlikte artan serbest \u00e7al\u0131\u015fan say\u0131s\u0131, vergi y\u00fck\u00fcml\u00fcl\u00fcklerini bilmedi\u011fi i\u00e7in hem para kaybediyor hem de vergi riskleri ta\u015f\u0131yor; pratik vergi bilgisine eri\u015fim s\u0131n\u0131rl\u0131.", 5, "ONLINE", 2000, "./assets/courses/E033.jpg", "ACTIVE", 0, 4.5, 55, 112, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(1, "E004", "Fermentasyon G\u00fcn\u00fc: Kimchi, Kefir ve Kombucha", "fermentasyon-gunu-kimchi-kefir-ve-kombucha", 1, "\"Ba\u011f\u0131rsak sa\u011fl\u0131\u011f\u0131n\u0131z\u0131 evde, kendi ellerinizle devrime u\u011frat\u0131n.\"", "Probiyotik \u00fcr\u00fcnlere artan ilgiye kar\u015f\u0131n, ev fermentasyonu uygulamal\u0131 olarak nas\u0131l yap\u0131l\u0131r bilen yok denecek kadar az; kapsaml\u0131, g\u00fcvenli ve hijyenik fermentasyon bilgisi edinmek zor.", 5, "PHYSICAL", 2000, "./assets/courses/E004.jpg", "ACTIVE", 0, 4.6, 14, 157, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(5, "E003", "Frans\u0131z Pastac\u0131l\u0131k: Croissant & Viennoiserie G\u00fcn\u00fc", "fransiz-pastacilik-croissant-ve-viennoiserie-gunu", 1, "\"Paris'teki pastane kalitesini kendi mutfa\u011f\u0131n\u0131za ta\u015f\u0131y\u0131n \u2014 1 g\u00fcn yeter.\"", "Pastane kalitesinde tereya\u011fl\u0131, \u00e7\u0131t\u0131r croissant yap\u0131m\u0131; katmanl\u0131 hamur tekni\u011fi bilinmeden evde ba\u015far\u0131lamaz ve bu tekni\u011fi \u00f6\u011fretecek yo\u011fun format e\u011fitimler T\u00fcrkiye'de olduk\u00e7a s\u0131n\u0131rl\u0131d\u0131r.", 8, "PHYSICAL", 3200, "./assets/courses/E003.jpg", "ACTIVE", 0, 4.5, 20, 65, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(10, "E008", "Kokteyl & Mixology: Ev Bar\u0131 Kurma G\u00fcn\u00fc", "kokteyl-ve-mixology-ev-bari-kurma-gunu", 1, "\"Bir sonraki ev partinizde herkesin konu\u015ftu\u011fu barmen siz olun.\"", "Sosyal ev partilerinde profesyonel kokteyl sunmak isteyen bireyler, \u00f6l\u00e7\u00fc, teknik ve malzeme se\u00e7imi konusunda bilgisizlik nedeniyle hayal k\u0131r\u0131kl\u0131\u011f\u0131 ya\u015f\u0131yor.", 4, "PHYSICAL", 1600, "./assets/courses/E008.jpg", "ACTIVE", 1, 4.9, 69, 208, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(1, "E010", "Pizza Ustas\u0131: Napoli Tarz\u0131 Hamur & F\u0131r\u0131n Teknikleri", "pizza-ustasi-napoli-tarzi-hamur-ve-firin-teknikleri", 1, "\"Pizza sipari\u015fine para verme \u2014 bug\u00fcn kendi Napoli pizzan\u0131 yap.\"", "T\u00fcrkiye'de pizza k\u00fclt\u00fcr\u00fc h\u0131zla b\u00fcy\u00fcyor; evde ger\u00e7ek Napoli pizzas\u0131 yapmak i\u00e7in hamur fermentasyonu, sos dengesi ve y\u00fcksek \u0131s\u0131 f\u0131r\u0131n tekniklerini b\u00fct\u00fcnle\u015fik \u00f6\u011fretecek bir kaynak yok.", 5, "PHYSICAL", 1700, "./assets/courses/E010.jpg", "ACTIVE", 0, 4.5, 35, 118, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(5, "E009", "Sa\u011fl\u0131kl\u0131 Kahvalt\u0131 Re\u00e7elci\u011fi: Probiyotik \u00dcr\u00fcnler & Spreads", "saglikli-kahvalti-recelcigi-probiyotik-urunler-ve-spreads", 1, "\"Kahvalt\u0131 masan\u0131z\u0131 temiz etiket \u00fcr\u00fcnlere d\u00f6n\u00fc\u015ft\u00fcr\u00fcn \u2014 bir g\u00fcnde ba\u015flay\u0131n.\"", "\u015eeker ve katk\u0131 maddesi i\u00e7eren haz\u0131r re\u00e7eller ile kahvalt\u0131l\u0131k spreadin sa\u011fl\u0131ks\u0131z alternatifleri yerine, ev yap\u0131m\u0131 probiyotik \u00fcr\u00fcnler ve do\u011fal spreadin nas\u0131l yap\u0131laca\u011f\u0131 bilinmiyor.", 4, "PHYSICAL", 1500, "./assets/courses/E009.jpg", "ACTIVE", 0, 4.8, 22, 132, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(10, "E001", "Sourdough Ekmek: Ek\u015fi Maya Ustalar\u0131 G\u00fcn\u00fc", "sourdough-ekmek-eksi-maya-ustalari-gunu", 1, "\"F\u0131r\u0131ndan \u00e7\u0131kan o tarifsiz kokuyu kendi ellerinizle yarat\u0131n \u2014 bug\u00fcn \u00f6\u011frenin, yar\u0131n sabah sofran\u0131zda olsun.\"", "Market ekme\u011findeki katk\u0131 maddelerine alternatif arayan bireyler, evde profesyonel d\u00fczeyde ek\u015fi maya ekme\u011fi yapmay\u0131 \u00f6\u011frenmek istiyor; ancak maya besleme ve f\u0131r\u0131nlama tekniklerini \u00f6\u011frenecek pratik bir kaynak bulam\u0131yorlar.", 7, "PHYSICAL", 2200, "./assets/courses/E001.jpg", "ACTIVE", 1, 4.8, 57, 51, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(1, "E002", "Su\u015fi & Japon Mutfa\u011f\u0131 Temel At\u00f6lyesi", "susi-ve-japon-mutfagi-temel-atolyesi", 1, "\"Art\u0131k su\u015fi sipari\u015f verme; kendin yap, herkesi hayrete d\u00fc\u015f\u00fcr.\"", "Su\u015fi sevenlerin b\u00fcy\u00fck \u00e7o\u011funlu\u011fu bu lezzeti restoranda t\u00fcketiyor; evde yap\u0131m\u0131n\u0131 karma\u015f\u0131k ve pahal\u0131 buluyor, oysa temel teknikler birka\u00e7 saatte \u00f6\u011frenilebilir.", 6, "PHYSICAL", 2800, "./assets/courses/E002.jpg", "ACTIVE", 0, 4.6, 66, 156, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(5, "E007", "T\u00fcrk Mutfa\u011f\u0131 Derinlikleri: Anadolu Lezzetleri G\u00fcn\u00fc", "turk-mutfagi-derinlikleri-anadolu-lezzetleri-gunu", 1, "\"B\u00fcy\u00fckannenizin bilgisini bir g\u00fcnde \u00f6\u011frenin \u2014 nesiller aras\u0131 lezzetleri ya\u015fat\u0131n.\"", "Kentle\u015fmeyle birlikte ku\u015faktan ku\u015fa\u011fa aktar\u0131lan Anadolu tarifleri (katmer, keskek, \u00e7i\u011f k\u00f6fte, yo\u011furt tatl\u0131lar\u0131) unutulma tehlikesiyle kar\u015f\u0131 kar\u015f\u0131ya; otantik bilgiye eri\u015fim k\u0131s\u0131tl\u0131.", 7, "PHYSICAL", 1900, "./assets/courses/E007.jpg", "ACTIVE", 0, 4.7, 58, 209, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(10, "E005", "\u00c7ikolata At\u00f6lyesi: Bean to Bar & Pralin Yap\u0131m\u0131", "cikolata-atolyesi-bean-to-bar-ve-pralin-yapimi", 1, "\"Her dilimde kendi imzan\u0131z olsun \u2014 bug\u00fcn \u00e7ikolatac\u0131 olun.\"", "\u00c7ikolata hediye k\u00fclt\u00fcr\u00fc b\u00fcy\u00fcyen T\u00fcrkiye'de, artisan \u00e7ikolata yap\u0131m\u0131n\u0131 bilen ki\u015fi say\u0131s\u0131 olduk\u00e7a d\u00fc\u015f\u00fck; temperleme ve kal\u0131p doldurma tekniklerini \u00f6\u011fretecek pratik e\u011fitimler yetersiz.", 6, "PHYSICAL", 2500, "./assets/courses/E005.jpg", "ACTIVE", 0, 4.8, 22, 157, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(1, "E006", "\u0130talyan Makarna: Taze Pasta Yap\u0131m\u0131 G\u00fcn\u00fc", "italyan-makarna-taze-pasta-yapimi-gunu", 1, "\"\u00c7ok bir paket makarnay\u0131 \u00e7\u00f6pe at\u0131n \u2014 ger\u00e7ek lezzetin tek adresi bu at\u00f6lye.\"", "\u0130talyan mutfa\u011f\u0131n\u0131n temeli olan taze makarnan\u0131n ev yap\u0131m\u0131, kurutulmu\u015f paketten tamamen farkl\u0131 bir lezzet sunar; ancak hangi un kullan\u0131laca\u011f\u0131ndan hamur yo\u011furma tekni\u011fine kadar bu bilgiye ula\u015fmak h\u00e2l\u00e2 zor.", 5, "PHYSICAL", 1800, "./assets/courses/E006.jpg", "ACTIVE", 0, 4.7, 18, 98, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(4, "E043", "Abonelik \u0130\u015f Modeli: Tekrarlayan Gelir Sistemi Kurma G\u00fcn\u00fc", "abonelik-is-modeli-tekrarlayan-gelir-sistemi-kurma-gunu", 5, "\"Her ay s\u0131f\u0131rdan ba\u015flamay\u0131n \u2014 d\u00fczenli gelir sisteminizi bug\u00fcn kurun.\"", "T\u00fcrk giri\u015fimciler proje bazl\u0131, kesintili gelirle ya\u015famak zorunda; abonelik modeline ge\u00e7i\u015f yapman\u0131n sistematik yolunu ve m\u00fc\u015fteri elde tutma stratejilerini bilmiyor.", 6, "ONLINE", 2500, "./assets/courses/E043.jpg", "ACTIVE", 0, 4.7, 63, 115, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(13, "E039", "Dropshipping & Tedarik\u00e7isiz E-Ticaret Ba\u015flang\u0131\u00e7 G\u00fcn\u00fc", "dropshipping-ve-tedarikcisiz-e-ticaret-baslangic-gunu", 5, "\"Stok, depo, sermaye olmadan sat\u0131\u015f m\u00fcmk\u00fcn \u2014 bug\u00fcn sistemi kurun.\"", "Stok tutmadan e-ticaret yapmak isteyen ki\u015filer dropshipping'i kulaktan duymu\u015f ama tedarik\u00e7i bulma, ma\u011faza kurma ve m\u00fc\u015fteri y\u00f6netimi konular\u0131nda somut bilgiden yoksun.", 7, "ONLINE", 2400, "./assets/courses/E039.jpg", "ACTIVE", 0, 4.8, 22, 113, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(19, "E037", "Fikir'den Startup'a: 0'dan MVP G\u00fcn\u00fc", "fikir-den-startup-a-0-dan-mvp-gunu", 5, "\"Bir y\u0131l daha plan yapmay\u0131n \u2014 bug\u00fcn ba\u015flay\u0131n, bu hafta test edin.\"", "T\u00fcrkiye'deki giri\u015fimcilerin b\u00fcy\u00fck \u00e7o\u011funlu\u011fu i\u015f fikrinden \u00fcr\u00fcne ge\u00e7i\u015f s\u00fcrecinde \"yeterli haz\u0131rl\u0131k\" tuza\u011f\u0131na d\u00fc\u015f\u00fcyor; y\u0131llarca plan yap\u0131p hi\u00e7 ad\u0131m atam\u0131yor.", 8, "ONLINE", 2800, "./assets/courses/E037.jpg", "ACTIVE", 0, 4.5, 10, 39, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(4, "E041", "Fiyatland\u0131rma Psikolojisi: \u00dcr\u00fcn ve Hizmet Fiyat\u0131n\u0131 Do\u011fru Koy", "fiyatlandirma-psikolojisi-urun-ve-hizmet-fiyatini-dogru-koy", 5, "\"Fiyat\u0131 d\u00fc\u015f\u00fcr\u00fcp daha \u00e7ok m\u00fc satmak istiyorsunuz? Yanl\u0131\u015f strateji \u2014 bug\u00fcn \u00f6\u011frenin neden.\"", "KOB\u0130 sahiplerinin ve serbest \u00e7al\u0131\u015fanlar\u0131n en b\u00fcy\u00fck yanl\u0131\u015f\u0131 fiyatlamay\u0131 maliyet art\u0131 k\u00e2r marj\u0131yla yapmak; m\u00fc\u015fteri psikolojisi ve de\u011fer alg\u0131s\u0131 temelli fiyatlamay\u0131 bilen \u00e7ok az ki\u015fi var.", 5, "ONLINE", 2200, "./assets/courses/E041.jpg", "ACTIVE", 0, 4.5, 45, 183, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(13, "E040", "Freelance Kariyer: Uluslararas\u0131 Piyasada Kendini Sat", "freelance-kariyer-uluslararasi-piyasada-kendini-sat", 5, "\"T\u00fcrk maa\u015f\u0131yla \u00e7al\u0131\u015fmay\u0131n \u2014 d\u00fcnya piyasas\u0131nda sat\u0131n.\"", "T\u00fcrk profesyoneller Upwork, Fiverr ve Toptal gibi platformlarda d\u00fc\u015f\u00fck \u00fccretle i\u015f al\u0131yor ya da hi\u00e7 alam\u0131yor; profil optimizasyonu, fiyatland\u0131rma ve m\u00fc\u015fteri y\u00f6netimi konusunda yol g\u00f6sterici yok.", 6, "ONLINE", 2000, "./assets/courses/E040.jpg", "ACTIVE", 1, 4.8, 28, 52, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(19, "E042", "Instagram ile Sat\u0131\u015f: Organik B\u00fcy\u00fcme & DM Sat\u0131\u015f G\u00fcn\u00fc", "instagram-ile-satis-organik-buyume-ve-dm-satis-gunu", 5, "\"Instagram'\u0131n\u0131z vitrin de\u011fil, sat\u0131\u015f makinesi olsun \u2014 bug\u00fcn kurun.\"", "Instagram'dan sat\u0131\u015f yapmak isteyen k\u00fc\u00e7\u00fck i\u015fletme sahipleri reklam b\u00fct\u00e7esi olmadan organik b\u00fcy\u00fcmeyi nas\u0131l sa\u011flayacaklar\u0131n\u0131 ve DM'den nas\u0131l sat\u0131\u015f kapatacaklar\u0131n\u0131 bilmiyor.", 6, "ONLINE", 2000, "./assets/courses/E042.jpg", "ACTIVE", 0, 4.8, 53, 138, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(4, "E038", "Marka \u0130n\u015fas\u0131: Logo'dan Marka Sesine 1 G\u00fcnde", "marka-insasi-logo-dan-marka-sesine-1-gunde", 5, "\"\u00dcr\u00fcn\u00fcn\u00fcz iyi ama markan\u0131z konu\u015fmuyor \u2014 bug\u00fcn de\u011fi\u015ftirin.\"", "K\u00fc\u00e7\u00fck i\u015fletmeler ve giri\u015fimciler \u00fcr\u00fcnlerini pazara sunarken markalar\u0131 belirsiz, sesleri tutars\u0131z kal\u0131yor; marka kimli\u011fi olu\u015fturman\u0131n sistematik yolunu bilmiyorlar.", 7, "ONLINE", 2500, "./assets/courses/E038.jpg", "ACTIVE", 0, 4.8, 23, 127, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(13, "E044", "Pitch Deck Ustas\u0131: Yat\u0131r\u0131mc\u0131ya 10 Dakikada Kendini Sat", "pitch-deck-ustasi-yatirimciya-10-dakikada-kendini-sat", 5, "\"Yat\u0131r\u0131mc\u0131n\u0131n 'evet' dedi\u011fi sunumu yap\u0131n \u2014 tek g\u00fcnde pitch ustas\u0131 olun.\"", "T\u00fcrk giri\u015fimciler yat\u0131r\u0131mc\u0131 sunumlar\u0131nda \u00e7ok s\u0131k bilgi y\u00fckleyerek veya duygusal ba\u011f kuramayarak reddediliyor; etkili bir pitch deck'in anatomisinii bilmiyorlar.", 5, "ONLINE", 3000, "./assets/courses/E044.jpg", "ACTIVE", 0, 4.7, 42, 23, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "E075", "Design Thinking: Yenilik\u00e7i Problem \u00c7\u00f6zme At\u00f6lyesi", "design-thinking-yenilikci-problem-cozme-atolyesi", 10, "\"\u015eikayeti \u00e7\u00f6z\u00fcme, karma\u015fay\u0131 f\u0131rsata d\u00f6n\u00fc\u015ft\u00fcr\u00fcn \u2014 design thinking g\u00fcn\u00fc.\"", "T\u00fcrk \u015firketlerinde inovasyon \u00e7a\u011fr\u0131lar\u0131 yap\u0131l\u0131yor ama \u00e7al\u0131\u015fanlar yap\u0131land\u0131r\u0131lm\u0131\u015f problem \u00e7\u00f6zme metodolojisi olmadan fikir \u00fcretemiyor; Design Thinking hayata ge\u00e7irilemiyor.", 8, "PHYSICAL", 3800, "./assets/courses/E075.jpg", "ACTIVE", 0, 4.5, 30, 171, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(9, "E079", "Kurumsal Sunum: Y\u00f6netim Kuruluna Raporlama G\u00fcn\u00fc", "kurumsal-sunum-yonetim-kuruluna-raporlama-gunu", 10, "\"Y\u00f6netim kurulundaki 10 dakikada karar\u0131n\u0131z\u0131 ge\u00e7irin \u2014 bug\u00fcn o dili \u00f6\u011frenin.\"", "Y\u00f6neticiler \u00e7ok sayfal\u0131 rapor haz\u0131rl\u0131yor ama \u00fcst y\u00f6netime ya da y\u00f6netim kuruluna etkili, k\u0131sa ve ikna edici bi\u00e7imde sunmakta g\u00fc\u00e7l\u00fck \u00e7ekiyor; mesaj strateji ve g\u00f6rsel hiyerar\u015fi bilgisi eksik.", 6, "PHYSICAL", 3800, "./assets/courses/E079.jpg", "ACTIVE", 0, 4.9, 39, 59, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(15, "E080", "Ku\u015faklar Aras\u0131 \u0130leti\u015fim: Gen Z & Boomers Bir Arada \u00c7al\u0131\u015fma G\u00fcn\u00fc", "kusaklar-arasi-iletisim-gen-z-ve-boomers-bir-arada-calisma-gunu", 10, "\"Z ku\u015fa\u011f\u0131n\u0131z ve deneyimli ekibiniz ayr\u0131 dil konu\u015fuyorsa \u2014 bug\u00fcn k\u00f6pr\u00fcy\u00fc kurun.\"", "\u00c7ok ku\u015fakl\u0131 i\u015f g\u00fcc\u00fc y\u00f6netimi, farkl\u0131 beklenti ve ileti\u015fim stillerinin \u00e7at\u0131\u015fmas\u0131 nedeniyle T\u00fcrk \u015firketlerinde verimlilik kayb\u0131na ve \u00e7al\u0131\u015fan devir h\u0131z\u0131na yol a\u00e7\u0131yor.", 5, "PHYSICAL", 3000, "./assets/courses/E080.jpg", "ACTIVE", 0, 4.8, 17, 88, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "E074", "Tak\u0131m Uyumu: \u00c7al\u0131\u015fan Ba\u011fl\u0131l\u0131\u011f\u0131 & Psikolojik G\u00fcvenlik G\u00fcn\u00fc", "takim-uyumu-calisan-bagliligi-ve-psikolojik-guvenlik-gunu", 10, "\"En iyi insanlar\u0131 i\u015fe ald\u0131n\u0131z \u2014 ama birlikte \u00e7al\u0131\u015fabiliyor musunuz?\"", "T\u00fcrk \u015firketlerde \u00e7al\u0131\u015fan ba\u011fl\u0131l\u0131\u011f\u0131 oranlar\u0131 k\u00fcresel ortalaman\u0131n alt\u0131nda; tak\u0131mlar aras\u0131nda psikolojik g\u00fcvenlik eksikli\u011fi inovasyon ve i\u015f birli\u011finin \u00f6n\u00fcnde engel olu\u015fturuyor.", 7, "PHYSICAL", 3500, "./assets/courses/E074.jpg", "ACTIVE", 0, 4.7, 37, 24, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(9, "E076", "Veri Okuryazarl\u0131\u011f\u0131: Karar Vericiler i\u00e7in Analitik D\u00fc\u015f\u00fcnme G\u00fcn\u00fc", "veri-okuryazarligi-karar-vericiler-icin-analitik-dusunme-gunu", 10, "\"Rapor okuyup anlamamak bir l\u00fcks de\u011fil art\u0131k \u2014 veriye dayal\u0131 karar verin.\"", "Orta ve \u00fcst d\u00fczey y\u00f6neticiler veri raporlar\u0131 al\u0131yor ama do\u011fru yorumlayam\u0131yor; veri okuryazarl\u0131\u011f\u0131 olmadan stratejik kararlar sezgiyle al\u0131nmak zorunda kal\u0131yor.", 6, "ONLINE", 3200, "./assets/courses/E076.jpg", "ACTIVE", 0, 4.6, 64, 147, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(15, "E077", "\u00c7evik Metodoloji: Scrum & Agile Temelleri G\u00fcn\u00fc", "cevik-metodoloji-scrum-ve-agile-temelleri-gunu", 10, "\"Proje gecikmelerini bir metodoloji de\u011fi\u015fikli\u011fiyle \u00f6nleyin \u2014 bug\u00fcn Agile'\u0131 \u00f6\u011frenin.\"", "T\u00fcrk \u015firketleri \u00e7evik d\u00f6n\u00fc\u015f\u00fcm ilan ediyor ama Scrum ve Agile'\u0131 ger\u00e7ekten uygulayan ekip say\u0131s\u0131 d\u00fc\u015f\u00fck; metodoloji bilgisi ya eksik ya da yanl\u0131\u015f uygulan\u0131yor.", 7, "PHYSICAL", 3500, "./assets/courses/E077.jpg", "ACTIVE", 0, 4.9, 61, 151, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(2, "E078", "\u0130K Dijital D\u00f6n\u00fc\u015f\u00fcm\u00fc: \u0130\u015fe Al\u0131m & Performans Y\u00f6netimi G\u00fcn\u00fc", "ik-dijital-donusumu-ise-alim-ve-performans-yonetimi-gunu", 10, "\"\u0130yi insan bulmak art\u0131k algoritma i\u015fi \u2014 dijital \u0130K'y\u0131 bug\u00fcn \u00f6\u011frenin.\"", "T\u00fcrk \u0130K departmanlar\u0131 ATS, OKR ve dijital performans y\u00f6netim sistemlerini kullanma konusunda yetkinlik eksikli\u011fi ya\u015f\u0131yor; teknoloji var ama nas\u0131l kullan\u0131laca\u011f\u0131 bilinmiyor.", 6, "ONLINE", 3200, "./assets/courses/E078.jpg", "ACTIVE", 0, 4.9, 51, 155, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(10, "E055", "Beslenme Ko\u00e7lu\u011fu: Ki\u015fisel Beslenme Plan\u0131 Olu\u015fturma G\u00fcn\u00fc", "beslenme-koclugu-kisisel-beslenme-plani-olusturma-gunu", 7, "\"Diyet listesi de\u011fil, \u00f6m\u00fcr boyu s\u00fcrd\u00fcr\u00fclebilir beslenme \u2014 bug\u00fcn \u00f6\u011frenin.\"", "Sosyal medyada y\u00fczlerce \u00e7eli\u015fkili beslenme bilgisi aras\u0131nda kalan bireyler neye g\u00fcveneceklerini bilmiyor; bilimsel temelli, ki\u015fiye \u00f6zel bir beslenme \u00e7er\u00e7evesi olu\u015fturam\u0131yorlar.", 6, "ONLINE", 2000, "./assets/courses/E055.jpg", "ACTIVE", 0, 4.6, 54, 144, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(16, "E059", "Ev Egzersizi: Ekipmans\u0131z Full Body Antrenman Tasar\u0131m\u0131 G\u00fcn\u00fc", "ev-egzersizi-ekipmansiz-full-body-antrenman-tasarimi-gunu", 7, "\"Spor salonu olmadan da formda olunur \u2014 sistemi bug\u00fcn kurun.\"", "Spor salonu aboneli\u011fi tutmayanlar veya spor salonu yetersizli\u011fi ya\u015fananlar i\u00e7in evde etkili egzersiz program\u0131 olu\u015fturman\u0131n sistematik yolunu bilen \u00e7ok az ki\u015fi var.", 4, "ONLINE", 1500, "./assets/courses/E059.jpg", "ACTIVE", 0, 4.6, 29, 193, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(20, "E054", "Mindfulness & Meditasyon: Zihinsel S\u0131f\u0131rlama G\u00fcn\u00fc", "mindfulness-ve-meditasyon-zihinsel-sifirlama-gunu", 7, "\"Kafan\u0131zdaki g\u00fcr\u00fclt\u00fcy\u00fc tek g\u00fcnde durdurmay\u0131 \u00f6\u011frenin \u2014 zihinsel s\u0131f\u0131rlama ba\u015fl\u0131yor.\"", "Mental sa\u011fl\u0131k fark\u0131ndal\u0131\u011f\u0131 y\u00fckselmesine ra\u011fmen, \u00e7o\u011fu ki\u015fi meditasyonu \"akl\u0131m \u00e7ok kalabal\u0131k, bana olmaz\" diye reddiyor; do\u011fru tekni\u011fi \u00f6\u011fretecek uygulamal\u0131 bir g\u00fcn yeterli.", 5, "PHYSICAL", 1500, "./assets/courses/E054.jpg", "ACTIVE", 0, 4.5, 10, 152, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(10, "E056", "Pilates Temelleri: Core G\u00fc\u00e7lendirme & Post\u00fcr D\u00fczeltme G\u00fcn\u00fc", "pilates-temelleri-core-guclendirme-ve-postur-duzeltme-gunu", 7, "\"S\u0131rt a\u011fr\u0131lar\u0131na veda edin \u2014 1 g\u00fcn yeter, \u00f6m\u00fcr boyu fark yarat\u0131r.\"", "Ofis \u00e7al\u0131\u015fanlar\u0131n\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu s\u0131rt ve bel a\u011fr\u0131s\u0131 \u00e7ekiyor; post\u00fcr\u00fc d\u00fczeltecek pilates hareketlerini \u00f6\u011frenmek i\u00e7in uzun d\u00f6nemli kurs yerine yo\u011fun format tercih edilebilir.", 4, "PHYSICAL", 1600, "./assets/courses/E056.jpg", "ACTIVE", 0, 4.5, 35, 32, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(16, "E058", "Stres Y\u00f6netimi: Burnout \u00d6nleme & Enerji Y\u00f6netimi G\u00fcn\u00fc", "stres-yonetimi-burnout-onleme-ve-enerji-yonetimi-gunu", 7, "\"T\u00fckenme noktas\u0131na gelmeden \u00f6nce \u2014 bug\u00fcn sistemi de\u011fi\u015ftirin.\"", "T\u00fcrkiye'de \u00e7al\u0131\u015fan t\u00fckenmi\u015fli\u011fi (burnout) giderek artan bir sorun olarak \u00f6ne \u00e7\u0131k\u0131yor; ancak pratik, uygulamal\u0131 stres y\u00f6netimi ara\u00e7lar\u0131n\u0131 \u00f6\u011fretecek k\u0131sa format e\u011fitimler yok.", 5, "ONLINE", 1900, "./assets/courses/E058.jpg", "ACTIVE", 0, 4.6, 66, 164, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(20, "E057", "Uyku Kalitesi: Bilimsel Uyku Hijyeni & Sabah Rutini G\u00fcn\u00fc", "uyku-kalitesi-bilimsel-uyku-hijyeni-ve-sabah-rutini-gunu", 7, "\"Her gece 8 saat yat\u0131p dinlenmeden kalk\u0131yorsan\u0131z \u2014 bug\u00fcn nedenini \u00f6\u011frenin.\"", "T\u00fcrk \u00e7al\u0131\u015fanlar\u0131n\u0131n ciddi bir b\u00f6l\u00fcm\u00fc kronik uyku yoksunlu\u011fu \u00e7ekiyor; ila\u00e7s\u0131z, bilimsel temelli uyku iyile\u015ftirme stratejilerini \u00f6\u011fretecek kurs neredeyse yok.", 4, "ONLINE", 1500, "./assets/courses/E057.jpg", "ACTIVE", 0, 4.7, 42, 106, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(10, "E053", "Yoga Temelleri: Ev Prati\u011fi Olu\u015fturma G\u00fcn\u00fc", "yoga-temelleri-ev-pratigi-olusturma-gunu", 7, "\"Y\u0131llarca ertelediklerinizi bug\u00fcn ba\u015flat\u0131n \u2014 mat ve motivasyon haz\u0131r.\"", "Yoga merakl\u0131lar\u0131n\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu y\u0131llarca \"ba\u015flayaca\u011f\u0131m\" deyip ba\u015flayam\u0131yor; uzun vadeli taahh\u00fct gerektiren st\u00fcdyo kurslar yerine tek g\u00fcnl\u00fck oryantasyon format\u0131 eksik.", 5, "PHYSICAL", 1600, "./assets/courses/E053.jpg", "ACTIVE", 0, 4.8, 32, 185, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(11, "E064", "Empati & Duygusal Zek\u00e2: \u0130\u015f Hayat\u0131nda EQ Geli\u015fimi G\u00fcn\u00fc", "empati-ve-duygusal-zeka-is-hayatinda-eq-gelisimi-gunu", 8, "\"IQ sizi i\u015fe al\u0131r, EQ sizi zirveye ta\u015f\u0131r \u2014 fark\u0131 bug\u00fcn yarat\u0131n.\"", "IQ'nun \u00f6tesinde kariyer ba\u015far\u0131s\u0131 i\u00e7in duygusal zek\u00e2n\u0131n belirleyici oldu\u011funu bilen profesyoneller, EQ'yu sistematik olarak nas\u0131l geli\u015ftireceklerini bilmiyor.", 5, "PHYSICAL", 2200, "./assets/courses/E064.jpg", "ACTIVE", 0, 4.6, 44, 196, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(17, "E062", "Liderlik Temelleri: \u0130lk Kez Y\u00f6netici Olanlar i\u00e7in G\u00fcn", "liderlik-temelleri-ilk-kez-yonetici-olanlar-icin-gun", 8, "\"\u0130yi bir \u00e7al\u0131\u015fanken i\u015fe ald\u0131n\u0131z \u2014 iyi bir lider olmak ayr\u0131 bir beceri, bug\u00fcn ba\u015flay\u0131n.\"", "T\u00fcrkiye'de terfi eden \u00e7al\u0131\u015fanlar\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu liderlik e\u011fitimi almadan y\u00f6neticili\u011fe ba\u015fl\u0131yor; teknik yetkinlik ile insan y\u00f6netimi \u00e7ok farkl\u0131 beceriler gerektiriyor.", 7, "PHYSICAL", 2800, "./assets/courses/E062.jpg", "ACTIVE", 0, 4.9, 14, 64, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(4, "E061", "M\u00fczakere Sanat\u0131: \u0130\u015f ve \u00d6zel Hayatta Kazanma G\u00fcn\u00fc", "muzakere-sanati-is-ve-ozel-hayatta-kazanma-gunu", 8, "\"Masada kalan para sizin hakk\u0131n\u0131z \u2014 m\u00fczakere etmeyi \u00f6\u011frenin, al\u0131n.\"", "Maa\u015f m\u00fczakeresi, i\u015f s\u00f6zle\u015fmesi ve B2B sat\u0131\u015f g\u00f6r\u00fc\u015fmelerinde T\u00fcrk profesyoneller kar\u015f\u0131 taraf\u0131n teklifini kabul etme e\u011filiminde; sistematik m\u00fczakere tekniklerini bilen \u00e7ok az ki\u015fi var.", 6, "PHYSICAL", 2500, "./assets/courses/E061.jpg", "ACTIVE", 0, 4.5, 10, 146, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(11, "E063", "Networking: \u0130li\u015fki \u0130n\u015fas\u0131 & G\u00fc\u00e7l\u00fc Ba\u011f Kurma G\u00fcn\u00fc", "networking-iliski-insasi-ve-guclu-bag-kurma-gunu", 8, "\"F\u0131rsatlar ki\u015filerden gelir \u2014 do\u011fru insanlar\u0131 tan\u0131may\u0131 bug\u00fcn \u00f6\u011frenin.\"", "T\u00fcrk profesyoneller networking etkinliklerinde gerginle\u015fiyor ya da y\u00fczeysel ili\u015fkiler kuruyor; ger\u00e7ek ve s\u00fcrd\u00fcr\u00fclebilir profesyonel ili\u015fki in\u015fas\u0131n\u0131n sistematik yolunu bilmiyor.", 5, "PHYSICAL", 2000, "./assets/courses/E063.jpg", "ACTIVE", 0, 4.9, 49, 116, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(17, "E060", "Sunum Korkusu: Kamuoyuna Konu\u015fma G\u00fcveni G\u00fcn\u00fc", "sunum-korkusu-kamuoyuna-konusma-guveni-gunu", 8, "\"Toplant\u0131 odas\u0131nda susanlar kariyer f\u0131rsatlar\u0131n\u0131 da ka\u00e7\u0131r\u0131yor \u2014 bug\u00fcn sesinizi bulun.\"", "T\u00fcrkiye'de \u00e7al\u0131\u015fanlar\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu kamuoyuna konu\u015fma korkusunu a\u015fmak istiyor; bu korku kariyer geli\u015fiminin \u00f6n\u00fcndeki en b\u00fcy\u00fck engeller aras\u0131nda g\u00f6steriliyor.", 6, "PHYSICAL", 2200, "./assets/courses/E060.jpg", "ACTIVE", 0, 4.5, 50, 48, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(4, "E066", "Zaman Y\u00f6netimi: Deep Work & Odak \u00dcretkenli\u011fi G\u00fcn\u00fc", "zaman-yonetimi-deep-work-ve-odak-uretkenligi-gunu", 8, "\"Me\u015fgul olmakla \u00fcretken olmak ayn\u0131 \u015fey de\u011fil \u2014 fark\u0131 bug\u00fcn ya\u015fay\u0131n.\"", "\u00c7al\u0131\u015fanlar\u0131n b\u00fcy\u00fck \u00e7o\u011funlu\u011fu g\u00fcnl\u00fck saatlerinin b\u00fcy\u00fck k\u0131sm\u0131n\u0131 reaktif g\u00f6revlerde ge\u00e7iriyor; derin \u00e7al\u0131\u015fma kapasitesi ve \u00f6ncelik y\u00f6netimi konusunda sistematik bir \u00e7er\u00e7eveleri yok.", 5, "ONLINE", 1800, "./assets/courses/E066.jpg", "ACTIVE", 0, 4.6, 26, 178, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(11, "E065", "\u0130kna & Etki: G\u00fcnl\u00fck Hayatta Etkileyici \u0130leti\u015fim G\u00fcn\u00fc", "ikna-ve-etki-gunluk-hayatta-etkileyici-iletisim-gunu", 8, "\"Do\u011fru \u015feyi s\u00f6ylemek yetmez \u2014 do\u011fru \u015fekilde s\u00f6ylemek gerekir.\"", "\u0130kna g\u00fcc\u00fc zay\u0131f olan profesyoneller, iyi fikirlerini hayata ge\u00e7iremiyor; ba\u011flam ve kitleye g\u00f6re ikna tekniklerini de\u011fi\u015ftirmeyi bilen \u00e7ok az ki\u015fi var.", 5, "PHYSICAL", 2000, "./assets/courses/E065.jpg", "ACTIVE", 0, 4.9, 34, 149, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(8, "E050", "Copywriting: Sat\u0131\u015f Yazan Kelimeler G\u00fcn\u00fc", "copywriting-satis-yazan-kelimeler-gunu", 6, "\"Her kelime para kazanabilir \u2014 ikna eden yazmay\u0131 bug\u00fcn \u00f6\u011frenin.\"", "\u0130\u015fletmeler iyi \u00fcr\u00fcn \u00fcretiyor ama web sitelerinde, reklamlarda ve e-postalarda ikna edici yaz\u0131lar yazam\u0131yor; sat\u0131\u015f yazmak (copywriting) ayr\u0131 bir disiplin ve \u00f6\u011frenilmesi gerekiyor.", 5, "ONLINE", 2200, "./assets/courses/E050.jpg", "ACTIVE", 0, 4.6, 54, 123, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(14, "E051", "Foto\u011fraf Edit\u00f6rl\u00fc\u011f\u00fc: Lightroom ile Profesyonel Renklendirme", "fotograf-editorlugu-lightroom-ile-profesyonel-renklendirme", 6, "\"S\u0131radan foto\u011fraflar\u0131 sanat eserine d\u00f6n\u00fc\u015ft\u00fcren tek ara\u00e7 \u2014 bug\u00fcn ustas\u0131ndan \u00f6\u011frenin.\"", "Sosyal medya i\u00e7in \u00e7ekilen foto\u011fraflar ham haliyle payla\u015f\u0131l\u0131yor ya da filtrelerle bozuluyor; Lightroom'u sistematik \u00f6\u011frenmek i\u00e7in kapsaml\u0131 bir kurs aray\u0131\u015f\u0131 var.", 5, "ONLINE", 1800, "./assets/courses/E051.jpg", "ACTIVE", 0, 4.9, 19, 99, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(18, "E046", "K\u0131sa Video Prod\u00fcksiyonu: Reels & TikTok \u0130\u00e7erik G\u00fcn\u00fc", "kisa-video-produksiyonu-reels-ve-tiktok-icerik-gunu", 6, "\"60 saniyede bir topluluk yarat\u0131n \u2014 bug\u00fcn ilk viral videonuzu \u00e7ekin.\"", "K\u0131sa video format\u0131 t\u00fcm sosyal medya platformlar\u0131nda en h\u0131zl\u0131 b\u00fcy\u00fcyen i\u00e7erik t\u00fcr\u00fc; ancak kurgu, ses ekleme ve algoritma dostu i\u00e7erik yap\u0131s\u0131n\u0131 bilen i\u00e7erik \u00fcretici say\u0131s\u0131 h\u00e2l\u00e2 az.", 6, "PHYSICAL", 2000, "./assets/courses/E046.jpg", "ACTIVE", 0, 4.7, 13, 109, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(8, "E048", "M\u00fczik Prod\u00fcksiyonu: DAW ile Beat ve Demo Kay\u0131t G\u00fcn\u00fc", "muzik-produksiyonu-daw-ile-beat-ve-demo-kayit-gunu", 6, "\"Kafan\u0131zdaki m\u00fczi\u011fi bug\u00fcn d\u0131\u015far\u0131ya \u00e7\u0131kar\u0131n \u2014 st\u00fcdyo art\u0131k bilgisayar\u0131n\u0131zda.\"", "M\u00fczik \u00fcretimine merakl\u0131 gen\u00e7ler, \"st\u00fcdyo\" zannedilen dijital prod\u00fcksiyonun asl\u0131nda diz\u00fcst\u00fc bilgisayarla yap\u0131labildi\u011fini \u00f6\u011frenemiyor; ba\u015flang\u0131\u00e7 e\u015fi\u011fi gereksiz y\u00fcksek alg\u0131lan\u0131yor.", 7, "ONLINE", 2200, "./assets/courses/E048.jpg", "ACTIVE", 0, 4.8, 63, 154, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(14, "E052", "Newsletter & E-Posta Pazarlama: Abonelik Listesi B\u00fcy\u00fctme G\u00fcn\u00fc", "newsletter-ve-e-posta-pazarlama-abonelik-listesi-buyutme-gunu", 6, "\"Algoritma sizi engelleyemez \u2014 kendi listeniz sizin \u00f6zg\u00fcrl\u00fc\u011f\u00fcn\u00fcz.\"", "Sosyal medyan\u0131n algoritma ba\u011f\u0131ml\u0131l\u0131\u011f\u0131na kar\u015f\u0131 e-posta listesi en g\u00fcvenilir kanalken, T\u00fcrk i\u00e7erik \u00fcreticileri ve giri\u015fimcilerin b\u00fcy\u00fck \u00e7o\u011funlu\u011funun aktif bir liste stratejisi yok.", 5, "ONLINE", 1900, "./assets/courses/E052.jpg", "ACTIVE", 0, 4.8, 47, 142, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(18, "E045", "Telefon Foto\u011fraf\u00e7\u0131l\u0131\u011f\u0131: Pro Sonu\u00e7, S\u0131f\u0131r Ekipman G\u00fcn\u00fc", "telefon-fotografciligi-pro-sonuc-sifir-ekipman-gunu", 6, "\"Cebinizdeki telefon bir st\u00fcdyo kameras\u0131 kadar g\u00fc\u00e7l\u00fc \u2014 bug\u00fcn bunu kan\u0131tlay\u0131n.\"", "Sosyal medya merakl\u0131lar\u0131 ve k\u00fc\u00e7\u00fck i\u015fletme sahipleri pahal\u0131 DSLR kamera olmadan profesyonel foto\u011fraf \u00e7ekemeyeceklerini d\u00fc\u015f\u00fcn\u00fcyor; telefon kameras\u0131n\u0131n g\u00fcc\u00fcn\u00fc kullanmay\u0131 bilmiyorlar.", 5, "PHYSICAL", 1700, "./assets/courses/E045.jpg", "ACTIVE", 0, 4.9, 41, 186, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(8, "E047", "Yarat\u0131c\u0131 Yazarl\u0131k: Roman Karakteri & Hikaye Kurgusu G\u00fcn\u00fc", "yaratici-yazarlik-roman-karakteri-ve-hikaye-kurgusu-gunu", 6, "\"O bo\u015f sayfay\u0131 doldurman\u0131n s\u0131rr\u0131n\u0131 \u00f6\u011frenin \u2014 hikayeniz bug\u00fcn ba\u015fl\u0131yor.\"", "\"Bir g\u00fcn roman yazaca\u011f\u0131m\" diyenler ilk sayfada t\u0131kan\u0131yor; yazmay\u0131 de\u011fil, anlat\u0131 yap\u0131s\u0131n\u0131 ve karakter derinli\u011fini nas\u0131l olu\u015fturacaklar\u0131n\u0131 \u00f6\u011frenecek pratik bir format bulam\u0131yorlar.", 6, "ONLINE", 1800, "./assets/courses/E047.jpg", "ACTIVE", 0, 4.8, 32, 34, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(14, "E049", "\u0130ll\u00fcstrasyon & Dijital \u00c7izim: Procreate ile 1 G\u00fcnde", "illustrasyon-ve-dijital-cizim-procreate-ile-1-gunde", 6, "\"iPad'iniz at\u0131l kalmas\u0131n \u2014 bug\u00fcn ill\u00fcstrasyon sanat\u00e7\u0131s\u0131na d\u00f6n\u00fc\u015f\u00fcn.\"", "iPad ve Procreate sahibi binlerce kullan\u0131c\u0131 bu ara\u00e7lar\u0131n y\u00fczde onunu kullan\u0131yor; dijital ill\u00fcstrasyona ge\u00e7mek isteyenler sistematik bir ba\u015flang\u0131\u00e7 e\u011fitiminden yoksun.", 6, "ONLINE", 2000, "./assets/courses/E049.jpg", "ACTIVE", 0, 4.5, 65, 34, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(12, "E073", "Dijital Denge: \u00c7ocu\u011fumu Ekran Ba\u011f\u0131ml\u0131l\u0131\u011f\u0131ndan Koruma G\u00fcn\u00fc", "dijital-denge-cocugumu-ekran-bagimliligindan-koruma-gunu", 9, "\"Telefonunu elimden almak \u00e7\u00f6z\u00fcm de\u011fil \u2014 kal\u0131c\u0131 dijital denge bug\u00fcn ba\u015fl\u0131yor.\"", "T\u00fcrk ebeveynlerin b\u00fcy\u00fck \u00e7o\u011funlu\u011fu \u00e7ocuklar\u0131n\u0131n ekran s\u00fcresi konusunda kayg\u0131 duyuyor ama yasaklama yerine sa\u011fl\u0131kl\u0131 dijital al\u0131\u015fkanl\u0131k olu\u015fturma konusunda pratik bilgiden yoksun.", 4, "ONLINE", 1500, "./assets/courses/E073.jpg", "ACTIVE", 0, 4.8, 33, 174, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(20, "E072", "Ebeveyn & \u00c7ocuk Mutfak: K\u00fc\u00e7\u00fck A\u015f\u00e7\u0131lar G\u00fcn\u00fc (7-14 Ya\u015f)", "ebeveyn-ve-cocuk-mutfak-kucuk-ascilar-gunu-7-14-yas", 9, "\"K\u00fc\u00e7\u00fck ellerin yapt\u0131\u011f\u0131 yemek her zaman daha lezzetlidir \u2014 bug\u00fcn birlikte pi\u015firin.\"", "\u00c7ocuklara beslenme fark\u0131ndal\u0131\u011f\u0131 ve mutfak becerileri kazand\u0131rmak i\u00e7in ebeveyn-\u00e7ocuk birlikte yemek yap\u0131m at\u00f6lyesi format\u0131 neredeyse bulunmuyor.", 4, "PHYSICAL", 1700, "./assets/courses/E072.jpg", "ACTIVE", 0, 4.9, 11, 125, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(6, "E067", "Ebeveyn-\u00c7ocuk STEM: Evde Deney G\u00fcn\u00fc (6-12 Ya\u015f)", "ebeveyn-cocuk-stem-evde-deney-gunu-6-12-yas", 9, "\"Merak etmesi i\u00e7in \u00f6nce deneyimlesin \u2014 bug\u00fcn ebeveyn-\u00e7ocuk bilim g\u00fcn\u00fc.\"", "Ebeveynler \u00e7ocuklar\u0131na bilim sevgisi a\u015f\u0131lamak istiyor ama hangi deneyleri nas\u0131l yapacaklar\u0131n\u0131 bilmiyor; birlikte ge\u00e7irilen kaliteli zaman ve STEM e\u011fitimini birle\u015ftiren format eksik.", 4, "PHYSICAL", 1800, "./assets/courses/E067.jpg", "ACTIVE", 0, 4.9, 31, 127, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(12, "E070", "Ebeveyn-\u00c7ocuk Sanat At\u00f6lyesi: Ortak Resim & Kolaj G\u00fcn\u00fc", "ebeveyn-cocuk-sanat-atolyesi-ortak-resim-ve-kolaj-gunu", 9, "\"En g\u00fczel tablo birlikte yap\u0131land\u0131r \u2014 bug\u00fcn \u00e7ocu\u011funuzla sanat\u0131 ke\u015ffedin.\"", "Ebeveynler ve \u00e7ocuklar ayn\u0131 anda ayn\u0131 mek\u00e2nda birlikte \u00fcretme deneyiminden yoksun; ekran zaman\u0131na alternatif yarat\u0131c\u0131 ba\u011f kurma aktiviteleri olduk\u00e7a s\u0131n\u0131rl\u0131.", 4, "PHYSICAL", 1600, "./assets/courses/E070.jpg", "ACTIVE", 0, 4.5, 65, 196, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(20, "E071", "\u00c7ocuklarda Duygusal Zek\u00e2: Ebeveyn Ko\u00e7lu\u011fu G\u00fcn\u00fc", "cocuklarda-duygusal-zeka-ebeveyn-koclugu-gunu", 9, "\"\u00c7ocu\u011funuz a\u011flad\u0131\u011f\u0131nda ne yapaca\u011f\u0131n\u0131z\u0131 bilmek onu hayata haz\u0131rlar.\"", "\u00c7ocuklar\u0131n \u00f6fke, kayg\u0131 ve hayal k\u0131r\u0131kl\u0131\u011f\u0131 gibi duygular\u0131yla ba\u015fa \u00e7\u0131kmas\u0131na yard\u0131m etmek isteyen ebeveynler, bu s\u00fcre\u00e7te ne yapacaklar\u0131n\u0131 bilmiyor; yanl\u0131\u015f tepkiler \u00e7ocu\u011fun duygusal geli\u015fimini k\u0131s\u0131tl\u0131yor.", 5, "ONLINE", 1900, "./assets/courses/E071.jpg", "ACTIVE", 0, 4.5, 60, 47, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(6, "E068", "\u00c7ocuklarla Felsefe: Soru Soran Nesil Yeti\u015ftirme G\u00fcn\u00fc", "cocuklarla-felsefe-soru-soran-nesil-yetistirme-gunu", 9, "\"Soru soran \u00e7ocuk d\u00fcnyay\u0131 de\u011fi\u015ftirir \u2014 bug\u00fcn o merak\u0131 birlikte besleyin.\"", "\u00c7ocuklar\u0131n merak ve ele\u015ftirel d\u00fc\u015f\u00fcnme kapasitesi yanl\u0131\u015f e\u011fitim yakla\u015f\u0131m\u0131yla k\u00f6rle\u015fiyor; ebeveynler \"neden\" sorular\u0131n\u0131 nas\u0131l yan\u0131tlayacaklar\u0131n\u0131 ve bu merak\u0131 nas\u0131l besleyeceklerini bilmiyor.", 4, "PHYSICAL", 1500, "./assets/courses/E068.jpg", "ACTIVE", 0, 4.9, 59, 170, now);
    sqlite.prepare("INSERT OR IGNORE INTO courses (instructor_id, code, title, slug, category_id, description_short, description_detail, duration_hours, format, price, image_url, status, is_featured, avg_rating, review_count, total_enrolled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(12, "E069", "\u00c7ocuklarla Kodlama: Scratch ile Animasyon G\u00fcn\u00fc (8-13 Ya\u015f)", "cocuklarla-kodlama-scratch-ile-animasyon-gunu-8-13-yas", 9, "\"\u00c7ocu\u011funuz ekran izlesin de\u011fil, ekran\u0131 kontrol etsin \u2014 bug\u00fcn kodlamaya ba\u015flas\u0131n.\"", "Dijital \u00e7a\u011f\u0131n temel okuryazarl\u0131\u011f\u0131 olarak kabul g\u00f6ren kodlamay\u0131 \u00f6\u011fretmek isteyen ebeveynler, \u00e7ocu\u011funun ya\u015f\u0131na uygun, e\u011flenceli ve yo\u011fun format bir kurs bulam\u0131yor.", 5, "PHYSICAL", 2000, "./assets/courses/E069.jpg", "ACTIVE", 0, 4.5, 40, 198, now);
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'gastronomi')) WHERE slug = 'gastronomi'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'el-sanatlari')) WHERE slug = 'el-sanatlari'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'ai-ve-dijital')) WHERE slug = 'ai-ve-dijital'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'finans')) WHERE slug = 'finans'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'girisimcilik')) WHERE slug = 'girisimcilik'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'yaratici-uretim')) WHERE slug = 'yaratici-uretim'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'saglik-ve-wellbeing')) WHERE slug = 'saglik-ve-wellbeing'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'sosyal-yetkinlikler')) WHERE slug = 'sosyal-yetkinlikler'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'cocuklu-ebeveynlere-yonelik')) WHERE slug = 'cocuklu-ebeveynlere-yonelik'");
    sqlite.exec("UPDATE categories SET course_count = (SELECT COUNT(*) FROM courses WHERE category_id = (SELECT id FROM categories WHERE slug = 'kurumsal-calisanlara-yonelik')) WHERE slug = 'kurumsal-calisanlara-yonelik'");
    console.log("✅ Seed complete: admin + 20 instructors + 80 courses + 10 categories");
  } catch(e: any) {
    console.error("⚠️ Seed error:", e?.message);
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
