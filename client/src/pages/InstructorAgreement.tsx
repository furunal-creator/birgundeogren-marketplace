import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function InstructorAgreement() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Draft Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-amber-800 text-sm font-medium">
            ⚠️ Bu sözleşme taslak niteliğindedir. Hukuki bağlayıcılığı bulunmamakta olup nihai metin Capital 247 Hukuk Birimi tarafından revize edilecektir.
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-8 sm:p-12">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2 text-center">
              Eğitimci İşbirliği Sözleşmesi
            </h1>
            <p className="text-muted-foreground text-center text-sm mb-10">
              birgundeogren.com — Capital 247 Inc.
            </p>

            <div className="prose prose-slate max-w-none space-y-8 text-sm text-foreground leading-relaxed">

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 1 — Taraflar
                </h2>
                <p>
                  İşbu Eğitimci İşbirliği Sözleşmesi ("Sözleşme"); bir tarafta <strong>Capital 247 Inc.</strong> ("Platform" veya "Şirket") ile diğer tarafta <strong>birgundeogren.com</strong> platformu üzerinden eğitim hizmeti sunmak üzere başvuru yapan gerçek veya tüzel kişi ("Eğitimci") arasında akdedilmiştir.
                </p>
                <p className="mt-2">Platform adresi: birgundeogren.com</p>
                <p>İletişim: info@birgundeogren.com | info@capital247.com.tr</p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 2 — Sözleşmenin Konusu
                </h2>
                <p>
                  İşbu Sözleşme; Eğitimci'nin birgundeogren.com platformu üzerinden yoğun, pratik ve uygulamalı 1-günlük (veya kısa süreli) workshop/eğitim hizmetleri sunmasına ilişkin tarafların hak ve yükümlülüklerini düzenlemektedir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 3 — Eğitimcinin Yükümlülükleri
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Platform üzerinde yayınlanan eğitim içeriklerinin doğru, güncel ve kaliteli olmasını sağlamak.</li>
                  <li>Eğitim seanslarını belirlenen tarih, saat ve mekânda eksiksiz gerçekleştirmek.</li>
                  <li>Katılımcılara karşı saygılı ve profesyonel davranmak; memnuniyet odaklı bir eğitim deneyimi sunmak.</li>
                  <li>Platform'un onaylamadığı herhangi bir ürün, hizmet veya üçüncü taraf platformunu eğitim sürecinde tanıtmamak.</li>
                  <li>Türkiye Cumhuriyeti mevzuatı kapsamındaki tüm yasal yükümlülüklere (vergi, SGK vb.) uymak.</li>
                  <li>Eğitim içeriklerinin herhangi bir üçüncü tarafın fikri mülkiyet haklarını ihlal etmediğini beyan ve taahhüt etmek.</li>
                  <li>Kişisel verilerin korunmasına ilişkin mevzuata (KVKK) uymak ve katılımcıların kişisel verilerini işlememek.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 4 — Platformun Yükümlülükleri
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Eğitimci'nin içeriklerini ve seanslarını yayınlamak için gerekli teknoloji altyapısını sağlamak.</li>
                  <li>Eğitimlerin tanıtımı ve pazarlanması için gerekli destekleri sağlamak.</li>
                  <li>Katılımcılardan tahsil edilen ödemeleri sözleşmede belirtilen koşullara uygun şekilde Eğitimci'ye aktarmak.</li>
                  <li>Eğitimci paneli üzerinden seans yönetimi, rezervasyon takibi ve gelir raporlaması imkânı sunmak.</li>
                  <li>Eğitimci'nin bilgilerini üçüncü taraflarla paylaşmamak (zorunlu haller ve yasal yükümlülükler hariç).</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 5 — Fikri Mülkiyet Hakları
                </h2>
                <p>
                  Eğitimci tarafından oluşturulan tüm eğitim içerikleri (sunum, materyal, müfredat, videolar vb.) Eğitimci'ye aittir. Platform, söz konusu içerikleri yalnızca bu Sözleşme kapsamında tanıtım ve satış amacıyla kullanma hakkına sahiptir. Eğitimci, Platform'a içeriklerini kendi platformunda yayınlama ve pazarlama amacıyla kullanma için sınırlı, münhasır olmayan bir lisans vermektedir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 6 — Ödeme Koşulları
                </h2>
                <p>
                  Eğitimci'ye yapılacak ödemeler, seans tamamlandıktan ve katılımcıların eğitimi onaylamasından sonra gerçekleştirilir. Ödemeler, Eğitimci'nin bildirdiği banka hesabına IBAN üzerinden Türk Lirası (TL) cinsinden aktarılır. Ödeme dönemleri ve komisyon oranları Platform tarafından Eğitimci'ye ayrıca bildirilir.
                </p>
                <p className="mt-2">
                  Platform, herhangi bir eğitim seansından elde edilen brüt gelir üzerinden hizmet bedeli kesintisi yapar; kalan tutar Eğitimci'ye aktarılır. Güncel komisyon oranları için <a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:underline">info@birgundeogren.com</a> adresine başvurulabilir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 7 — Fesih Koşulları
                </h2>
                <p>
                  Taraflardan her biri, en az <strong>30 (otuz) gün</strong> önceden yazılı bildirimde bulunarak Sözleşme'yi feshedebilir. Fesih bildiriminin e-posta yoluyla (<a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:underline">info@birgundeogren.com</a>) yapılması yeterlidir. Fesih tarihinden önce başlamış veya rezervasyonu alınmış seanslar, tarafların mutabakatıyla tamamlanır.
                </p>
                <p className="mt-2">
                  Platform; Eğitimci'nin işbu Sözleşme'yi veya Platform kurallarını ihlal etmesi halinde herhangi bir tazminat ödemeksizin Sözleşme'yi derhal feshedebilir.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 8 — Gizlilik
                </h2>
                <p>
                  Taraflar, bu Sözleşme kapsamında birbirlerinden edindikleri ticari, mali ve teknik bilgileri gizli tutmayı ve üçüncü kişilerle paylaşmamayı kabul eder. Gizlilik yükümlülüğü, Sözleşme'nin sona ermesinden itibaren 2 (iki) yıl süreyle geçerliliğini korur.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 9 — KVKK Uyumu
                </h2>
                <p>
                  Taraflar, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") başta olmak üzere yürürlükteki tüm kişisel veri mevzuatına uyumu kabul ve taahhüt eder. Eğitimci, katılımcıların kişisel verilerini Platform dışında işleyemez, saklayamaz veya üçüncü taraflarla paylaşamaz.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 10 — Uyuşmazlık Çözümü
                </h2>
                <p>
                  İşbu Sözleşme'den doğan veya bununla ilgili her türlü uyuşmazlık, öncelikle tarafların iyi niyetli müzakereleriyle çözülmeye çalışılır. Anlaşma sağlanamaması durumunda <strong>İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri</strong> yetkilidir. Uygulanacak hukuk Türk hukukudur.
                </p>
              </section>

              <section>
                <h2 className="font-display text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">
                  Madde 11 — Çeşitli Hükümler
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Bu Sözleşme, Eğitimci'nin Platform'a başvuru formunu doldurması ve onaylamasıyla yürürlüğe girer.</li>
                  <li>Sözleşme'nin herhangi bir hükmünün geçersiz sayılması, diğer hükümlerin geçerliliğini etkilemez.</li>
                  <li>Platform, bu Sözleşme'nin hükümlerini 30 gün önceden e-posta yoluyla bildirmek suretiyle değiştirebilir.</li>
                  <li>Eğitimci, bu Sözleşme kapsamındaki hak ve yükümlülüklerini Platform'un yazılı onayı olmaksızın üçüncü bir kişiye devredemez.</li>
                </ul>
              </section>

              <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
                <p>birgundeogren.com — Capital 247 Inc.</p>
                <p className="mt-1">
                  <a href="mailto:info@birgundeogren.com" className="text-[#E8872A] hover:underline">info@birgundeogren.com</a>
                  {" | "}
                  <a href="mailto:info@capital247.com.tr" className="text-[#E8872A] hover:underline">info@capital247.com.tr</a>
                </p>
                <p className="mt-2 italic text-amber-600">Bu sözleşme taslak niteliğindedir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
