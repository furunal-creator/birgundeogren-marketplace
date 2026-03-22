import { useState } from "react";
import { Link } from "wouter";
import { CreditCard, ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

const REFUND_POLICY = [
  { label: "72+ saat önce iptalde", desc: "Tam iade" },
  { label: "72–24 saat arası iptalde", desc: "%50 iade" },
  { label: "24 saatten az kaldıktan sonra", desc: "İade yapılmaz" },
  { label: "Eğitim iptal edilirse", desc: "Tam iade garantisi" },
];

export default function Checkout() {
  const { items, total } = useCart();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Back */}
        <Link href="/sepet" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Sepete Geri Dön
        </Link>

        <h1 className="font-display text-3xl font-bold mb-8">Ödeme</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Sepetinizde ürün bulunmuyor.</p>
            <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
              <Link href="/katalog">Eğitimlere Göz At</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Billing Info */}
              <div className="bg-card border border-card-border rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold mb-5">Fatura Bilgileri</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Ad *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Adınız"
                      data-testid="input-checkout-firstname"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Soyad *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Soyadınız"
                      data-testid="input-checkout-lastname"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-posta *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ornek@email.com"
                      data-testid="input-checkout-email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+90 5XX XXX XX XX"
                      data-testid="input-checkout-phone"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="address">Adres *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Fatura adresi"
                      data-testid="input-checkout-address"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-card border border-card-border rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold mb-5">Ödeme</h2>
                <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-display text-lg font-bold mb-2">Sanal POS Entegrasyonu</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Bu alan iyzico/PayTR sanal pos API'si ile entegre edilecektir.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kredi kartı, banka kartı ve taksitli ödeme seçenekleri yakında aktif olacaktır.
                  </p>
                </div>
              </div>

              {/* Refund Policy */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-6">
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
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-card-border rounded-2xl p-6 sticky top-24">
                <h2 className="font-display text-lg font-bold mb-4">Sipariş Özeti</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.durationHours} saat</p>
                        <p className="text-sm font-bold text-[#E8872A]">{item.priceFormatted}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-xl mb-6">
                  <span>Toplam</span>
                  <span className="text-[#E8872A]">{total.toLocaleString("tr-TR")} TL</span>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-12 opacity-60 cursor-not-allowed"
                        disabled
                        data-testid="button-complete-payment"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Ödemeyi Tamamla
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Yakında aktif olacaktır</p>
                  </TooltipContent>
                </Tooltip>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  🔒 SSL şifreli güvenli bağlantı
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
