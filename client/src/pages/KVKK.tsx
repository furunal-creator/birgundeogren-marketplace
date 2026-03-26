import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KVKK() {
  const lastUpdated = "21 Mart 2026";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-card-border rounded-2xl p-8 sm:p-12">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-center">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-2">
              6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında
            </p>
            <p className="text-muted-foreground text-center text-xs mb-10">
              Son Güncelleme: {lastUpdated}
            </p>

            <div className="space-y-8 text-sm text-foreground leading-relaxed">

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  1. Veri Sorumlusu
                </h2>
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz <strong>Capital 247 Inc.</strong> ("Şirket" veya "Capital 247 Inc.") tarafından veri sorumlusu sıfatıyla işlenmektedir.
                </p>
                <div className="mt-3 p-4 bg-muted/30 rounded-lg space-y-1 text-xs text-muted-foreground">
                  <p><strong className="text-foreground">Unvan:</strong> Capital 247 Inc.</p>
                  <p><strong className="text-foreground">Platform:</strong> birgundeogren.com</p>
                  <p><strong className="text-foreground">E-posta:</strong>{" "}
                    <a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:underline">info@birgundeogren.com</a>
                    {" | "}
                    <a href="mailto:info@capital247.com.tr" className="text-[#E8872A] hover:underline">info@capital247.com.tr</a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  2. İşlenen Kişisel Veriler
                </h2>
                <p className="mb-3">birgundeogren.com platformunu kullandığınızda aşağıdaki kişisel verileriniz işlenebilir:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { cat: "Kimlik Bilgileri", items: "Ad, Soyad" },
                    { cat: "İletişim Bilgileri", items: "E-posta adresi, telefon numarası" },
                    { cat: "Hesap Bilgileri", items: "Kullanıcı adı, şifre (şifrelenmiş)" },
                    { cat: "İşlem Bilgileri", items: "Satın alınan eğitimler, rezervasyonlar" },
                    { cat: "Finansal Bilgiler", items: "Ödeme yöntemi (kart bilgileri doğrudan işlenmez)" },
                    { cat: "Teknik Veriler", items: "IP adresi, tarayıcı bilgisi, çerez verileri" },
                    { cat: "Eğitimci Verileri", items: "Biyografi, uzmanlık alanı, LinkedIn profili, banka IBAN" },
                  ].map(({ cat, items }) => (
                    <div key={cat} className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-semibold text-xs text-foreground mb-1">{cat}</p>
                      <p className="text-xs text-muted-foreground">{items}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  3. Kişisel Verilerin İşlenme Amaçları
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                  <li>Platform hizmetlerinin sunulması ve kullanıcı hesabının yönetilmesi</li>
                  <li>Eğitim rezervasyonu ve satın alma işlemlerinin gerçekleştirilmesi</li>
                  <li>Eğitimci başvurularının değerlendirilmesi ve onaylanması</li>
                  <li>Ödeme işlemlerinin yapılması ve muhasebe yükümlülüklerinin yerine getirilmesi</li>
                  <li>Müşteri hizmetleri ve destek süreçlerinin yürütülmesi</li>
                  <li>Platform güvenliğinin sağlanması ve kötüye kullanımın önlenmesi</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>İstatistiksel analiz ve platform iyileştirme çalışmaları (anonim verilerle)</li>
                  <li>Açık rızanız doğrultusunda pazarlama ve bilgilendirme e-postaları gönderilmesi</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  4. Hukuki Sebepler
                </h2>
                <p className="mb-3 text-muted-foreground">Kişisel verileriniz aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                  <li><strong className="text-foreground">Sözleşmenin ifası:</strong> Kullanım koşulları ve eğitimci sözleşmesi kapsamındaki hizmetlerin sunulması</li>
                  <li><strong className="text-foreground">Hukuki yükümlülük:</strong> Vergi, muhasebe ve diğer yasal gerekliliklerin karşılanması</li>
                  <li><strong className="text-foreground">Meşru menfaat:</strong> Platform güvenliği, dolandırıcılık önleme, hizmet kalitesinin artırılması</li>
                  <li><strong className="text-foreground">Açık rıza:</strong> Pazarlama iletişimleri ve opsiyonel veri işleme faaliyetleri</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  5. Kişisel Verilerin Aktarımı
                </h2>
                <p className="mb-3 text-muted-foreground">Kişisel verileriniz, aşağıdaki alıcı gruplarına aktarılabilir:</p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-muted-foreground">
                  <li><strong className="text-foreground">Ödeme altyapı sağlayıcıları:</strong> Ödeme işlemlerinin güvenli şekilde yapılabilmesi için</li>
                  <li><strong className="text-foreground">E-posta hizmet sağlayıcıları:</strong> Bildirim ve iletişim e-postalarının gönderilmesi için</li>
                  <li><strong className="text-foreground">Bulut hizmet sağlayıcıları:</strong> Platform altyapısının işletilmesi için (yurt içi veya KVKK'ya uygun yurt dışı aktarım)</li>
                  <li><strong className="text-foreground">Yetkili kamu kurum ve kuruluşları:</strong> Yasal zorunluluk halinde</li>
                  <li><strong className="text-foreground">Eğitimciler:</strong> Kayıt işleminizin tamamlanabilmesi için ad ve iletişim bilgileriniz</li>
                </ul>
                <p className="mt-3 text-muted-foreground">
                  Kişisel verileriniz hiçbir koşulda pazarlama amacıyla üçüncü taraflara satılmaz veya kiralanmaz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  6. Saklama Süreleri
                </h2>
                <p className="text-muted-foreground">
                  Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte silinir, yok edilir veya anonim hale getirilir. Yasal yükümlülükler gerektirdiğinde verileriniz ilgili mevzuatta öngörülen süreler boyunca saklanır (örn. muhasebe kayıtları için 10 yıl). Hesabınızı silmeniz halinde kişisel verileriniz en geç 90 gün içinde sistemden kaldırılır.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  7. İlgili Kişinin Hakları
                </h2>
                <p className="mb-3 text-muted-foreground">KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
                    "İşlenmişse buna ilişkin bilgi talep etme",
                    "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
                    "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme",
                    "Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme",
                    "KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme",
                    "Düzeltme, silme veya yok etme işlemlerinin üçüncü kişilere bildirilmesini isteme",
                    "İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
                    "Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme",
                  ].map((right, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-[#E8872A] font-bold flex-shrink-0">{i + 1}.</span>
                      <span>{right}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  8. Haklarınızı Kullanmak İçin
                </h2>
                <p className="text-muted-foreground">
                  Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki iletişim kanallarını kullanabilirsiniz. Başvurunuz en geç <strong className="text-foreground">30 gün</strong> içinde yanıtlanacaktır.
                </p>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-2 text-sm">
                  <p>
                    <strong>E-posta:</strong>{" "}
                    <a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:underline">
                      info@birgundeogren.com
                    </a>
                  </p>
                  <p>
                    <strong>Alternatif E-posta:</strong>{" "}
                    <a href="mailto:info@capital247.com.tr" className="text-[#E8872A] hover:underline">
                      info@capital247.com.tr
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  9. Çerezler (Cookies)
                </h2>
                <p className="text-muted-foreground">
                  Platform, hizmet kalitesini iyileştirmek ve kullanıcı deneyimini kişiselleştirmek amacıyla çerez kullanmaktadır. Zorunlu çerezler platformun temel işlevleri için gereklidir. Analitik ve pazarlama çerezleri için açık rızanız alınmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı platform özellikleri çalışmayabilir.
                </p>
              </section>

              <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
                <p>Capital 247 Inc. — birgundeogren.com</p>
                <p className="mt-1">
                  <a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:underline">info@birgundeogren.com</a>
                </p>
                <p className="mt-2">Son güncelleme: {lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
