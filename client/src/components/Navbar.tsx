import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Menu, User, LogOut, BookOpen, LayoutDashboard, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout, isLoggedIn } = useAuth();
  const { count: cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/katalog", label: "Eğitimler" },
    { href: "/#kategoriler", label: "Kategoriler" },
    { href: "/#nasil-calisir", label: "Nasıl Çalışır?" },
    { href: "/egitimci/kayit", label: "Eğitimci Ol" },
  ];

  const scrollTo = (id: string) => {
    if (location !== "/") {
      window.location.hash = "";
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="./assets/logo_small.png" alt="birgundeogren" className="h-8 w-auto" onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }} />
            <span className="font-display text-white font-bold text-lg hidden sm:block">
              birgundeogren<span className="text-[#E8872A]">.com</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/katalog" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Eğitimler
            </Link>
            <button
              onClick={() => scrollTo("kategoriler")}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Kategoriler
            </button>
            <button
              onClick={() => scrollTo("nasil-calisir")}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Nasıl Çalışır?
            </button>
            <Link href="/egitimci/kayit" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Eğitimci Ol
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/sepet" className="relative p-2 text-white/80 hover:text-white transition-colors" data-testid="link-cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#E8872A] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 gap-2 h-9 px-3" data-testid="button-user-menu">
                    <div className="w-7 h-7 rounded-full bg-[#E8872A] flex items-center justify-center text-white text-xs font-bold">
                      {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                    </div>
                    <span className="hidden sm:block text-sm">{user?.firstName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/hesabim" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" /> Hesabım
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/hesabim" className="cursor-pointer">
                      <BookOpen className="w-4 h-4 mr-2" /> Eğitimlerim
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "INSTRUCTOR" && (
                    <DropdownMenuItem asChild>
                      <Link href="/egitimci/panel" className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Eğitimci Paneli
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "ADMIN" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/egitimci/panel" className="cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" /> Eğitimci Paneli
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" /> Admin Paneli
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 h-9 px-4 text-sm" data-testid="link-login">
                  <Link href="/giris">Giriş</Link>
                </Button>
                <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white h-9 px-4 text-sm font-semibold" data-testid="link-register">
                  <Link href="/kayit">Kayıt Ol</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white/80 hover:text-white hover:bg-white/10" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0A1628] border-white/10 w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/katalog" onClick={() => setMobileOpen(false)} className="text-white text-lg font-medium">
                    Eğitimler
                  </Link>
                  <button onClick={() => scrollTo("kategoriler")} className="text-white/80 text-lg font-medium text-left">
                    Kategoriler
                  </button>
                  <button onClick={() => scrollTo("nasil-calisir")} className="text-white/80 text-lg font-medium text-left">
                    Nasıl Çalışır?
                  </button>
                  <Link href="/egitimci/kayit" onClick={() => setMobileOpen(false)} className="text-white/80 text-lg font-medium">
                    Eğitimci Ol
                  </Link>
                  
                  {!isLoggedIn && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                      <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Link href="/giris" onClick={() => setMobileOpen(false)}>Giriş Yap</Link>
                      </Button>
                      <Button asChild className="bg-[#E8872A] hover:bg-[#d07020] text-white">
                        <Link href="/kayit" onClick={() => setMobileOpen(false)}>Kayıt Ol</Link>
                      </Button>
                    </div>
                  )}
                  {isLoggedIn && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                      <Link href="/hesabim" onClick={() => setMobileOpen(false)} className="text-white/80 text-lg font-medium">
                        Hesabım
                      </Link>
                      <button onClick={() => { logout(); setMobileOpen(false); }} className="text-red-400 text-lg font-medium text-left">
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
