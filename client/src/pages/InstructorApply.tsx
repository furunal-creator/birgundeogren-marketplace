import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { CheckCircle, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const applySchema = z.object({
  displayName: z.string().min(2, "Ad Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().min(10, "Telefon numarası girin"),
  expertiseAreas: z.string().min(3, "Uzmanlık alanı seçin"),
  experienceYears: z.coerce.number().min(1, "En az 1 yıl deneyim gerekli"),
  bio: z.string().min(50, "Biyografi en az 50 karakter olmalı"),
  linkedinUrl: z.string().url("Geçerli URL girin").optional().or(z.literal("")),
  exampleCourseTitle: z.string().min(5, "Örnek eğitim başlığı girin"),
  exampleCourseDescription: z.string().min(30, "En az 30 karakter açıklama girin"),
  kvkk: z.boolean().refine(val => val === true, {
    message: "KVKK Aydınlatma Metni'ni kabul etmeniz gerekiyor",
  }),
  agreement: z.boolean().refine(val => val === true, {
    message: "Eğitimci Sözleşmesi'ni kabul etmeniz gerekiyor",
  }),
});

const categories = [
  "Gastronomi",
  "El Sanatları",
  "AI & Dijital",
  "Girişimcilik",
  "Finans",
  "Sağlık & Yaşam",
  "Sanat & Tasarım",
  "Spor & Fitness",
  "Müzik",
  "Kişisel Gelişim",
];

const perks = [
  "Rekabetçi eğitimci geliri",
  "Hazır teknoloji altyapısı",
  "Pazarlama ve tanıtım desteği",
  "Küçük gruplarla yüksek kalite",
  "Aylık ödeme garantisi",
  "Eğitimci topluluğu",
];

const WHATSAPP_URL = "https://wa.me/905321600848?text=Merhaba,%20birgundeogren.com%20%C3%BCzerinden%20e%C4%9Fitimci%20ba%C5%9Fvurusu%20yapmak%20istiyorum.";

export default function InstructorApply() {
  const { token, isLoggedIn, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof applySchema>>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      displayName: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email ?? "",
      phone: "",
      expertiseAreas: "",
      experienceYears: 1,
      bio: "",
      linkedinUrl: "",
      exampleCourseTitle: "",
      exampleCourseDescription: "",
      kvkk: false,
      agreement: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof applySchema>) => {
    if (!isLoggedIn) {
      setLocation("/giris");
      return;
    }
    // Static demo mode — no API call needed
    await new Promise(r => setTimeout(r, 700));
    setSubmitted(true);
    toast({
      title: "Başvurunuz alındı!",
      description: "Onay e-postası gönderildi. WhatsApp üzerinden de bilgilendirileceksiniz.",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center px-4 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Başvurunuz Alındı!</h1>
          <p className="text-muted-foreground mb-3">
            En kısa sürede sizinle iletişime geçeceğiz.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            📱 WhatsApp üzerinden de bilgilendirileceksiniz.
          </p>
          {/* WhatsApp link */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp'tan Bilgi Al
          </a>
          <div className="mt-2">
            <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
              <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#142240] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-display text-4xl font-bold text-white mb-4">
                Bilginizi Paylaşın,<br />
                <span className="text-[#E8872A]">Gelir Kazanın</span>
              </h1>
              <p className="text-white/70 text-lg mb-8">
                birgundeogren.com'da eğitimci olun. Uzmanlığınızı binlerce kişiyle paylaşın.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {perks.map((perk) => (
                  <div key={perk} className="flex items-start gap-2 text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#1A8A7D] flex-shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              {/* WhatsApp quick contact */}
              <div className="mt-8">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: "#25D366" }}
                  data-testid="button-whatsapp-instructor"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp ile Başvur
                </a>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-white/60 text-sm mb-2">Aylık ortalama eğitimci kazancı</p>
              <p className="font-display text-4xl font-bold text-[#E8872A] mb-1">
                120.000 — 150.000 TL
              </p>
              <p className="text-white/40 text-xs mb-4">aylık ortalama 4 eğitim</p>
              {/* Calculation breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <p className="text-white/50 text-xs mb-2 font-medium">Hesaplama:</p>
                <p className="text-white/70 text-xs leading-relaxed">
                  Aylık ortalama <span className="text-[#E8872A] font-semibold">4 eğitim</span> × Ortalama{" "}
                  <span className="text-[#E8872A] font-semibold">2.500 TL</span> bilet ×{" "}
                  <span className="text-[#E8872A] font-semibold">15 katılımcı</span> ={" "}
                  <span className="text-white font-bold">150.000 TL brüt</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-card border border-card-border rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold mb-6">Eğitimci Başvuru Formu</h2>

          {!isLoggedIn && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              Başvuru yapmak için önce{" "}
              <Link href="/giris" className="underline font-medium">giriş yapmanız</Link> gerekiyor.
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Adınız Soyadınız" data-testid="input-display-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Numarası *</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+90 5XX XXX XX XX" data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta *</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="ornek@email.com" data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="expertiseAreas" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uzmanlık Alanı *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expertise">
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="experienceYears" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deneyim Yılı *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={1} placeholder="5" data-testid="input-experience" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Biyografi * <span className="text-muted-foreground font-normal">(min. 50 karakter)</span></FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Kendinizi ve uzmanlığınızı anlatın..." data-testid="textarea-bio" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL <span className="text-muted-foreground font-normal">(opsiyonel)</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://linkedin.com/in/..." data-testid="input-linkedin" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium mb-4">Örnek Eğitim Bilgileri</p>
                <div className="space-y-4">
                  <FormField control={form.control} name="exampleCourseTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Örnek Eğitim Başlığı *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ör: Sourdough Ekmek Yapımı Workshopu" data-testid="input-course-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="exampleCourseDescription" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Örnek Eğitim Açıklaması *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Bu eğitimde katılımcılar ne öğrenecek?" data-testid="textarea-course-desc" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Legal Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-border">
                <FormField
                  control={form.control}
                  name="kvkk"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-kvkk"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal text-sm cursor-pointer">
                          <Link href="/kvkk" className="text-[#E8872A] hover:underline" target="_blank">
                            KVKK Aydınlatma Metni
                          </Link>
                          {'\'ni okudum ve kişisel verilerimin işlenmesine onay veriyorum.'}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-agreement"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal text-sm cursor-pointer">
                          <Link href="/egitimci-sozlesmesi" className="text-[#E8872A] hover:underline" target="_blank">
                            Eğitimci İşbirliği Sözleşmesi
                          </Link>
                          {"'ni okudum, taslak niteliğinde olduğunu anlıyorum ve koşulları kabul ediyorum."}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-12 text-base"
                disabled={!isLoggedIn}
                data-testid="button-apply"
              >
                Başvuruyu Gönder <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
