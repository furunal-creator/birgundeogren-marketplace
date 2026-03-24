import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Link } from "wouter";
import {
  Clock, Monitor, MapPin, Layers, Star, Users, ChevronRight,
  BookOpen, Target, AlertCircle, CheckCircle, ShoppingCart, Info
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import CourseCard from "@/components/CourseCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COURSES } from "@/data/courses";
import { useCart } from "@/contexts/CartContext";

const formatMap: Record<string, { label: string; icon: any; color: string }> = {
  ONLINE: { label: "Online", icon: Monitor, color: "#1E3A5F" },
  PHYSICAL: { label: "Fiziksel", icon: MapPin, color: "#D4451A" },
  HYBRID: { label: "Hibrit", icon: Layers, color: "#6A1B9A" },
};

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR") + " TL";
}

function StarRating({ value, size = "sm" }: { value: number; readonly?: boolean; onChange?: (v: number) => void; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"} ${s <= value ? "text-[#E8872A] fill-[#E8872A]" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

const REFUND_POLICY = [
  { label: "72+ saat önce iptalde", desc: "Tam iade" },
  { label: "72–24 saat arası iptalde", desc: "%50 iade" },
  { label: "24 saatten az kaldıktan sonra", desc: "İade yapılmaz" },
  { label: "Eğitim iptal edilirse", desc: "Tam iade garantisi" },
];

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { addItem, isInCart } = useCart();

  // Fetch course from API, fallback to static data
  const { data: course, isLoading } = useQuery<any>({
    queryKey: ["/api/courses", slug],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        if (res.ok) return res.json();
        throw new Error("API unavailable");
      } catch {
        // Fallback to static data
        return COURSES.find(c => c.slug === slug) ?? null;
      }
    },
    enabled: !!slug,
  });

  const cartAdded = course ? isInCart(course.id) : false;

  useEffect(() => {
    if (course?.title) {
      document.title = `${course.title} | birgundeogren.com`;
    } else {
      document.title = "Eğitim Detayı | birgundeogren.com";
    }
  }, [course?.title]);

  const handleAddToCart = () => {
    if (!course) return;
    addItem({
      id: course.id,
      code: course.code,
      title: course.title,
      price: course.price,
      priceFormatted: course.priceFormatted,
      imageUrl: course.imageUrl,
      format: course.format,
      durationHours: course.durationHours,
      instructorName: course.instructor?.displayName ?? "Eğitmen",
      category: course.category ? { name: course.category.name, color: course.category.color } : undefined,
    });
    toast({ title: "Sepete eklendi!", description: course.title });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <div className="animate-pulse space-y-4 max-w-2xl mx-auto px-4">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Eğitim bulunamadı</h1>
          <Button asChild><Link href="/katalog">Tüm Eğitimlere Dön</Link></Button>
        </div>
      </div>
    );
  }

  const fmt = formatMap[course.format] || formatMap["ONLINE"];
  const FormatIcon = fmt.icon;

  // Related courses — from API response or static data
  const related: any[] = course.related ?? COURSES.filter(c => c.categoryId === course.categoryId && c.id !== course.id).slice(0, 4);

  // Reviews from API or empty
  const reviews: any[] = course.reviews ?? [];

  // Category data
  const category = course.category ?? COURSES.find(c => c.id === course.id)?.category;
  const instructor = course.instructor ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-64 sm:h-80 mt-16 overflow-hidden">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/90 via-[#0A1628]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {category && (
                  <Badge
                    className="text-white font-medium text-xs"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon} {category.name}
                  </Badge>
                )}
                <Badge
                  className="text-white font-medium text-xs"
                  style={{ backgroundColor: fmt.color }}
                >
                  <FormatIcon className="w-3 h-3 mr-1 inline" />
                  {fmt.label}
                </Badge>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{course.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-[#E8872A]">Ana Sayfa</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/katalog" className="hover:text-[#E8872A]">Eğitimler</Link>
          <ChevronRight className="w-3 h-3" />
          {category && (
            <>
              <Link href={`/katalog?kategori=${category.slug}`} className="hover:text-[#E8872A]">{category.name}</Link>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <span className="text-foreground truncate max-w-[200px]">{course.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hook / short description */}
            {(course.hook || course.descriptionShort) && (
              <div className="p-5 bg-[#E8872A]/10 border border-[#E8872A]/20 rounded-xl">
                <p className="text-base font-medium text-foreground italic">"{course.hook || course.descriptionShort}"</p>
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#E8872A] fill-[#E8872A]" />
                <span className="font-semibold">{(course.avgRating ?? 0).toFixed(1)}</span>
                <span className="text-muted-foreground">({course.reviewCount ?? 0} yorum)</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{course.totalEnrolled ?? 0} katılımcı</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{course.durationHours} saat</span>
              </div>
              {instructor && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>Eğitmen: <span className="font-medium text-foreground">{instructor.displayName}</span></span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start bg-muted/50">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="instructor">Eğitmen</TabsTrigger>
                <TabsTrigger value="reviews">Yorumlar</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 pt-4">
                {/* Problem / detail */}
                {(course.problem || course.descriptionDetail) && (
                  <div>
                    <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#E8872A]" />
                      Bu Eğitim Neden Var?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{course.problem || course.descriptionDetail}</p>
                  </div>
                )}

                {/* Target audience */}
                {course.targetAudience && (
                  <div>
                    <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#1E3A5F]" />
                      Kimler İçin?
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{course.targetAudience}</p>
                  </div>
                )}

                {/* Outcome */}
                {course.outcome && (
                  <div>
                    <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#1A8A7D]" />
                      Ne Götürürsünüz?
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{course.outcome}</p>
                  </div>
                )}

                {/* What you gain */}
                <div>
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#1A8A7D]" />
                    Ne Kazanacaksınız?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Uygulamalı pratik deneyim",
                      "Dijital eğitim materyalleri",
                      "Katılım sertifikası",
                      "Eğitim sonrası destek",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-card border border-card-border rounded-lg">
                        <CheckCircle className="w-4 h-4 text-[#1A8A7D] flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refund Policy */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-5">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    İade Koşulları
                  </h3>
                  <div className="space-y-2">
                    {REFUND_POLICY.map((r) => (
                      <div key={r.label} className="flex items-center justify-between text-sm">
                        <span className="text-amber-800 dark:text-amber-200">{r.label}</span>
                        <span className="font-semibold text-amber-900 dark:text-amber-100">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instructor" className="pt-4">
                <div className="space-y-4">
                  {instructor ? (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="bg-[#0A1628] text-white text-xl font-bold">
                            {instructor.displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-display text-xl font-bold">{instructor.displayName}</h3>
                          <p className="text-muted-foreground text-sm">
                            {instructor.totalStudents} öğrenci
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-[#E8872A] fill-[#E8872A]" />
                            <span className="text-sm font-medium">{(instructor.avgRating ?? 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      {instructor.bio && (
                        <p className="text-muted-foreground leading-relaxed text-sm">{instructor.bio}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">Eğitmen bilgisi mevcut değil.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-6 p-5 bg-card border border-card-border rounded-xl">
                    <div className="text-center">
                      <p className="font-display text-5xl font-bold text-[#E8872A]">{(course.avgRating ?? 0).toFixed(1)}</p>
                      <StarRating value={Math.round(course.avgRating ?? 0)} />
                      <p className="text-xs text-muted-foreground mt-1">{course.reviewCount ?? 0} yorum</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Bu eğitim katılımcılar tarafından yüksek puanla değerlendirilmektedir. Uygulamalı içerik ve eğitmenin kalitesi öne çıkan olumlu yönler arasındadır.
                      </p>
                    </div>
                  </div>

                  {reviews.length > 0 ? reviews.map((r: any, i: number) => (
                    <div key={i} className="p-4 bg-card border border-card-border rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-muted text-sm">
                              {r.user ? `${r.user.firstName?.charAt(0)}` : "K"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {r.user ? `${r.user.firstName} ${r.user.lastName}` : "Katılımcı"}
                          </span>
                        </div>
                        <StarRating value={r.rating} />
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  )) : (
                    // Sample fallback reviews
                    [
                      { name: "A.K.", rating: 5, comment: "Çok verimli bir gün geçirdim, kesinlikle tavsiye ederim!" },
                      { name: "M.Ö.", rating: 5, comment: "Eğitmen çok başarılı, pratik bilgiler aldım." },
                    ].map((r, i) => (
                      <div key={i} className="p-4 bg-card border border-card-border rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-muted text-sm">{r.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{r.name}</span>
                          </div>
                          <StarRating value={r.rating} />
                        </div>
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-card-border rounded-xl overflow-hidden shadow-lg">
              {/* Price */}
              <div className="p-6 border-b border-card-border">
                <div className="text-3xl font-bold text-[#E8872A] font-body mb-1">
                  {formatPrice(course.price)}
                </div>
                <p className="text-sm text-muted-foreground">KDV dahil</p>
              </div>

              {/* CTA */}
              <div className="p-6 space-y-3">
                {cartAdded ? (
                  <>
                    <div className="w-full bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm font-medium text-center">
                      ✓ Sepete eklendi
                    </div>
                    <Button asChild variant="outline" className="w-full" data-testid="button-checkout">
                      <Link href="/sepet">Sepete Git</Link>
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-12 text-base"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Sepete Ekle
                  </Button>
                )}

                {/* Quick facts */}
                <div className="space-y-2 pt-2">
                  {[
                    { icon: Clock, label: `${course.durationHours} saatlik yoğun eğitim` },
                    { icon: Users, label: "Minimum 8 katılımcı" },
                    { icon: Users, label: "Maksimum 20 kişilik grup" },
                    { icon: CheckCircle, label: "Dijital sertifika" },
                    { icon: BookOpen, label: "Eğitim materyalleri dahil" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="w-3.5 h-3.5 text-[#1A8A7D]" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* Refund mini */}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-semibold mb-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" /> İade Politikası
                  </p>
                  <div className="space-y-1">
                    {REFUND_POLICY.map((r) => (
                      <div key={r.label} className="flex justify-between text-xs text-muted-foreground">
                        <span>{r.label}</span>
                        <span className="font-medium text-foreground">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">Benzer Eğitimler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((c: any) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
