import { Link } from "wouter";
import { MapPin, Mail, Globe, Users, Target, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Hakkimizda() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#142240] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Hakkımızda
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            birgundeogren.com, Türkiye'nin ilk 1 günlük yoğun eğitim pazar yeri platformudur.
          </p>
          <p className="text-white/50 text-sm mt-3">
            birgundeogren.com bir Kuniq Capital Inc. kuruluşudur.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* About */}
        <section className="bg-card border border-card-border rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Biz Kimiz?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">birgundeogren.com</strong>, Türkiye'nin ilk 1 günlük yoğun eğitim pazar yeri platformudur. Alanında uzman eğitimcilerle meraklı öğrencileri bir araya getirerek pratik, uygulamalı ve sertifikalı workshop deneyimleri sunar.
            </p>
            <p>
              Geleneksel uzun soluklu eğitim modellerinin aksine, birgundeogren.com konsantre, yoğun ve sonuç odaklı 1 günlük workshopları ile öğrencilerin en kısa sürede gerçek beceriler kazanmasını hedefler. Gastronomi'den yapay zekâya, el sanatlarından girişimciliğe kadar 10 farklı kategoride yüzlerce eğitim seçeneği sunar.
            </p>
            <p>
              birgundeogren.com, <strong className="text-foreground">Kuniq Capital Inc.</strong> bünyesinde faaliyet göstermektedir.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-card-border rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-[#E8872A]/20 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-[#E8872A]" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Misyonumuz</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Türkiye'deki her bireyin, alanında uzman kişilerden kısa sürede pratik beceriler kazanmasını sağlamak. Uzmanlığını paylaşmak isteyen eğitimcilere de sürdürülebilir bir gelir modeli sunarak bilginin toplumda yaygınlaşmasına katkıda bulunmak.
            </p>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-8">
            <div className="w-12 h-12 rounded-xl bg-[#1A8A7D]/20 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-[#1A8A7D]" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Vizyonumuz</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Türkiye'nin en büyük yoğun eğitim ekosistemi olmak; her ilde aktif eğitimciler ve binlerce mezun öğrenci ile hayat boyu öğrenme kültürünü yaygınlaştırmak. Uluslararası arenada da Türk eğitimcilerin ve bilgisinin tanınmasına köprü olmak.
            </p>
          </div>
        </div>

        {/* Values */}
        <section className="bg-card border border-card-border rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Değerlerimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Pratiklik", desc: "Teoriden çok uygulamaya odaklanır, öğrendiklerini hayata geçirmeni sağlarız." },
              { title: "Kalite", desc: "Tüm eğitimcilerimiz uzman başvuru sürecinden geçer; içerik kalitesini ön planda tutarız." },
              { title: "Topluluk", desc: "Eğitimci ve öğrenci topluluğumuzu büyüterek bilgi paylaşım kültürünü güçlendiririz." },
              { title: "Şeffaflık", desc: "Eğitimci ve katılımcılarımıza her zaman açık, dürüst ve anlaşılır iletişim kurarız." },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-[#E8872A] flex-shrink-0 mt-2" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-[#0A1628] rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-white mb-6">İletişim</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/70">
              <Globe className="w-5 h-5 text-[#E8872A] flex-shrink-0" />
              <a href="https://birgundeogren.com" className="hover:text-white transition-colors">
                birgundeogren.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Mail className="w-5 h-5 text-[#E8872A] flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <a href="mailto:info@birgundeogren.com" className="hover:text-white transition-colors">
                  info@birgundeogren.com
                </a>
                <span className="hidden sm:block text-white/30">|</span>
                <a href="mailto:info@kuniqcapital.com" className="hover:text-white transition-colors">
                  info@kuniqcapital.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Users className="w-5 h-5 text-[#E8872A] flex-shrink-0" />
              <span>Kuniq Capital Inc.</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/egitimci/kayit"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#E8872A] hover:bg-[#d07020] text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Eğitimci Başvurusu Yap
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-white hover:bg-white/10 font-semibold rounded-lg transition-colors text-sm"
            >
              Eğitimleri Keşfet
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
