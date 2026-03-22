import { Link } from "wouter";
import { User, BookOpen, ShoppingBag, Heart, Settings, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { FEATURED_COURSES } from "@/data/courses";

// Badge & Tier System
const BADGES = [
  { id: 1, name: "İlk Adım", icon: "🎯", description: "İlk eğitimini tamamla", threshold: 1 },
  { id: 2, name: "Meraklı Öğrenci", icon: "📚", description: "3 eğitim tamamla", threshold: 3 },
  { id: 3, name: "Bilgi Avcısı", icon: "🏹", description: "5 eğitim tamamla", threshold: 5 },
  { id: 4, name: "Uzman Öğrenci", icon: "🎓", description: "10 eğitim tamamla", threshold: 10, reward: "1 ücretsiz eğitim" },
  { id: 5, name: "Master", icon: "👑", description: "20 eğitim tamamla", threshold: 20, reward: "%10 indirim" },
  { id: 6, name: "Grandmaster", icon: "💎", description: "50 eğitim tamamla", threshold: 50, reward: "VIP üyelik + sponsor indirimleri" },
];

const TIERS = [
  { name: "Bronz", minBadges: 0, color: "#CD7F32", discount: 0 },
  { name: "Gümüş", minBadges: 3, color: "#C0C0C0", discount: 5 },
  { name: "Altın", minBadges: 5, color: "#FFD700", discount: 10 },
  { name: "Platin", minBadges: 10, color: "#E5E4E2", discount: 15 },
  { name: "Elmas", minBadges: 20, color: "#B9F2FF", discount: 20 },
];

const favoritesCourses = FEATURED_COURSES.slice(0, 3);

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR") + " TL";
}

function BadgesTab({ completedCount = 0 }: { completedCount?: number }) {
  const earnedBadges = BADGES.filter(b => completedCount >= b.threshold);
  const lockedBadges = BADGES.filter(b => completedCount < b.threshold);

  // Determine tier
  const currentTier = [...TIERS].reverse().find(t => earnedBadges.length >= t.minBadges) ?? TIERS[0];
  const nextTier = TIERS.find(t => t.minBadges > earnedBadges.length);

  const progressToNext = nextTier
    ? ((earnedBadges.length - currentTier.minBadges) / (nextTier.minBadges - currentTier.minBadges)) * 100
    : 100;

  return (
    <div className="space-y-8">
      {/* Current Tier */}
      <div className="bg-card border border-card-border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md"
            style={{ backgroundColor: currentTier.color + "33", border: `2px solid ${currentTier.color}` }}
          >
            {earnedBadges.length > 0 ? BADGES[earnedBadges.length - 1].icon : "🥉"}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mevcut Seviye</p>
            <h3
              className="font-display text-xl font-bold"
              style={{ color: currentTier.color }}
            >
              {currentTier.name}
            </h3>
            {currentTier.discount > 0 && (
              <p className="text-xs text-muted-foreground">%{currentTier.discount} sabit indirim aktif</p>
            )}
          </div>
        </div>

        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{earnedBadges.length} rozet</span>
              <span>{nextTier.name} için {nextTier.minBadges} rozet gerekli</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {currentTier.name === "Elmas" && (
          <p className="text-xs text-[#B9F2FF] font-medium mt-2">🏆 En yüksek seviye — VIP üye!</p>
        )}
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold mb-4">Kazanılan Rozetler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-card border border-card-border rounded-xl p-4 text-center"
                data-testid={`badge-earned-${badge.id}`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {badge.reward && (
                  <span className="inline-block mt-2 text-xs bg-[#E8872A]/10 text-[#E8872A] px-2 py-0.5 rounded-full font-medium">
                    🎁 {badge.reward}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold mb-4 text-muted-foreground">Kilitli Rozetler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-muted/30 border border-border rounded-xl p-4 text-center opacity-50"
                data-testid={`badge-locked-${badge.id}`}
              >
                <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                <p className="font-semibold text-sm text-muted-foreground">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {badge.reward && (
                  <span className="inline-block mt-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    🔒 {badge.reward}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All tiers */}
      <div className="bg-card border border-card-border rounded-2xl p-5">
        <h4 className="font-semibold text-sm mb-4">Seviye Sistemi</h4>
        <div className="space-y-2">
          {TIERS.map((tier) => (
            <div key={tier.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className={earnedBadges.length >= tier.minBadges ? "font-semibold" : "text-muted-foreground"}>
                  {tier.name}
                </span>
                <span className="text-xs text-muted-foreground">({tier.minBadges}+ rozet)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {tier.discount > 0 ? `%${tier.discount} indirim` : "Başlangıç"}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-3">
          10 eğitimde 1 eğitim hediye • %10 indirim<br />
          Rozetler ileride sponsor indirimleri olarak da değerlendirilebilir.
        </p>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <h1 className="font-display text-2xl font-bold mb-4">Hesabınıza giriş yapın</h1>
          <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
            <Link href="/giris">Giriş Yap</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-[#0A1628] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-5">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-[#E8872A] text-white text-xl font-bold">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-white/60">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs defaultValue="overview">
          <TabsList className="mb-8 flex-wrap h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> Özet
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Eğitimlerim
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> Siparişlerim
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> Favorilerim
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> Rozetlerim
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> Profil
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { label: "Tamamlanan Eğitim", value: 0, icon: BookOpen, color: "#E8872A" },
                { label: "Toplam Sipariş", value: 0, icon: ShoppingBag, color: "#1A8A7D" },
                { label: "Favori Eğitim", value: favoritesCourses.length, icon: Heart, color: "#D4451A" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border border-card-border rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-body">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Son Siparişler</h3>
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-3">Henüz sipariş vermediniz.</p>
                <Button asChild variant="outline">
                  <Link href="/katalog">Eğitimlere Göz At</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Courses */}
          <TabsContent value="courses">
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">Henüz eğitiminiz yok</h3>
              <p className="text-muted-foreground mb-5">Satın aldığınız eğitimler burada görünecek</p>
              <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
                <Link href="/katalog">Eğitim Keşfet</Link>
              </Button>
            </div>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
              <p>Henüz sipariş vermediniz.</p>
            </div>
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoritesCourses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <BadgesTab completedCount={0} />
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="max-w-md bg-card border border-card-border rounded-xl p-6">
              <h3 className="font-display text-lg font-bold mb-5">Profil Bilgileri</h3>
              <div className="space-y-4 text-sm">
                {[
                  { label: "Ad", value: user?.firstName },
                  { label: "Soyad", value: user?.lastName },
                  { label: "E-posta", value: user?.email },
                  { label: "Rol", value: user?.role === "INSTRUCTOR" ? "Eğitimci" : user?.role === "ADMIN" ? "Admin" : "Öğrenci" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="text-xs text-muted-foreground">
                  Profil güncelleme özelliği yakında eklenecek.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
