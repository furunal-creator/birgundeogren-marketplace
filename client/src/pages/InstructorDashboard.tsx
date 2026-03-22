import { Link } from "wouter";
import { DollarSign, BookOpen, Users, Star, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COURSES } from "@/data/courses";

function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR") + " TL";
}

const statusLabel: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700" },
  DRAFT: { label: "Taslak", color: "bg-muted text-muted-foreground" },
};

// Eğitimci kursları
const instructorCourses = COURSES.filter(c => c.instructor.displayName === "Ahmet Yılmaz").slice(0, 5);

export default function InstructorDashboard() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <h1 className="font-display text-2xl font-bold mb-4">Eğitimci hesabı gerekli</h1>
          <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
            <Link href="/giris">Giriş Yap</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stats = {
    totalRevenue: instructorCourses.reduce((s, c) => s + c.price * c.totalEnrolled, 0),
    totalStudents: instructorCourses.reduce((s, c) => s + c.totalEnrolled, 0),
    avgRating: (instructorCourses.reduce((s, c) => s + c.avgRating, 0) / instructorCourses.length).toFixed(1),
    activeCourses: instructorCourses.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-[#0A1628] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Eğitimci Paneli
            </h1>
            <p className="text-white/60">{user?.firstName} {user?.lastName}</p>
          </div>
          <Button className="bg-[#E8872A] hover:bg-[#d07020] text-white" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Eğitim
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
          {[
            { label: "Toplam Gelir", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "#E8872A" },
            { label: "Toplam Öğrenci", value: stats.totalStudents, icon: Users, color: "#1A8A7D" },
            { label: "Ortalama Puan", value: stats.avgRating, icon: Star, color: "#D4451A" },
            { label: "Aktif Eğitim", value: stats.activeCourses, icon: BookOpen, color: "#1E3A5F" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-card-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-xl font-bold font-body">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Course List */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Eğitimlerim</h2>
          </div>
          <div className="divide-y divide-card-border">
            {instructorCourses.map(course => (
              <div key={course.id} className="p-5 flex items-center gap-4">
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.durationHours} saat
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {course.totalEnrolled} öğrenci
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#E8872A] fill-[#E8872A]" /> {course.avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusLabel["ACTIVE"].color + " text-xs border-0"}>
                    {statusLabel["ACTIVE"].label}
                  </Badge>
                  <span className="font-semibold text-[#E8872A] text-sm">{course.priceFormatted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
