import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import {
  users, instructors, categories, courses, sessions, reviews
} from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Simple password hash
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "birgundeogren_salt").digest("hex");
}

// Fixed slugify — handles uppercase Turkish chars too
function slugify(text: string): string {
  return text
    .replace(/İ/g, "i").replace(/Ş/g, "s").replace(/Ğ/g, "g")
    .replace(/Ö/g, "o").replace(/Ü/g, "u").replace(/Ç/g, "c")
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/\./g, "").replace(/[^0-9]/g, ""), 10);
}

function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 4;
}

function parseFormat(formatStr: string): "PHYSICAL" | "ONLINE" | "HYBRID" {
  const lower = formatStr.toLowerCase();
  if (lower.includes("hibrit")) return "HYBRID";
  if (lower.includes("fiziksel") || lower.includes("fiziki")) return "PHYSICAL";
  return "ONLINE";
}

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite);

// Run schema creation
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

const now = new Date().toISOString();

// Clear existing data
console.log("🗑  Clearing existing data...");
sqlite.exec(`
  DELETE FROM reviews;
  DELETE FROM cart_items;
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM favorites;
  DELETE FROM sessions;
  DELETE FROM courses;
  DELETE FROM categories;
  DELETE FROM instructors;
  DELETE FROM users;
`);

// Load JSON data
const coursesData = JSON.parse(
  fs.readFileSync("/home/user/workspace/web_courses.json", "utf-8")
);
const categoriesData = JSON.parse(
  fs.readFileSync("/home/user/workspace/web_categories.json", "utf-8")
);

// 1. Seed admin user
console.log("👤 Creating admin user...");
const adminUser = db.insert(users).values({
  email: "admin@birgundeogren.com",
  passwordHash: hashPassword("Admin2026!"),
  firstName: "Admin",
  lastName: "Yönetici",
  role: "ADMIN",
  emailVerified: true,
  isActive: true,
  createdAt: now,
}).returning().get();

// 2. Seed 20 diverse Turkish instructors
console.log("👨‍🏫 Creating instructors...");

