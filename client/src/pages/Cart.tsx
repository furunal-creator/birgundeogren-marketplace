import { Link } from "wouter";
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

const REFUND_POLICY = [
  { label: "72+ saat önce", desc: "Tam iade" },
  { label: "72–24 saat arası", desc: "%50 iade" },
  { label: "24 saatten az", desc: "İade yok" },
  { label: "Eğitim iptal edilirse", desc: "Tam iade" },
];

export default function Cart() {
  const { items, removeItem, total } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-[#E8872A]" />
          Sepetim
        </h1>

        {items.length === 0 ? (
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
              {items.map((item) => (
                <div key={item.id} className="bg-card border border-card-border rounded-xl overflow-hidden flex">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-28 h-28 object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {item.category && (
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full text-white mb-1 inline-block"
                              style={{ backgroundColor: item.category.color }}
                            >
                              {item.category.name}
                            </span>
                          )}
                          <h3 className="font-semibold text-sm leading-snug">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.instructorName} · {item.durationHours} saat
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#E8872A] font-bold">
                        {item.priceFormatted}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-card-border rounded-xl p-6 sticky top-24">
                <h2 className="font-display text-lg font-bold mb-4">Sipariş Özeti</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[160px]">{item.title}</span>
                      <span className="font-medium">{item.priceFormatted}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Toplam</span>
                  <span className="text-[#E8872A]">{total.toLocaleString("tr-TR")} TL</span>
                </div>
                <Button
                  className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-12"
                  data-testid="button-checkout"
                  asChild
                >
                  <Link href="/odeme">
                    Ödemeye Geç <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Güvenli ödeme · İade politikamızı inceleyin
                </p>

                {/* Refund Policy Mini */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold mb-2">İade Politikası</p>
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
        )}
      </div>

      <Footer />
    </div>
  );
}
