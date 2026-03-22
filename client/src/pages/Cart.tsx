import { useState } from "react";
import { Link } from "wouter";
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Cart() {
  const { token, isLoggedIn } = useAuth();

  // Fetch cart from API when logged in
  const { data: apiCartItems, isLoading } = useQuery<any[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      if (!token || !isLoggedIn) return [];
      try {
        const res = await apiRequest("GET", "/api/cart", undefined, token);
        if (res.ok) return res.json();
        return [];
      } catch {
        return [];
      }
    },
    enabled: isLoggedIn,
  });

  const cartItems = isLoggedIn ? (apiCartItems ?? []) : [];

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error("Not logged in");
      const res = await apiRequest("DELETE", `/api/cart/${id}`, undefined, token);
      if (!res.ok) throw new Error("Failed to remove");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItem = (id: number) => {
    removeMutation.mutate(id);
  };

  const total = cartItems.reduce((sum: number, item: any) => {
    const price = item.course?.price ?? item.price ?? 0;
    return sum + price;
  }, 0);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#E8872A]" />
            Sepetim
          </h1>
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Sepeti görüntülemek için giriş yapın</h2>
            <p className="text-muted-foreground mb-6">Eğitimleri sepete eklemek için hesabınıza giriş yapmanız gerekiyor.</p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/giris">Giriş Yap</Link>
              </Button>
              <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
                <Link href="/kayit">Kayıt Ol</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-[#E8872A]" />
          Sepetim
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Sepetiniz boş</h2>
            <p className="text-muted-foreground mb-6">Eğitimleri keşfetmeye başlayın.</p>
            <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
              <Link href="/katalog">Eğitimleri Keşfet</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any) => {
                const course = item.course ?? item;
                const category = course.category;
                return (
                  <div key={item.id} className="bg-card border border-card-border rounded-xl overflow-hidden flex">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-28 h-28 object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {category && (
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full text-white mb-1 inline-block"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.name}
                              </span>
                            )}
                            <h3 className="font-semibold text-sm leading-snug">{course.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.instructor?.displayName || course.instructor?.displayName || "Eğitmen"} · {course.durationHours} saat
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            data-testid={`button-remove-${item.id}`}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[#E8872A] font-bold">
                          {(course.price ?? 0).toLocaleString("tr-TR")} TL
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-card-border rounded-xl p-6 sticky top-24">
                <h2 className="font-display text-lg font-bold mb-4">Sipariş Özeti</h2>
                <div className="space-y-2 mb-4">
                  {cartItems.map((item: any) => {
                    const course = item.course ?? item;
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[160px]">{course.title}</span>
                        <span className="font-medium">{(course.price ?? 0).toLocaleString("tr-TR")} TL</span>
                      </div>
                    );
                  })}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Toplam</span>
                  <span className="text-[#E8872A]">{total.toLocaleString("tr-TR")} TL</span>
                </div>
                <Button className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-12" data-testid="button-checkout">
                  Ödemeye Geç <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Güvenli ödeme · 30 gün iade garantisi
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