const instructorDefs = [
  { firstName: "Ayşe", lastName: "Demir", displayName: "Dr. Ayşe Demir", email: "ayse.demir@birgundeogren.com", expertise: ["Sağlık & Wellbeing", "Çocuklu Ebeveynlere Yönelik"], bio: "Psikiyatri uzmanı, 12 yıllık klinik deneyime sahip eğitimci. Mindfulness ve wellbeing alanında 2.000+ kişiye eğitim verdi.", exp: 12, rating: 4.8, students: 2100 },
  { firstName: "Mehmet", lastName: "Özkan", displayName: "Mehmet Özkan", email: "mehmet.ozkan@birgundeogren.com", expertise: ["Girişimcilik", "Finans"], bio: "Seri girişimci ve iş geliştirme danışmanı. 3 exit'i olan startup ekosistemi mentorudur.", exp: 15, rating: 4.9, students: 1850 },
  { firstName: "Elif", lastName: "Yıldırım", displayName: "Prof. Dr. Elif Yıldırım", email: "elif.yildirim@birgundeogren.com", expertise: ["AI & Dijital", "Kurumsal Çalışanlara Yönelik"], bio: "Yapay zeka ve makine öğrenmesi alanında akademisyen. 50+ akademik yayın, 8 yıllık endüstri deneyimi.", exp: 10, rating: 4.7, students: 1600 },
  { firstName: "Barış", lastName: "Aydın", displayName: "Barış Aydın", email: "baris.aydin@birgundeogren.com", expertise: ["Finans", "Girişimcilik"], bio: "CFA charterholder, özel bankacılık ve fintek alanında uzman. 10 yıllık Wall Street deneyimi.", exp: 10, rating: 4.8, students: 1200 },
  { firstName: "Deniz", lastName: "Korkmaz", displayName: "Şef Deniz Korkmaz", email: "deniz.korkmaz@birgundeogren.com", expertise: ["Gastronomi"], bio: "Michelin deneyimli şef, gastronomi eğitmeni. Türk ve Akdeniz mutfakları uzmanı.", exp: 14, rating: 4.9, students: 2400 },
  { firstName: "Selin", lastName: "Arslan", displayName: "Selin Arslan", email: "selin.arslan@birgundeogren.com", expertise: ["El Sanatları", "Yaratıcı Üretim"], bio: "Tekstil sanatçısı ve el sanatları eğitmeni. Geleneksel Türk el sanatlarını modern tekniklerle buluşturuyor.", exp: 8, rating: 4.7, students: 980 },
  { firstName: "Caner", lastName: "Bilgin", displayName: "Caner Bilgin", email: "caner.bilgin@birgundeogren.com", expertise: ["AI & Dijital", "Sosyal Yetkinlikler"], bio: "Dijital dönüşüm danışmanı ve AI eğitmeni. Fortune 500 şirketleri ile çalışmış teknoloji uzmanı.", exp: 9, rating: 4.8, students: 1450 },
  { firstName: "Zehra", lastName: "Şahin", displayName: "Zehra Şahin", email: "zehra.sahin@birgundeogren.com", expertise: ["Sağlık & Wellbeing", "El Sanatları"], bio: "Sertifikalı yoga ve meditasyon eğitmeni. Holistik sağlık ve wellbeing alanında 1.500+ kişiye eğitim verdi.", exp: 7, rating: 4.9, students: 1750 },
  { firstName: "Emre", lastName: "Çelik", displayName: "Emre Çelik", email: "emre.celik@birgundeogren.com", expertise: ["Kurumsal Çalışanlara Yönelik", "Sosyal Yetkinlikler"], bio: "Kurumsal iletişim ve liderlik gelişimi uzmanı. 200+ kurumsal program yürütmüş deneyimli koç.", exp: 11, rating: 4.7, students: 1300 },
  { firstName: "Gül", lastName: "Erdoğan", displayName: "Gül Erdoğan", email: "gul.erdogan@birgundeogren.com", expertise: ["Gastronomi", "El Sanatları"], bio: "Pastacılık şefi ve tatlı tasarımcısı. Le Cordon Bleu mezunu, Türk mutfağının dünyaya açılma elçisi.", exp: 10, rating: 4.8, students: 1100 },
  { firstName: "Hakan", lastName: "Tuncer", displayName: "Hakan Tuncer", email: "hakan.tuncer@birgundeogren.com", expertise: ["Finans", "Girişimcilik"], bio: "Ekonomist ve finansal okuryazarlık eğitmeni. Merkez Bankası danışmanlık deneyimi.", exp: 13, rating: 4.6, students: 890 },
  { firstName: "Burcu", lastName: "Karaca", displayName: "Burcu Karaca", email: "burcu.karaca@birgundeogren.com", expertise: ["Sosyal Yetkinlikler", "Çocuklu Ebeveynlere Yönelik"], bio: "Aile terapisti ve iletişim uzmanı. 1.000+ aileye bireysel ve grup danışmanlığı sunmuştur.", exp: 9, rating: 4.8, students: 1600 },
  { firstName: "Tolga", lastName: "Yılmaz", displayName: "Tolga Yılmaz", email: "tolga.yilmaz@birgundeogren.com", expertise: ["AI & Dijital", "Girişimcilik"], bio: "Yazılım mühendisi ve dijital ürün direktörü. 15 yıllık teknoloji deneyimi, 3 unicorn startup'ta çalıştı.", exp: 15, rating: 4.9, students: 2000 },
  { firstName: "İrem", lastName: "Başaran", displayName: "İrem Başaran", email: "irem.basaran@birgundeogren.com", expertise: ["El Sanatları", "Yaratıcı Üretim"], bio: "Endüstriyel tasarımcı ve el sanatları mentoru. Moda-tasarım kesişiminde özgün bir pedagoji geliştirdi.", exp: 6, rating: 4.7, students: 780 },
  { firstName: "Kemal", lastName: "Doğan", displayName: "Kemal Doğan", email: "kemal.dogan@birgundeogren.com", expertise: ["Kurumsal Çalışanlara Yönelik", "Finans"], bio: "Yönetim danışmanı ve organizasyonel verimlilik uzmanı. McKinsey alumni, 100+ kurumsal proje.", exp: 12, rating: 4.7, students: 1050 },
  { firstName: "Naz", lastName: "Kaya", displayName: "Naz Kaya", email: "naz.kaya@birgundeogren.com", expertise: ["Sosyal Yetkinlikler", "Çocuklu Ebeveynlere Yönelik"], bio: "Çocuk gelişimi uzmanı ve ebeveynlik koçu. TED konuşmacısı, 3 bestseller kitap yazarı.", exp: 10, rating: 4.9, students: 2200 },
  { firstName: "Serhat", lastName: "Öztürk", displayName: "Serhat Öztürk", email: "serhat.ozturk@birgundeogren.com", expertise: ["Girişimcilik", "AI & Dijital"], bio: "Teknoloji girişimcisi ve mentor. Türkiye'nin ilk yapay zeka hızlandırma programını kurdu.", exp: 11, rating: 4.8, students: 1700 },
  { firstName: "Defne", lastName: "Aksoy", displayName: "Defne Aksoy", email: "defne.aksoy@birgundeogren.com", expertise: ["Gastronomi", "Sağlık & Wellbeing"], bio: "Beslenme uzmanı ve sağlıklı yaşam eğitmeni. Fonksiyonel tıp ve bütüncül beslenme alanında uzman.", exp: 8, rating: 4.8, students: 1400 },
  { firstName: "Ozan", lastName: "Güneş", displayName: "Ozan Güneş", email: "ozan.gunes@birgundeogren.com", expertise: ["Yaratıcı Üretim", "AI & Dijital"], bio: "Kreatif direktör ve içerik stratejisti. 200+ marka için yaratıcı kampanyalar yürüttü.", exp: 12, rating: 4.7, students: 920 },
  { firstName: "Pınar", lastName: "Çetin", displayName: "Pınar Çetin", email: "pinar.cetin@birgundeogren.com", expertise: ["Finans", "Kurumsal Çalışanlara Yönelik"], bio: "SPK lisanslı yatırım danışmanı ve finans eğitmeni. Bireysel yatırımcı eğitiminde öncü isim.", exp: 9, rating: 4.8, students: 1300 },
];

