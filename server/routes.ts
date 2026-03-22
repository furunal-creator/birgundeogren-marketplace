import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as crypto from "crypto";

// ── SIMPLE AUTH HELPER ────────────────────────────────
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "birgundeogren_salt").digest("hex");
}

// Simple token: base64 of userId:timestamp:secret
const TOKEN_SECRET = "birgundeogren_jwt_secret_2026";

function createToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${TOKEN_SECRET}`;
  return Buffer.from(payload).toString("base64");
}

function verifyToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return null;
    const userId = parseInt(parts[0], 10);
    if (isNaN(userId)) return null;
    return userId;
  } catch {
    return null;
  }
}

// ── ADMIN MIDDLEWARE ─────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin yetkisi gerekli" });
  }
  next();
}

// ── AUTH MIDDLEWARE ───────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkisiz erişim" });
  }
  const token = auth.slice(7);
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Geçersiz token" });
  }
  const user = storage.getUser(userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Kullanıcı bulunamadı" });
  }
  (req as any).userId = userId;
  (req as any).user = user;
  next();
}

function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const userId = verifyToken(token);
    if (userId) {
      (req as any).userId = userId;
      (req as any).user = storage.getUser(userId);
    }
  }
  next();
}

// ── HELPERS ───────────────────────────────────────────
function formatCourse(course: any) {
  return {
    ...course,
    priceFormatted: formatPrice(course.price),
  };
}

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR") + " TL";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ── ROUTES ────────────────────────────────────────────
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ── CATEGORIES ──────────────────────────────────────
  app.get("/api/categories", (_req, res) => {
    const cats = storage.listCategories();
    res.json(cats);
  });

  // ── COURSES ─────────────────────────────────────────
  app.get("/api/courses/featured", (_req, res) => {
    const featured = storage.listFeaturedCourses(8);
    const result = featured.map(c => {
      const cat = storage.getCategory(c.categoryId);
      const instr = c.instructorId ? storage.getInstructor(c.instructorId) : null;
      return { ...formatCourse(c), category: cat, instructor: instr };
    });
    res.json(result);
  });

  app.get("/api/courses", (req, res) => {
    const {
      kategori, format, priceMin, priceMax,
      q, sort, page, limit,
    } = req.query as Record<string, string>;

    let categoryId: number | undefined;
    if (kategori) {
      const cat = storage.getCategoryBySlug(kategori);
      if (cat) categoryId = cat.id;
      else {
        // Try by ID
        const catById = storage.getCategory(parseInt(kategori));
        if (catById) categoryId = catById.id;
      }
    }

    const { courses, total } = storage.listCourses({
      categoryId,
      format: format as any,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      search: q,
      sort: sort || "recommended",
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
    });

    const result = courses.map(c => {
      const cat = storage.getCategory(c.categoryId);
      const instr = c.instructorId ? storage.getInstructor(c.instructorId) : null;
      return { ...formatCourse(c), category: cat, instructor: instr };
    });

    res.json({
      courses: result,
      total,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
      totalPages: Math.ceil(total / (limit ? parseInt(limit) : 12)),
    });
  });

  app.get("/api/courses/:slug", (req, res) => {
    const { slug } = req.params;
    // Try by slug first
    let course = storage.getCourseBySlug(slug);
    // Then by code (e.g. E001)
    if (!course) course = storage.getCourseByCode(slug.toUpperCase());
    if (!course) return res.status(404).json({ error: "Eğitim bulunamadı" });

    const cat = storage.getCategory(course.categoryId);
    const instr = course.instructorId ? storage.getInstructor(course.instructorId) : null;
    let instrUser = null;
    if (instr) instrUser = storage.getUser(instr.userId);

    const sessionsData = storage.listSessionsByCourse(course.id);
    const reviewsData = storage.listReviewsByCourse(course.id);

    // Enrich reviews with user info
    const enrichedReviews = reviewsData.map(r => {
      const u = storage.getUser(r.userId);
      return { ...r, user: u ? { firstName: u.firstName, lastName: u.lastName } : null };
    });

    // Related courses (same category, different course)
    const related = storage.listCourses({
      categoryId: course.categoryId,
      limit: 4,
    }).courses.filter(c => c.id !== course!.id).slice(0, 4);

    res.json({
      ...formatCourse(course),
      category: cat,
      instructor: instr ? { ...instr, user: instrUser } : null,
      sessions: sessionsData,
      reviews: enrichedReviews,
      related: related.map(c => {
        const c2 = storage.getCategory(c.categoryId);
        return { ...formatCourse(c), category: c2 };
      }),
    });
  });

  app.get("/api/courses/:id/sessions", (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = storage.getCourse(courseId);
    if (!course) {
      // Try by slug
      const bySlag = storage.getCourseBySlug(req.params.id);
      if (!bySlag) return res.status(404).json({ error: "Eğitim bulunamadı" });
      return res.json(storage.listSessionsByCourse(bySlag.id));
    }
    res.json(storage.listSessionsByCourse(courseId));
  });

  app.get("/api/courses/:id/reviews", (req, res) => {
    const courseId = parseInt(req.params.id);
    const reviewsData = storage.listReviewsByCourse(courseId);
    const enriched = reviewsData.map(r => {
      const u = storage.getUser(r.userId);
      return { ...r, user: u ? { firstName: u.firstName, lastName: u.lastName } : null };
    });
    res.json(enriched);
  });

  // ── AUTH ────────────────────────────────────────────
  app.post("/api/auth/register", (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Tüm zorunlu alanları doldurun" });
    }
    if (storage.getUserByEmail(email)) {
      return res.status(409).json({ error: "Bu e-posta zaten kayıtlı" });
    }
    const user = storage.createUser({
      email,
      passwordHash: hashPassword(password),
      firstName,
      lastName,
      phone,
      role: "STUDENT",
      emailVerified: false,
      isActive: true,
    });
    const token = createToken(user.id);
    res.status(201).json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-posta ve şifre gerekli" });
    }
    const user = storage.getUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "Hesabınız devre dışı" });
    }
    const token = createToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = (req as any).user;
    const instructor = storage.getInstructorByUserId(user.id);
    res.json({
      id: user.id, email: user.email,
      firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, role: user.role,
      instructor: instructor || null,
    });
  });

  // ── CART ────────────────────────────────────────────
  app.get("/api/cart", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const items = storage.getCartItems(userId);
    const enriched = items.map(item => {
      const course = storage.getCourse(item.courseId);
      const session = storage.getSession(item.sessionId);
      const cat = course ? storage.getCategory(course.categoryId) : null;
      return { ...item, course: course ? { ...formatCourse(course), category: cat } : null, session };
    });
    res.json(enriched);
  });

  app.post("/api/cart", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const { sessionId, courseId } = req.body;
    if (!sessionId || !courseId) {
      return res.status(400).json({ error: "sessionId ve courseId gerekli" });
    }
    // Check if already in cart
    const existing = storage.getCartItems(userId);
    if (existing.some(i => i.courseId === courseId)) {
      return res.status(409).json({ error: "Bu eğitim zaten sepetinizde" });
    }
    const item = storage.addCartItem({ userId, sessionId, courseId });
    res.status(201).json(item);
  });

  app.delete("/api/cart/:id", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const id = parseInt(req.params.id);
    const removed = storage.removeCartItem(id, userId);
    if (!removed) return res.status(404).json({ error: "Sepet öğesi bulunamadı" });
    res.json({ success: true });
  });

  // ── ORDERS ──────────────────────────────────────────
  app.post("/api/orders", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const cartItems = storage.getCartItems(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Sepetiniz boş" });
    }

    const { paymentMethod = "CREDIT_CARD", invoiceType, invoiceData } = req.body;

    // Calculate totals
    let subtotal = 0;
    const itemDetails: any[] = [];
    for (const item of cartItems) {
      const course = storage.getCourse(item.courseId);
      if (!course) continue;
      subtotal += course.price;
      itemDetails.push({ ...item, course });
    }

    const orderNo = `BGO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = storage.createOrder({
      userId,
      orderNo,
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod: paymentMethod as any,
      paymentStatus: "PAID",
      invoiceType: invoiceType as any,
      invoiceData: invoiceData ? JSON.stringify(invoiceData) : null,
      paidAt: new Date().toISOString(),
    });

    for (const item of itemDetails) {
      const platformFee = item.course.price * 0.20;
      const instructorShare = item.course.price * 0.80;
      storage.createOrderItem({
        orderId: order.id,
        sessionId: item.sessionId,
        courseId: item.courseId,
        instructorId: item.course.instructorId,
        unitPrice: item.course.price,
        platformFee,
        instructorShare,
        status: "ACTIVE",
      });
    }

    storage.clearCart(userId);
    res.status(201).json(order);
  });

  app.get("/api/orders", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const userOrders = storage.listOrdersByUser(userId);
    const enriched = userOrders.map(order => {
      const items = storage.listOrderItems(order.id);
      const enrichedItems = items.map(item => {
        const course = storage.getCourse(item.courseId);
        const session = storage.getSession(item.sessionId);
        return { ...item, course, session };
      });
      return { ...order, items: enrichedItems };
    });
    res.json(enriched);
  });

  // ── REVIEWS ─────────────────────────────────────────
  app.post("/api/reviews", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const { courseId, rating, comment } = req.body;
    if (!courseId || !rating) {
      return res.status(400).json({ error: "courseId ve rating gerekli" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Puan 1-5 arasında olmalıdır" });
    }
    const review = storage.createReview({ userId, courseId, rating, comment, isVisible: true });
    res.status(201).json(review);
  });

  // ── INSTRUCTOR ──────────────────────────────────────
  app.get("/api/instructor/dashboard", requireAuth, (req, res) => {
    const user = (req as any).user;
    const instructor = storage.getInstructorByUserId(user.id);
    if (!instructor) {
      return res.status(403).json({ error: "Eğitimci hesabı gerekli" });
    }
    const stats = storage.getInstructorStats(instructor.id);
    res.json(stats);
  });

  app.get("/api/instructor/courses", requireAuth, (req, res) => {
    const user = (req as any).user;
    const instructor = storage.getInstructorByUserId(user.id);
    if (!instructor) {
      return res.status(403).json({ error: "Eğitimci hesabı gerekli" });
    }
    const instructorCourses = storage.listCoursesByInstructor(instructor.id);
    res.json(instructorCourses.map(c => {
      const cat = storage.getCategory(c.categoryId);
      const sessions = storage.listSessionsByCourse(c.id);
      return { ...formatCourse(c), category: cat, sessions };
    }));
  });

  // ── INSTRUCTOR APPLICATION (public — creates account + instructor record) ───
  app.post("/api/instructor/apply", (req, res) => {
    const {
      displayName, email, phone, password, bio, expertiseAreas,
      experienceYears, linkedinUrl, sampleTitle, sampleDescription
    } = req.body;

    if (!displayName || !email || !password || !bio || !expertiseAreas || !experienceYears) {
      return res.status(400).json({ error: "Zorunlu alanları doldurun" });
    }

    // Check if email already exists
    const existingUser = storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Bu e-posta adresi zaten kayıtlı" });
    }

    // Create user account
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || displayName;
    const lastName = nameParts.slice(1).join(" ") || "";

    const user = storage.createUser({
      email,
      passwordHash: hashPassword(password),
      firstName,
      lastName,
      phone: phone || null,
      role: "INSTRUCTOR",
      emailVerified: false,
      isActive: true,
    });

    // Create instructor record
    const bioFull = sampleTitle && sampleDescription 
      ? `${bio}\n\nÖrnek Eğitim: ${sampleTitle}\n${sampleDescription}`
      : bio;

    const instructor = storage.createInstructor({
      userId: user.id,
      displayName,
      bio: bioFull,
      expertiseAreas: JSON.stringify(Array.isArray(expertiseAreas) ? expertiseAreas : [expertiseAreas]),
      experienceYears: parseInt(experienceYears),
      linkedinUrl: linkedinUrl || null,
      portfolioUrl: null,
      bankIban: null,
      bankAccountName: null,
      status: "PENDING",
      avgRating: 0,
      totalStudents: 0,
    });

    const token = createToken(user.id);

    res.status(201).json({
      success: true,
      instructor,
      token,
      user: { id: user.id, email: user.email, firstName, lastName, role: "INSTRUCTOR" },
      // Email details for external sending
      emailNotification: {
        applicantEmail: email,
        applicantName: displayName,
        expertise: expertiseAreas,
        experience: experienceYears,
        sampleTitle: sampleTitle || null,
      }
    });
  });

  // ── FAVORITES ────────────────────────────────────────
  app.get("/api/favorites", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const favs = storage.getFavorites(userId);
    const enriched = favs.map(f => {
      const course = storage.getCourse(f.courseId);
      const cat = course ? storage.getCategory(course.categoryId) : null;
      return { ...f, course: course ? { ...formatCourse(course), category: cat } : null };
    });
    res.json(enriched);
  });

  app.post("/api/favorites", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: "courseId gerekli" });
    const fav = storage.addFavorite({ userId, courseId });
    res.status(201).json(fav);
  });

  app.delete("/api/favorites/:courseId", requireAuth, (req, res) => {
    const userId = (req as any).userId;
    const courseId = parseInt(req.params.courseId);
    const removed = storage.removeFavorite(userId, courseId);
    if (!removed) return res.status(404).json({ error: "Favori bulunamadı" });
    res.json({ success: true });
  });

  // ── ADMIN ─────────────────────────────────────────
  app.get("/api/admin/stats", requireAuth, requireAdmin, (_req, res) => {
    const stats = storage.getAdminStats();
    res.json(stats);
  });

  app.get("/api/admin/users", requireAuth, requireAdmin, (_req, res) => {
    const allUsers = storage.listAllUsers();
    // Omit password hashes
    const safe = allUsers.map(u => ({
      id: u.id, email: u.email,
      firstName: u.firstName, lastName: u.lastName,
      phone: u.phone, role: u.role,
      emailVerified: u.emailVerified, isActive: u.isActive,
      createdAt: u.createdAt,
    }));
    res.json(safe);
  });

  app.get("/api/admin/instructors", requireAuth, requireAdmin, (_req, res) => {
    const instrList = storage.listAllInstructors();
    const safe = instrList.map(instr => ({
      id: instr.id,
      displayName: instr.displayName,
      bio: instr.bio,
      expertiseAreas: instr.expertiseAreas,
      experienceYears: instr.experienceYears,
      linkedinUrl: instr.linkedinUrl,
      status: instr.status,
      avgRating: instr.avgRating,
      totalStudents: instr.totalStudents,
      createdAt: instr.createdAt,
      user: instr.user ? {
        id: instr.user.id,
        email: instr.user.email,
        firstName: instr.user.firstName,
        lastName: instr.user.lastName,
      } : null,
    }));
    res.json(safe);
  });

  app.patch("/api/admin/instructors/:id", requireAuth, requireAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ error: "Geçersiz durum" });
    }
    const updated = storage.updateInstructor(id, { status: status as any });
    if (!updated) return res.status(404).json({ error: "Eğitimci bulunamadı" });
    res.json(updated);
  });

  app.get("/api/admin/courses", requireAuth, requireAdmin, (_req, res) => {
    const { courses: allCourses } = storage.listCourses({ limit: 200, status: undefined });
    const enriched = allCourses.map(c => {
      const cat = storage.getCategory(c.categoryId);
      const instr = c.instructorId ? storage.getInstructor(c.instructorId) : null;
      return {
        id: c.id, code: c.code, title: c.title, slug: c.slug,
        price: c.price, avgRating: c.avgRating, status: c.status,
        isFeatured: c.isFeatured, totalEnrolled: c.totalEnrolled,
        category: cat ? { name: cat.name } : null,
        instructor: instr ? { displayName: instr.displayName } : null,
      };
    });
    res.json(enriched);
  });

  return httpServer;
}
