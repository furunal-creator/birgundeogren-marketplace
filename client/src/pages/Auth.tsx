import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Generate deterministic dummy verification code
function genCode(email: string): string {
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) & 0xFFFF;
  return String(100000 + (h % 900000));
}

function LoginForm() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

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

  return (<>
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

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-xs text-[#E8872A] hover:underline"
            onClick={() => setShowForgot(true)}
          >
            Şifremi Unuttum
          </button>
        </div>

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

    {/* Şifremi Unuttum Modal */}
    {showForgot && (
      <div className="mt-6 p-4 bg-muted rounded-xl">
        <h3 className="font-semibold text-sm mb-2">Şifre Sıfırlama</h3>
        <p className="text-xs text-muted-foreground mb-3">E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.</p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="E-posta adresiniz"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="flex-1"
          />
          <Button
            size="sm"
            className="bg-[#E8872A] hover:bg-[#d07020] text-white"
            onClick={() => {
              if (forgotEmail) {
                toast({ title: "Şifre sıfırlama bağlantısı gönderildi", description: `${forgotEmail} adresine şifre sıfırlama e-postası gönderildi.` });
                setShowForgot(false);
                setForgotEmail("");
              }
            }}
          >
            Gönder
          </Button>
        </div>
        <button className="text-xs text-muted-foreground mt-2 hover:underline" onClick={() => setShowForgot(false)}>Vazgeç</button>
      </div>
    )}
  </>
  );
}

function RegisterForm({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [, setLocation] = useLocation();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [verifyStep, setVerifyStep] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

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
      // Show verification step
      const code = genCode(data.email);
      setVerifyCode(code);
      setRegisteredEmail(data.email);
      setVerifyStep(true);
      toast({
        title: "Doğrulama kodu gönderildi",
        description: `${data.email} adresine 6 haneli doğrulama kodu gönderildi.`,
      });
    } catch (err: any) {
      toast({
        title: "Kayıt başarısız",
        description: err.message || "Bir hata oluştu, lütfen tekrar deneyin",
        variant: "destructive",
      });
    }
  };

  const handleVerify = () => {
    if (inputCode === verifyCode) {
      toast({
        title: "Hoş geldiniz!",
        description: "Üyelik bilgileriniz e-posta adresinize gönderildi.",
      });
      setLocation("/");
    } else {
      toast({
        title: "Hatalı kod",
        description: "Doğrulama kodu yanlış. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  // Verification step UI
  if (verifyStep) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold mb-2">E-postanızı doğrulayın</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{registeredEmail}</span> adresine gönderilen 6 haneli kodu girin.
          </p>
        </div>

        {/* Demo: show the code */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700 mb-1">Demo doğrulama kodu:</p>
          <p className="font-mono text-2xl font-bold text-amber-900 tracking-widest">{verifyCode}</p>
        </div>

        <div className="space-y-3">
          <Input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Kodu girin..."
            className="text-center text-xl tracking-widest font-mono"
            maxLength={6}
            data-testid="input-verify-code"
          />
          <Button
            className="w-full bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold h-11"
            onClick={handleVerify}
            data-testid="button-verify"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Doğrula ve Devam Et
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Üyelik bilgileriniz e-posta adresinize gönderildi.
        </p>
      </div>
    );
  }

  return (
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
              <Input {...field} type="email" placeholder="ornek@email.com" data-testid="input-email-register" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Telefon <span className="text-muted-foreground">(opsiyonel)</span></FormLabel>
            <FormControl>
              <Input {...field} type="tel" placeholder="+90 5XX XXX XX XX" data-testid="input-phone-register" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Şifre *</FormLabel>
            <FormControl>
              <div className="relative">
                <Input {...field} type={showPassword ? "text" : "password"} placeholder="Min. 8 karakter, 1 büyük harf, 1 rakam" data-testid="input-password-register" className="pr-10" />
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
  );
}

export default function AuthPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("giris");

  // Check URL params for tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
    if (params.get("tab") === "kayit") {
      setActiveTab("kayit");
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-lg">
            {/* Logo */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-block">
                <img src="./assets/logo_new.svg" alt="birgundeogren.com" className="h-12 w-auto mx-auto" />
              </Link>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="giris" className="flex-1" data-testid="tab-login">
                  Giriş Yap
                </TabsTrigger>
                <TabsTrigger value="kayit" className="flex-1" data-testid="tab-register">
                  Kayıt Ol
                </TabsTrigger>
              </TabsList>

              <TabsContent value="giris">
                <LoginForm />
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Hesabınız yok mu?{" "}
                  <button
                    onClick={() => setActiveTab("kayit")}
                    className="text-[#E8872A] hover:underline font-medium"
                  >
                    Kayıt Ol
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="kayit">
                <RegisterForm onTabChange={setActiveTab} />
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Zaten hesabınız var mı?{" "}
                  <button
                    onClick={() => setActiveTab("giris")}
                    className="text-[#E8872A] hover:underline font-medium"
                  >
                    Giriş Yap
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Keep old exports for backward compatibility
export function LoginPage() {
  return <AuthPage />;
}

export function RegisterPage() {
  return <AuthPage />;
}
