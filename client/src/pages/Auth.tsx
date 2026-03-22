import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string()
    .regex(/^(\+90|0)?[5][0-9]{9}$/, "Geçerli bir Türkiye telefon numarası girin (05xx xxx xx xx)")
    .optional()
    .or(z.literal("")),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
  confirmPassword: z.string(),
  kvkk: z.boolean().refine(val => val === true, {
    message: "KVKK Aydınlatma Metni'ni kabul etmeniz gerekiyor",
  }),
}).refine(d => d.password === d.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data.email, data.password);
      toast({ title: "Giriş başarılı!", description: "Hoş geldiniz." });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Giriş başarısız",
        description: err.message || "E-posta veya şifre hatalı",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-lg">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <span className="font-display text-2xl font-bold text-foreground">
                  birgundeogren<span className="text-[#E8872A]">.com</span>
                </span>
              </Link>
              <h1 className="font-display text-xl font-bold text-foreground mt-4 mb-1">Giriş Yap</h1>
              <p className="text-muted-foreground text-sm">Hesabınıza giriş yapın</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="ornek@email.com"
                        data-testid="input-email"
                        className="focus:border-[#E8872A]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          data-testid="input-password"
                          className="pr-10 focus:border-[#E8872A]"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-11"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{" "}
              <Link href="/kayit" className="text-[#E8872A] hover:underline font-medium">
                Kayıt Ol
              </Link>
            </div>


          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
      kvkk: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      toast({ title: "Kayıt başarılı! Hoş geldiniz.", description: "Hesabınız oluşturuldu." });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Kayıt başarısız",
        description: err.message || "Bir hata oluştu, lütfen tekrar deneyin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <span className="font-display text-2xl font-bold text-foreground">
                  birgundeogren<span className="text-[#E8872A]">.com</span>
                </span>
              </Link>
              <h1 className="font-display text-xl font-bold text-foreground mt-4 mb-1">Hesap Oluştur</h1>
              <p className="text-muted-foreground text-sm">birgundeogren.com'a katılın</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Adınız" data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Soyadınız" data-testid="input-last-name" />
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

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon <span className="text-muted-foreground">(opsiyonel)</span></FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+90 5XX XXX XX XX" data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type={showPassword ? "text" : "password"} placeholder="Min. 8 karakter, 1 büyük harf, 1 rakam" data-testid="input-password" className="pr-10" />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre Tekrar *</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Şifrenizi tekrar girin" data-testid="input-confirm-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

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
                          {'\'ni okudum ve kabul ediyorum.'}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-11"
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Link href="/giris" className="text-[#E8872A] hover:underline font-medium">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
