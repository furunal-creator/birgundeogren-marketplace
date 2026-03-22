import { Link } from "wouter";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A1628] text-white/70 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="./assets/logo_small.png" alt="birgundeogren" className="h-8 w-auto" onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }} />
              <span className="font-display text-white font-bold text-xl">
                birgundeogren<span className="text-[#E8872A]">.com</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-3">
              Türkiye'nin yoğun, pratik ve uygulamalı 1-günlük eğitim pazar yeri.
            </p>
            <p className="text-xs text-white/40 mb-4">
              birgundeogren.com bir Kuniq Capital Inc. kuruluşudur.
            </p>
            <p className="text-sm">
              <a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:text-[#f09840] transition-colors">
                info@birgundeogren.com
              </a>
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/katalog" className="hover:text-white transition-colors">Tüm Eğitimler</Link></li>
              <li><Link href="/katalog?sort=rating" className="hover:text-white transition-colors">En Beğenilen</Link></li>
              <li><Link href="/katalog?sort=newest" className="hover:text-white transition-colors">Yeni Eklenenler</Link></li>
              <li><Link href="/egitimci/kayit" className="hover:text-white transition-colors">Eğitimci Ol</Link></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Kategoriler</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/katalog?kategori=gastronomi" className="hover:text-white transition-colors">Gastronomi</Link></li>
              <li><Link href="/katalog?kategori=el-sanatlari" className="hover:text-white transition-colors">El Sanatları</Link></li>
              <li><Link href="/katalog?kategori=ai-dijital" className="hover:text-white transition-colors">AI & Dijital</Link></li>
              <li><Link href="/katalog?kategori=girisimcilik" className="hover:text-white transition-colors">Girişimcilik</Link></li>
              <li><Link href="/katalog?kategori=finans" className="hover:text-white transition-colors">Finans</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Kurumsal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/hakkimizda" className="hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/egitimci-sozlesmesi" className="hover:text-white transition-colors">Eğitimci Sözleşmesi</Link></li>
              <li>
                <a href="mailto:info@birgundeogren.com" className="hover:text-white transition-colors">
                  İletişim
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {year} birgundeogren.com. Tüm hakları saklıdır. Kuniq Capital Inc.
          </p>
          <span className="text-xs text-white/30">
            by FU
          </span>
        </div>
      </div>
    </footer>
  );
}
