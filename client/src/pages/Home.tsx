import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ArrowRight, BookOpen, Users, Award, ChevronRight, GraduationCap, Lightbulb, Rocket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";
import CategoryCard from "@/components/CategoryCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { COURSES, CATEGORIES, FEATURED_COURSES } from "@/data/courses";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

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