const createdInstructors: any[] = [];
for (const iDef of instructorDefs) {
  const instrUser = db.insert(users).values({
    email: iDef.email,
    passwordHash: hashPassword("egitimci123"),
    firstName: iDef.firstName,
    lastName: iDef.lastName,
    role: "INSTRUCTOR",
    emailVerified: true,
    isActive: true,
    createdAt: now,
  }).returning().get();

  const instrRecord = db.insert(instructors).values({
    userId: instrUser.id,
    displayName: iDef.displayName,
    bio: iDef.bio,
    expertiseAreas: JSON.stringify(iDef.expertise),
    experienceYears: iDef.exp,
    linkedinUrl: `https://linkedin.com/in/${slugify(iDef.displayName)}`,
    status: "APPROVED",
    avgRating: iDef.rating,
    totalStudents: iDef.students,
    createdAt: now,
  }).returning().get();

  createdInstructors.push({ ...instrRecord, expertise: iDef.expertise });
}

console.log(`   Created ${createdInstructors.length} instructors`);

// 3. Seed categories
console.log("📂 Seeding categories...");
const categoryMap: Record<string, number> = {};

for (const [name, data] of Object.entries(categoriesData) as [string, any][]) {
  const slug = slugify(name);
  const category = db.insert(categories).values({
    name,
    slug,
    color: data.color,
    icon: data.icon,
    imageUrl: `./assets/categories/cat_${data.img || slugify(name)}.jpg`,
    courseCount: 0,
  }).returning().get();
  categoryMap[name] = category.id;
}

