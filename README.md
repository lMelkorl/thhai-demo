# THH-AI - Tüketici Hakem Heyeti Yapay Zeka Asistanı

Türkiye Cumhuriyeti mevzuatına tam hâkim, tarafsız ve hukuki rehberlik odaklı bir yapay zeka asistanı. Hem tüketicilere hem de Tüketici Hakem Heyeti üyelerine başvuru ve inceleme süreçlerinde yardımcı olur.

## 🎯 Özellikler

- **Tüketici Modülü**: Kullanıcıların kendi cümleleriyle anlattığı şikayetleri mevzuata uygun resmi başvuru metnine dönüştürür
- **Hakem Heyeti Modülü**: Başvuru metinlerini analiz eder ve tarafsız ön rapor hazırlar
- **Akıllı Soru-Cevap**: Eksik bilgi varsa kullanıcıya sorar
- **Mevzuat Referansları**: Her analiz ilgili kanun maddelerine referans verir
- **Modern UI**: SvelteKit + TailwindCSS + shadcn-svelte ile modern ve kullanıcı dostu arayüz

## 🛠️ Teknolojiler

- **Framework**: SvelteKit (TypeScript)
- **AI Provider**: Together AI (Meta-Llama-3.1-8B-Instruct-Turbo)
- **Styling**: TailwindCSS v3 + shadcn-svelte
- **Icons**: Lucide Svelte

## 📋 Kurulum

1. **Bağımlılıkları Kurun**
```bash
npm install
```

2. **Environment Değişkenlerini Ayarlayın**
`.env.example` dosyasını `.env` olarak kopyalayın ve Together AI API anahtarınızı ekleyin:
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
TOGETHER_API_KEY=your_together_ai_api_key_here
```

3. **Geliştirme Sunucusunu Başlatın**
```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 🚀 Kullanım

### Tüketici Olarak

1. Ana sayfadan "Tüketici" kartına tıklayın
2. Şehir ve uyuşmazlık bedeli bilgilerini girin
3. Başınıza geleni kendi cümlelerinizle anlatın
4. "Devam Et" butonuna tıklayın
5. Eksik bilgi varsa sistem size soracaktır
6. Yeterli bilgi varsa resmi başvuru metni hazırlanacaktır
7. Metni kopyalayıp e-Devlet'e yapıştırabilirsiniz

### Hakem Heyeti Üyesi Olarak

1. Ana sayfadan "Hakem Heyeti" kartına tıklayın
2. Uyuşmazlık konusunu girin
3. Başvuru metnini yapıştırın
4. "Analiz Et" butonuna tıklayın
5. Tarafsız ön analiz raporunu inceleyin

## 📦 Build

Production build oluşturmak için:
```bash
npm run build
```

Production build'i önizlemek için:
```bash
npm run preview
```

## ⚖️ Mevzuat Bilgisi

Sistem aşağıdaki mevzuatlara göre çalışır:

- 6502 Sayılı Tüketicinin Korunması Hakkında Kanun
- Garanti Belgesi Yönetmeliği
- Tüketici Hakem Heyetleri Yönetmeliği (2025 güncel parasal sınırlar)

## 🔒 Güvenlik Notu

- API anahtarınızı asla commit etmeyin
- `.env` dosyası `.gitignore` içinde bulunmaktadır
- Production ortamında environment değişkenlerini güvenli şekilde yönetin

## 📝 Lisans

Bu proje Türkiye Cumhuriyeti mevzuatına göre hazırlanmıştır ve yalnızca bilgilendirme amaçlıdır. Kesin hukuki karar vermez.
