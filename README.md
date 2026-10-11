# SynapseFlow ⚡ — Otonom Ajan & Görsel İş Akışı DAG Motoru

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing_7%2F7-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Zero--Leakage_Client--Side-10B981)](#-güvenlik-mimarisi-zero-leakage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**SynapseFlow**, modern web mimarisinde karmaşık iş akışlarını, veri boru hatlarını (ETL) ve otonom yapay zeka ajanlarını görsel bir tuval üzerinde orkestre etmenizi sağlayan yüksek performanslı, istemci taraflı bir **Directed Acyclic Graph (DAG)** yürütme motorudur.

![SynapseFlow Dashboard Mockup](preview.jpg)

---

## 🌟 Öne Çıkan Yetenekler

- 📐 **İnteraktif Görsel DAG Tuvali:** Düğümleri (Node) sürükleyip bırakma, pürüzsüz Cubic Bezier neon hatlarla birbirine bağlama, canlı kablo çekme ve bağlantı yönetimi.
- ⚡ **Kahn Algoritması & Topolojik Sıralama:** Grafikteki bağımlılıkları matematiksel olarak analiz ederek doğru sıralı yürütme hattı oluşturur.
- 🔄 **DFS Döngü (Cycle) Tespiti:** Çevrimsel hataları (sonsuz döngüleri) görselleştirerek kullanıcının DAG standartlarına uyumlu akışlar kurmasını güvenceye alır.
- 🔀 **Koşullu Dallanma (Rule Engine Branching):** Mantıksal IF/ELSE kontrolleriyle akışı `True` ve `False` portlarına ayırır; seçilmeyen dalları otomatik olarak atlar (`skipped`).
- 🛡️ **Kriptografik Bütünlük (SHA-256):** SubtleCrypto API ile veri paketlerini şifreler, dijital parmak izi üretir ve kurcalamaya karşı korur.
- 📊 **Canlı Telemetri & Terminal Günlükleri:** Her adımın mikrosaniye/milisaniye düzeyinde gecikme metrikleri (Latency Bar), renkli log akışı ve ham JSON yükü denetleyicisi.
- 📦 **JSON İçe & Dışa Aktarma (Portable Schema):** Oluşturulan tüm iş akışlarını tek tıkla standartlaştırılmış JSON olarak dışa aktarabilir veya geri yükleyebilirsiniz.

---

## 🏗️ Mimari & Akış Şeması

```mermaid
flowchart LR
    A["Giriş Tetikleyicisi<br/>(Webhook / Cron / Event)"] --> B["Veri & Kripto İşleme<br/>(SHA-256 / Transformer)"]
    B --> C["AI Ajan Analizi<br/>(Tehdit & Niyet Sınıflandırma)"]
    C --> D{"Karar Motoru<br/>(Condition IF/ELSE)"}
    D -- "True (Risk > Eşik)" --> E["Kritik SecOps Bildirimi<br/>(Slack / Webhook Dispatch)"]
    D -- "False (Normal)" --> F["Değiştirilemez Kütük<br/>(Audit Ledger)"]
```

---

## 🧩 Hazır Şablonlar (Built-in Pipelines)

1. **Siber Güvenlik & Şüpheli İstek Analiz Hattı:** Webhook girişini karşılar, SHA-256 ile bütünlüğü doğrular, AI ajanla anomali tespit eder ve risk eşiği aşıldığında SecOps ekibine acil bildirim fırlar.
2. **Akıllı Müşteri Talebi & Duygu Analizi Yönlendirmesi:** Müşteri destek biletlerinin duygusunu (Sentiment) analiz ederek öfkeli/acil talepleri anında üst seviye mühendislere eskalasyon yapar.
3. **Zamanlanmış Telemetri & ETL Veri Boru Hattı:** Gece yarısı tetiklenerek hız sınırlayıcı kontrolünden geçer, şemaları dönüştürür ve denetim günlüğüne işler.

---

## 🔒 Güvenlik Mimarisi (Zero-Leakage Guarantee)

- **İstemci Taraflı Sandbox:** Hiçbir kullanıcı verisi, parola veya oturum bilgisi harici bir üçüncü taraf sunucuya sızdırılmaz.
- **Web Crypto API Standardı:** Şifreleme ve özetleme işlemleri doğrudan tarayıcının yerel Web Crypto donanım hızlandırıcısında icra edilir.
- **Güvenli Bağımlılık Yönetimi:** Sıfır dış güvenlik açığı politikasıyla derlenmiştir.

---

## 🧪 Testler

Grafik motoru, döngü tespiti, Kahn algoritması ve koşullu dallanma mantıkları kapsamlı birim testleri ile test edilmiştir:

```bash
# Birim testleri çalıştırmak için:
npm test
```

```
✓ src/engine/__tests__/graphEngine.test.ts (7 tests) 141ms
  ✓ geçerli bir DAG için döngü tespit etmemelidir (hasCycle = false)
  ✓ döngü içeren grafikte çevrimi tespit etmeli ve döngü rotasını döndürmelidir
  ✓ Kahn algoritması düğümleri doğru topolojik sırada sıralamalıdır
  ✓ Kahn algoritması döngü olduğunda hata fırlatmalıdır
  ✓ computeHash fonksiyonu SHA-256 veya hex çıktısı üretmelidir
  ✓ condition_branch düğümü koşul sağlandığında true dalını seçmelidir
  ✓ condition_branch düğümü koşul sağlanmadığında false dalını seçmelidir

Test Files  1 passed (1)
     Tests  7 passed (7)
```

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda ayağa kaldırmak için:

```bash
# 1. Depoyu klonlayın
git clone https://github.com/goktugis/synapse-flow.git

# 2. Proje dizinine girin
cd synapse-flow

# 3. Bağımlılıkları yükleyin
npm install

# 4. Geliştirme sunucusunu başlatın
npm run dev

# 5. Prodüksiyon derlemesi alın
npm run build
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında geliştirilmiş açık kaynaklı bir yazılımdır.