// Map category name → instructor(s)
const expertiseToCatName: Record<string, string> = {
  "Gastronomi": "Gastronomi",
  "El Sanatları": "El Sanatları",
  "Yaratıcı Üretim": "Yaratıcı Üretim",
  "AI & Dijital": "AI & Dijital",
  "Finans": "Finans",
  "Girişimcilik": "Girişimcilik",
  "Sağlık & Wellbeing": "Sağlık & Wellbeing",
  "Sosyal Yetkinlikler": "Sosyal Yetkinlikler",
  "Çocuklu Ebeveynlere Yönelik": "Çocuklu Ebeveynlere Yönelik",
  "Kurumsal Çalışanlara Yönelik": "Kurumsal Çalışanlara Yönelik",
};

// Build a mapping: category name → list of instructor ids
const catToInstructors: Record<string, number[]> = {};
for (const instr of createdInstructors) {
  for (const exp of instr.expertise) {
    const catName = expertiseToCatName[exp];
    if (catName) {
      if (!catToInstructors[catName]) catToInstructors[catName] = [];
      catToInstructors[catName].push(instr.id);
    }
  }
}

// 4. Seed courses
console.log("📚 Seeding 80 courses...");
const insertedCourses: any[] = [];

const featuredCodes = ["E019", "E022", "E025", "E001", "E008", "E015", "E030", "E040"];
const codeIndex: Record<string, number> = {};

for (let i = 0; i < coursesData.length; i++) {
  const c = coursesData[i];
  const catId = categoryMap[c.category];
  if (!catId) {
    console.warn(`  ⚠ Category not found: ${c.category} for course ${c.code}`);
    continue;
  }

  const slug = slugify(c.title);
  const finalSlug = codeIndex[slug] !== undefined ? `${slug}-${c.code.toLowerCase()}` : slug;
  codeIndex[slug] = (codeIndex[slug] || 0) + 1;

  // Assign instructor by category, rotating through available instructors
  const catInstructors = catToInstructors[c.category] ?? [createdInstructors[0].id];
  const instructorId = catInstructors[i % catInstructors.length];

  const isFeatured = featuredCodes.includes(c.code);
  // Use relative path with ./assets/ prefix
  const imageUrl = `./assets/courses/${c.code}.jpg`;

  const curriculum = JSON.stringify([
    { title: "Giriş ve Tanışma", duration: "30 dk", items: ["Program tanıtımı", "Beklentilerin belirlenmesi"] },
    { title: "Temel Kavramlar", duration: "90 dk", items: [c.problem.substring(0, 80)] },
    { title: "Uygulamalı Çalışma", duration: "120 dk", items: ["Hands-on uygulama", "Örnek çalışmalar"] },
    { title: "Sonuç ve Değerlendirme", duration: "30 dk", items: [c.outcome.substring(0, 80)] },
  ]);

  const faq = JSON.stringify([
    { q: "Bu eğitim için ön bilgi gerekli mi?", a: "Hayır, eğitim başlangıç seviyesinden ileri seviyeye kadar herkese uygundur." },
    { q: "Eğitim materyalleri paylaşılacak mı?", a: "Evet, tüm katılımcılara dijital eğitim materyalleri ve kaynaklar paylaşılacaktır." },
    { q: "Sertifika verilecek mi?", a: "Eğitimi tamamlayan tüm katılımcılara dijital katılım sertifikası verilmektedir." },
  ]);

  const course = db.insert(courses).values({
    instructorId,
    code: c.code,
    title: c.title,
    slug: finalSlug,
    categoryId: catId,
    descriptionShort: c.hook,
    descriptionDetail: c.problem,
    durationHours: parseDuration(c.duration),
    format: parseFormat(c.format),
    price: parsePrice(c.price),
    imageUrl,
    curriculum,
    requirements: JSON.stringify(["Bilgisayar veya tablet", "İnternet bağlantısı"]),
    faq,
    tags: JSON.stringify([c.category, "1 günlük eğitim", "workshop"]),
    seoTitle: c.seo_title,
    seoDescription: c.hook,
    status: "ACTIVE",
    isFeatured,
    avgRating: 4.5 + Math.random() * 0.4,
    reviewCount: Math.floor(Math.random() * 50) + 10,
    totalEnrolled: Math.floor(Math.random() * 200) + 20,
    createdAt: now,
  }).returning().get();

  insertedCourses.push(course);
}

