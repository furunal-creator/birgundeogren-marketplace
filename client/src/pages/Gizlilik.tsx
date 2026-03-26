import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Gizlilik() {
  const lastUpdated = "21 Mart 2026";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-card-border rounded-2xl p-8 sm:p-12">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-center">
              Gizlilik Politikası
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-2">
              birgundeogren.com — Capital 247 Inc.
            </p>
            <p className="text-muted-foreground text-center text-xs mb-10">
              Son Güncelleme: {lastUpdated}
            </p>

            <div className="space-y-8 text-sm text-foreground leading-relaxed">

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  1. Genel Bilgi
                </h2>
                <p className="text-muted-foreground">
                  Bu Gizlilik Politikası, <strong className="text-foreground">birgundeogren.com</strong> web sitesini ve mobil uygulamalarını kullanmanız sırasında kişisel verilerinizin nasıl toplandığını, kullanıldığını, paylaşıldığını ve korunduğunu açıklamaktadır. birgundeogren.com, Capital 247 Inc. tarafından işletilmektedir.
                </p>
                <p className="text-muted-foreground mt-3">
                  Bu politikayı kabul etmek için sitemizi kullanmaya devam etmeniz yeterlidir. Kabul etmiyorsanız lütfen sitemizi kullanmayı bırakın.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  2. Toplanan Veriler
                </h2>

                <h3 className="font-semibold text-foreground mb-2">2.1 Doğrudan Verdiğiniz Veriler</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground mb-4">
                  <li>Kayıt sırasında: Ad, soyad, e-posta, telefon</li>
                  <li>Ödeme sırasında: Fatura bilgileri (kart numarası saklanmaz)</li>
                  <li>Eğitimci başvurusunda: Uzmanlık bilgileri, biyografi, banka bilgileri</li>
                  <li>Destek taleplerinde: İletişim içeriği</li>
                </ul>

                <h3 className="font-semibold text-foreground mb-2">2.2 Otomatik Toplanan Veriler</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground mb-4">
                  <li>IP adresi ve coğrafi konum (ülke/şehir düzeyinde)</li>
                  <li>Tarayıcı türü ve versiyonu</li>
                  <li>Cihaz bilgisi (masaüstü/mobil)</li>
                  <li>Sayfa görüntülemeleri ve tıklama verileri</li>
                  <li>Oturum süresi ve gezinme yolları</li>
                </ul>

                <h3 className="font-semibold text-foreground mb-2">2.3 Çerezler Aracılığıyla Toplanan Veriler</h3>
                <p className="text-muted-foreground">
                  Çerezler hakkında detaylı bilgi için aşağıdaki "Çerez Politikası" bölümünü inceleyiniz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  3. Verilerin Kullanım Amaçları
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                  <li>Hesap oluşturma, doğrulama ve yönetme</li>
                  <li>Eğitim rezervasyonu ve ödeme işlemlerini gerçekleştirme</li>
                  <li>Eğitimci başvurularını değerlendirme</li>
                  <li>Müşteri desteği sağlama</li>
                  <li>Platform güvenliğini ve sahtekârlığı önleme</li>
                  <li>Hizmet kalitesini analiz etme ve iyileştirme</li>
                  <li>Yasal yükümlülükleri yerine getirme</li>
                  <li>Açık rızanız dahilinde: Yeni eğitimler, kampanyalar ve güncellemeler hakkında bilgilendirme</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  4. Üçüncü Taraf Paylaşımı
                </h2>
                <p className="mb-3 text-muted-foreground">
                  Kişisel verilerinizi aşağıdaki haller dışında üçüncü taraflarla paylaşmıyoruz:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                  <li><strong className="text-foreground">Hizmet sağlayıcılar:</strong> Ödeme işlemcileri, e-posta hizmet sağlayıcıları, bulut altyapı sağlayıcıları (yalnızca hizmetin ifası amacıyla)</li>
                  <li><strong className="text-foreground">Eğitimciler:</strong> Kayıtlı olduğunuz eğitimin eğitimcisi, yalnızca o eğitime özel iletişim amacıyla</li>
                  <li><strong className="text-foreground">Yasal zorunluluk:</strong> Mahkeme kararı veya yasal yükümlülük gerektirdiğinde yetkili makamlarla</li>
                  <li><strong className="text-foreground">Şirket devrinde:</strong> Capital 247'nin tüm veya bir kısmının devredilmesi durumunda (önceden bildirimde bulunulur)</li>
                </ul>
                <p className="mt-3 text-muted-foreground font-medium">
                  Verilerinizi hiçbir koşulda reklam amaçlı üçüncü taraflara satmıyoruz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  5. Çerez Politikası
                </h2>

                <div className="space-y-4 text-muted-foreground">
                  <p>birgundeogren.com, çeşitli amaçlarla çerez kullanmaktadır. Çerez türleri:</p>

                  <div className="space-y-3">
                    {[
                      {
                        type: "Zorunlu Çerezler",
                        desc: "Platformun temel işlevleri için gereklidir (oturum yönetimi, güvenlik). Devre dışı bırakılamaz.",
                        color: "bg-green-100 text-green-700",
                      },
                      {
                        type: "Tercih Çerezleri",
                        desc: "Dil, tema gibi kullanıcı tercihlerini hatırlar. Devre dışı bırakılabilir.",
                        color: "bg-blue-100 text-blue-700",
                      },
                      {
                        type: "Analitik Çerezler",
                        desc: "Platform kullanımını anonim olarak ölçer (örn. Google Analytics). Açık rızanıza bağlıdır.",
                        color: "bg-purple-100 text-purple-700",
                      },
                      {
                        type: "Pazarlama Çerezleri",
                        desc: "İlgi alanlarınıza uygun reklamlar göstermek için kullanılabilir. Açık rızanıza bağlıdır.",
                        color: "bg-orange-100 text-orange-700",
                      },
                    ].map(({ type, desc, color }) => (
                      <div key={type} className="p-3 rounded-lg bg-muted/30">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{type}</span>
                        <p className="mt-2 text-xs">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <p>
                    Tarayıcınızın ayarlarından çerezleri yönetebilir veya silebilirsiniz. Çerezleri devre dışı bırakmak bazı platform özelliklerinin çalışmamasına yol açabilir.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  6. Veri Güvenliği
                </h2>
                <p className="text-muted-foreground">
                  Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktayız:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground mt-3">
                  <li>SSL/TLS şifrelemesi ile veri iletimi</li>
                  <li>Şifreli veri depolama</li>
                  <li>Erişim kontrolü ve yetkilendirme sistemleri</li>
                  <li>Düzenli güvenlik denetimleri</li>
                </ul>
                <p className="mt-3 text-muted-foreground">
                  Kart bilgileriniz hiçbir zaman sunucularımızda depolanmaz; PCI-DSS uyumlu ödeme sağlayıcıları tarafından işlenir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  7. Çocukların Gizliliği
                </h2>
                <p className="text-muted-foreground">
                  birgundeogren.com, 18 yaşın altındaki kişilere yönelik bir hizmet sunmamaktadır. 18 yaşın altındaki bir kişinin kişisel verisini yanlışlıkla topladığımızı fark edersek, bu veriyi derhal sileriz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  8. Politika Güncellemeleri
                </h2>
                <p className="text-muted-foreground">
                  Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda kayıtlı e-posta adresinize bildirim gönderilecektir. Siteyi kullanmaya devam etmeniz güncellenmiş politikayı kabul ettiğiniz anlamına gelir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  9. İletişim
                </h2>
                <p className="text-muted-foreground">
                  Gizlilik politikamız veya kişisel verileriniz hakkında sorularınız için:
                </p>
                <div className="mt-3 p-4 bg-muted/30 rounded-lg text-sm space-y-2">
                  <p>
                    <a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:underline">
                      info@birgundeogren.com
                    </a>
                  </p>
                  <p>
                    <a href="mailto:info@capital247.com.tr" className="text-[#E8872A] hover:underline">
                      info@capital247.com.tr
                    </a>
                  </p>
                </div>
              </section>

              <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
                <p>© {new Date().getFullYear()} birgundeogren.com — Capital 247 Inc.</p>
                <p className="mt-1">Son güncelleme: {lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
