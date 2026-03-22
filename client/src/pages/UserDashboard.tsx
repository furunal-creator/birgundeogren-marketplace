import { Link } from "wouter";
import { User, BookOpen, ShoppingBag, Heart, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { COURSES, FEATURED_COURSES } from "@/data/courses";

// Dashboard verileri
const recentOrders: any[] = [];
const favoritesCourses = FEATURED_COURSES.slice(0, 3);

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR") + " TL";
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