// Update category course counts
console.log("🔢 Updating category counts...");
for (const catId of Object.values(categoryMap)) {
  const actualCount = (sqlite.prepare(`SELECT count(*) as c FROM courses WHERE category_id = ? AND status = 'ACTIVE'`).get(catId) as any)?.c ?? 0;
  sqlite.prepare(`UPDATE categories SET course_count = ? WHERE id = ?`).run(actualCount, catId);
}

// 5. Seed sessions for first 40 courses
console.log("📅 Seeding sessions...");
const sessionDates = [
  "2026-04-05", "2026-04-12", "2026-04-19", "2026-04-26",
  "2026-05-03", "2026-05-10", "2026-05-17", "2026-05-24",
];

for (let i = 0; i < Math.min(insertedCourses.length, 40); i++) {
  const course = insertedCourses[i];
  const numSessions = Math.floor(Math.random() * 2) + 2;
  
  for (let j = 0; j < numSessions && j < sessionDates.length; j++) {
    const isOnline = course.format === "ONLINE" || course.format === "HYBRID";
    const endHour = 9 + course.durationHours;
    
    db.insert(sessions).values({
      courseId: course.id,
      date: sessionDates[(i + j) % sessionDates.length],
      startTime: "09:00",
      endTime: `${endHour.toString().padStart(2, "0")}:00`,
      locationType: isOnline ? "ONLINE" : "PHYSICAL",
      address: isOnline ? null : "Levent, İstanbul",
      onlineLink: isOnline ? "https://meet.google.com/xyz-abc-def" : null,
      city: "İstanbul",
      capacity: 20,
      enrolled: Math.floor(Math.random() * 15),
      earlyBirdPrice: course.price * 0.85,
      earlyBirdDeadline: "2026-03-30",
      status: "SCHEDULED",
      createdAt: now,
    }).run();
  }
}

// 6. Seed demo student user
console.log("👩‍🎓 Creating demo student...");
const studentUser = db.insert(users).values({
  email: "ogrenci@birgundeogren.com",
  passwordHash: hashPassword("ogrenci123"),
  firstName: "Elif",
  lastName: "Şahin",
  role: "STUDENT",
  emailVerified: true,
  isActive: true,
  createdAt: now,
}).returning().get();

// 7. Seed sample reviews
console.log("⭐ Seeding reviews...");
const reviewTexts = [
  "Harika bir eğitimdi! Çok pratik bilgiler öğrendim, hemen uygulamaya koyabilecek seviyede.",
  "Eğitimci çok deneyimli ve bilgili. Sorularımızı sabırla yanıtladı. Kesinlikle tavsiye ederim.",
  "Tek günde bu kadar şey öğreneceğimi düşünmemiştim. Yoğun ama değerliydi.",
  "Materyaller çok iyiydi, özellikle pratik egzersizler çok faydalıydı.",
  "Grubu küçük tutmaları sayesinde kişisel ilgi gördük. Teşekkürler!",
];

for (let i = 0; i < Math.min(insertedCourses.length, 15); i++) {
  const course = insertedCourses[i];
  const numReviews = Math.floor(Math.random() * 3) + 1;
  
  for (let j = 0; j < numReviews; j++) {
    db.insert(reviews).values({
      userId: studentUser.id,
      courseId: course.id,
      rating: Math.floor(Math.random() * 2) + 4,
      comment: reviewTexts[(i + j) % reviewTexts.length],
      isVisible: true,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).run();
  }
}

console.log("✅ Seeding completed successfully!");
console.log(`   Categories: ${Object.keys(categoryMap).length}`);
console.log(`   Courses: ${insertedCourses.length}`);
console.log(`   Instructors: ${createdInstructors.length}`);
console.log(`   Users: Admin + ${createdInstructors.length} instructors + 1 student`);
console.log(`\n   Admin login: admin@birgundeogren.com / Admin2026!`);
console.log(`   Student login: ogrenci@birgundeogren.com / ogrenci123`);

// Kuniq Capital Inc. branding note
console.log(`\n   Platform: Kuniq Capital Inc. — birgundeogren.com`);

sqlite.close();
