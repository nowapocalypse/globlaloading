# Globla DarkRP Community - Loading Screen

Bu klasör, Globla DarkRP sunucunuz için hazırlanmış retro Synthwave / Outrun temalı özel Garry's Mod Yükleme Ekranını (Loading Screen) içerir.

---

## 📁 Klasör Yapısı

* **`index.html`** - Yükleme ekranı ana HTML yapısı.
* **`style.css`** - Neon Outrun / Synthwave görsel stilleri ve animasyonlar.
* **`config.js`** - **Sunucu adı, slogan, mesajlar, kurucular ve müzik ayarlarının yapıldığı konfigürasyon dosyası.**
* **`app.js`** - Steam avatar çekme, GMod indirme durumu ve canlı % takibi scripti.
* **`bg.png`** - Synthwave plaj arkaplan görseli.

---

## 🛠️ Nasıl Sunucuya Bağlanır? (GMod Kurulumu)

Garry's Mod yükleme ekranları bir web adresi (URL) üzerinden çalışır. Bu dosyaları **ücretsiz bir web sunucusunda** veya **GitHub Pages**'te barındırabilirsiniz.

### 1. Ücretsiz Barındırma (GitHub Pages Yöntemi - Tavsiye Edilen):
1. GitHub hesabınızda yeni bir **Public (Açık)** repository oluşturun (Örn: `globla-loadingscreen`).
2. `d:\gmodserver\loadingscreen\` içerisindeki tüm dosyaları repo'ya yükleyin.
3. Reponuzda **Settings (Ayarlar) -> Pages** bölümüne gidin.
4. **Source** kısmından `main` veya `master` dalını seçip **Save** butonuna basın.
5. GitHub size özel bir bağlantı verecektir (Örn: `https://kullaniciadi.github.io/globla-loadingscreen/`).

### 2. `server.cfg` Ayarı:
Sunucu dosyalarınızdaki `garrysmod/cfg/server.cfg` dosyasını açın ve en alta şu satırı ekleyin:

```ini
sv_loadingurl "https://YOUR-WEB-SITE-URL/index.html?steamid=%s&mapname=%m"
```

*(Yukarıdaki `YOUR-WEB-SITE-URL` kısmını kendi GitHub Pages veya Web Sitenizin adresi ile değiştirin).*

---

## 🎵 Müzik Nasıl Eklenir?

1. Yüklemek istediğiniz MP3 şarkılarını bu klasörün içine `music` adında bir klasör açarak koyun (`music/parca1.mp3`).
2. `config.js` dosyasını açın ve `playlist` bölümünü güncelleyin:

```javascript
playlist: [
    {
        title: "Retro Synthwave Track",
        artist: "Globla DarkRP",
        src: "music/parca1.mp3"
    }
]
```

---

## ⚙️ Kurucular ve İpuçları Nasıl Değiştirilir?

`config.js` dosyasından aşağıdaki değerleri kolayca düzenleyebilirsiniz:
* **`founders`**: Kurucu Steam64 ID'leri (`76561199057737429`, `76561199089756265`).
* **`messages`**: Ekranda sırayla dönen roleplay ipuçları ve kurallar.
* **`slogan`**: Sunucu sloganı.
