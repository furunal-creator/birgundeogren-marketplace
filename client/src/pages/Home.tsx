import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, ArrowRight, BookOpen, Users, Award, ChevronRight, GraduationCap, Lightbulb, Rocket, Calendar, MapPin, ShoppingCart, CreditCard, X, Clock, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CourseCard from "@/components/CourseCard";
import CategoryCard from "@/components/CategoryCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { COURSES, CATEGORIES, FEATURED_COURSES } from "@/data/courses";

const UPCOMING_SESSIONS = [
  {
    id: 1,
    courseId: 28,
    date: "04 Nisan 2026",
    location: "Beylikdüzü",
    locationType: "physical",
    title: "Fransız Pastacılık: Croissant & Viennoiserie Günü",
    price: "3.900 TL",
    priceNum: 3900,
    slug: "fransiz-pastacilik-croissant-ve-viennoiserie-gunu",
  },
  {
    id: 2,
    courseId: 32,
    date: "11 Nisan 2026",
    location: "Kadıköy",
    locationType: "physical",
    title: "Sourdough Ekmek: Ekşi Maya Ustaları Günü",
    price: "2.860 TL",
    priceNum: 2860,
    slug: "sourdough-ekmek-eksi-maya-ustalari-gunu",
  },
  {
    id: 3,
    courseId: 2,
    date: "18 Nisan 2026",
    location: "Online",
    locationType: "online",
    title: "ChatGPT İş Hayatı Hızlandırıcı",
    price: "3.000 TL",
    priceNum: 3000,
    slug: "chatgpt-is-hayati-hizlandirici-prompt-muhendisligi-gunu",
  },
  {
    id: 4,
    courseId: 29,
    date: "25 Nisan 2026",
    location: "Beşiktaş",
    locationType: "physical",
    title: "Kokteyl & Mixology: Ev Barı Kurma Günü",
    price: "2.080 TL",
    priceNum: 2080,
    slug: "kokteyl-ve-mixology-ev-bari-kurma-gunu",
  },
  {
    id: 5,
    courseId: 3,
    date: "02 Mayıs 2026",
    location: "Online",
    locationType: "online",
    title: "Dijital Pazarlama Bootcamp",
    price: "3.600 TL",
    priceNum: 3600,
    slug: "dijital-pazarlama-bootcamp-meta-ve-google-ads-gunu",
  },
  {
    id: 6,
    courseId: 13,
    date: "09 Mayıs 2026",
    location: "Şişli",
    locationType: "physical",
    title: "Kintsugi: Kırık Güzellikleri Onarma Sanatı",
    price: "2.860 TL",
    priceNum: 2860,
    slug: "kintsugi-kirik-guzellikleri-onarma-sanati",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();
  const [selectedSession, setSelectedSession] = useState<typeof UPCOMING_SESSIONS[0] | null>(null);

  useEffect(() => {
    document.title = "birgundeogren.com — Türkiye'nin 1-Günlük Eğitim Pazar Yeri";
  }, []);

  const selectedCourse = selectedSession
    ? COURSES.find(c => c.id === selectedSession.courseId) ?? null
    : null;

  // Fetch featured courses from API, fallback to static data
  const { data: featuredCourses } = useQuery<any[]>({
    queryKey: ["/api/courses/featured"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/courses/featured");
        if (res.ok) return res.json();
        throw new Error("API unavailable");
      } catch {
        return FEATURED_COURSES;
      }
    },
  });

  // Fetch categories from API, fallback to static data
  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) return res.json();
        throw new Error("API unavailable");
      } catch {
        return CATEGORIES;
      }
    },
  });

  const displayCourses = featuredCourses ?? FEATURED_COURSES;
  const displayCategories = categories ?? CATEGORIES;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="./assets/hero.jpg"
            alt="birgundeogren hero"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/95 via-[#0A1628]/80 to-[#0A1628]/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#E8872A]/20 border border-[#E8872A]/30 text-[#E8872A] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-[#E8872A] rounded-full animate-pulse" />
              Türkiye'nin 1-Günlük Eğitim Pazar Yeri
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Bir günde öğren,{" "}
              <span className="text-[#E8872A]">ömür boyu uygula.</span>
            </h1>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-8">
              Alanının uzmanlarından yoğun, pratik ve uygulamalı 1-günlük workshoplar.
              Sertifikalı. Küçük gruplar. Garantili öğrenme.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ne öğrenmek istiyorsunuz?"
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#E8872A] transition-colors"
                  data-testid="input-search-hero"
                />
              </div>
              <Button type="submit" className="bg-[#E8872A] hover:bg-[#d07020] text-white px-6 py-3 font-semibold" data-testid="button-search">
                Ara
              </Button>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold" data-testid="button-hero-cta">
                <Link href="/katalog">
                  Tüm Eğitimleri Keşfet <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                <Link href="/egitimci/kayit">
                  Eğitimci Ol
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { icon: BookOpen, label: "80+ Eğitim", sub: "Hepsini keşfet" },
                { icon: Users, label: "10 Kategori", sub: "Her alandan" },
                { icon: Award, label: "Sertifikalı", sub: "Katılım belgesi" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E8872A]/20 border border-[#E8872A]/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#E8872A]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{label}</p>
                    <p className="text-white/50 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ─────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Öne Çıkan Eğitimler</h2>
              <p className="text-muted-foreground">En popüler ve yüksek puanlı workshoplar</p>
            </div>
            <Button asChild variant="ghost" className="text-[#E8872A] hover:text-[#d07020] hidden sm:flex">
              <Link href="/katalog">
                Tümünü gör <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCourses.slice(0, 8).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="border-[#E8872A] text-[#E8872A]">
              <Link href="/katalog">Tüm Eğitimleri Gör</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── UPCOMING SESSIONS ────────────────────────────── */}
      <section className="py-20 bg-[#F9F5F0] dark:bg-[#0E1B2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Yakın Tarihli Eğitimler</h2>
              <p className="text-muted-foreground">Önümüzdeki haftalarda başlayan workshoplara yerinizi ayırtın</p>
            </div>
            <Button asChild variant="ghost" className="text-[#E8872A] hover:text-[#d07020] hidden sm:flex">
              <Link href="/katalog">
                Tümünü gör <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Scrollable on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 -mx-4 px-4 sm:mx-0 sm:px-0">
            {UPCOMING_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="flex-shrink-0 w-72 sm:w-auto bg-card border border-card-border rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                data-testid={`card-session-${session.id}`}
                onClick={() => setSelectedSession(session)}
              >
                {/* Date badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 bg-[#E8872A]/10 border border-[#E8872A]/20 rounded-lg px-3 py-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E8872A]" />
                    <span className="text-xs font-semibold text-[#E8872A]">{session.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span
                      className="font-medium"
                      style={{ color: session.locationType === "online" ? "#1A8A7D" : "#1E3A5F" }}
                    >
                      {session.location}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display font-bold text-foreground leading-snug mb-4 text-sm sm:text-base line-clamp-2">
                  {session.title}
                </h3>

                {/* Price + Buttons */}
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#E8872A]">{session.price}</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Min. 8 katılımcı</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs border-[#E8872A]/30 text-[#E8872A] hover:bg-[#E8872A]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        const course = COURSES.find(c => c.slug === session.slug);
                        if (course) {
                          addToCart(course);
                        }
                      }}
                      data-testid={`button-session-cart-${session.id}`}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" /> Sepete Ekle
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 bg-[#E8872A] hover:bg-[#d07020] text-white text-xs"
                      data-testid={`button-session-register-${session.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/egitim/${session.slug}`}>
                        <CreditCard className="w-3 h-3 mr-1" /> Kayıt Ol
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Session Detail Modal */}
          <Dialog open={!!selectedSession} onOpenChange={(open) => { if (!open) setSelectedSession(null); }}>
            <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
              {selectedSession && (
                <>
                  {/* Course image */}
                  {selectedCourse?.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={selectedCourse.imageUrl}
                        alt={selectedSession.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 to-transparent" />
                      <button
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                        onClick={() => setSelectedSession(null)}
                        aria-label="Kapat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Date & Location */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5 bg-[#E8872A]/10 border border-[#E8872A]/20 rounded-lg px-3 py-1">
                        <Calendar className="w-3.5 h-3.5 text-[#E8872A]" />
                        <span className="text-xs font-semibold text-[#E8872A]">{selectedSession.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span
                          className="font-medium"
                          style={{ color: selectedSession.locationType === "online" ? "#1A8A7D" : "#1E3A5F" }}
                        >
                          {selectedSession.location}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="font-display text-xl font-bold text-foreground mb-2 leading-snug">
                      {selectedSession.title}
                    </h2>

                    {/* Meta */}
                    {selectedCourse && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {selectedCourse.durationHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{selectedCourse.durationHours} saat</span>
                          </div>
                        )}
                        {selectedCourse.instructor?.displayName && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{selectedCourse.instructor.displayName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {selectedCourse?.descriptionShort && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {selectedCourse.descriptionShort}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-bold text-[#E8872A]">{selectedSession.price}</span>
                      <span className="text-xs text-muted-foreground">Min. 8 katılımcı</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#E8872A]/30 text-[#E8872A] hover:bg-[#E8872A]/10"
                        onClick={() => {
                          const course = COURSES.find(c => c.slug === selectedSession.slug);
                          if (course) addToCart(course);
                          setSelectedSession(null);
                        }}
                        data-testid={`modal-button-cart-${selectedSession.id}`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Sepete Ekle
                      </Button>
                      <Button
                        asChild
                        className="flex-1 bg-[#E8872A] hover:bg-[#d07020] text-white"
                        data-testid={`modal-button-register-${selectedSession.id}`}
                      >
                        <Link href={`/egitim/${selectedSession.slug}`} onClick={() => setSelectedSession(null)}>
                          Kayıt Ol
                        </Link>
                      </Button>
                    </div>

                    {/* Details link */}
                    <div className="mt-3 text-center">
                      <Link
                        href={`/egitim/${selectedSession.slug}`}
                        className="text-sm text-[#1A8A7D] hover:underline font-medium"
                        onClick={() => setSelectedSession(null)}
                        data-testid={`modal-link-detail-${selectedSession.id}`}
                      >
                        Detayları Gör &rarr;
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section id="kategoriler" className="py-20 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-3">10 Farklı Kategoride Eğitim</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Gastronomi'den AI'ya, El Sanatları'ndan Finansal Okuryazarlığa — her alanda uzman eğitmenlerden öğren.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="nasil-calisir" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Nasıl Çalışır?</h2>
            <p className="text-muted-foreground text-lg">3 adımda bilgi sahibi olun</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Search,
                title: "Eğitim Seç",
                desc: "80'den fazla workshop arasından ihtiyacınıza uygun olanı bulun. Kategori, format ve fiyata göre filtreleyin.",
                color: "#E8872A",
              },
              {
                step: "02",
                icon: GraduationCap,
                title: "Kayıt Ol",
                desc: "Uygun tarih ve saati seçin, güvenli ödeme yapın. Anında onay ve hatırlatma alın.",
                color: "#1A8A7D",
              },
              {
                step: "03",
                icon: Rocket,
                title: "Öğren & Uygula",
                desc: "Alanın uzmanından yoğun 1 günlük eğitim alın. Sertifikanızı alın ve öğrendiklerinizi hayata geçirin.",
                color: "#1E3A5F",
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="relative">
                {/* Connector line */}
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                
                <div className="text-center relative z-10">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-xs font-bold text-muted-foreground mb-1">ADIM {step}</div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm max-w-xs mx-auto">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTRUCTOR CTA ────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[#1A8A7D] to-[#142240] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white transform -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Lightbulb className="w-12 h-12 text-[#E8872A] mx-auto mb-5" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Bilginizi Paylaşın, Gelir Kazanın
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Alanınızda uzmanlaştıysanız birgundeogren.com platformunda eğitiminizi listeleyin.
            Uzmanlığınızı paylaşın, kazanç elde edin.
            Küçük gruplar, büyük etki.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold px-8">
              <Link href="/egitimci/kayit">
                Eğitimci Başvurusu Yap <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10"
              onClick={() => document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth' })}>
                Nasıl Çalışır?
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
