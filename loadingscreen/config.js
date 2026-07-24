/* ==========================================================================
   GLOBLA DARKRP COMMUNITY - LOADING SCREEN CONFIGURATION
   Tüm ayarları, yazıları, müzikleri ve kurucuları buradan değiştirebilirsiniz.
   ========================================================================== */

const CONFIG = {
    // Sunucu Genel Bilgileri
    serverName: "Globla DarkRP Community",
    slogan: "Klasik DarkRP tadında.",
    
    // Mesajlar & İpuçları (Otomatik olarak sırayla ekranda değişir)
    messages: [
        "Karmaşadan uzak bir roleplay deneyimi.",
        "F4 menüsüne basarak mesleğini seçebilir, jeneratör ve printer'larını alarak kendi finansal imparatorluğunu kurabilirsin.",
        "Beğendiğin bir evi gözüne kestirip F2 tuşuna basarak kapısını satın alabilirsin."
    ],
    
    // Mesaj değiştirme aralığı (Milisaniye cinsinden, 6000 = 6 saniye)
    messageInterval: 6000,

    // Kurucular & Yetkililer (Steam64 ID'leri)
    founders: [
        {
            steamid: "76561199057737429",
            name: "SifKox", // Steam profilinden otomatik çekilir, yedek isim
            rank: "Kurucu",
            avatar: "" // Boş bırakılırsa Steam'den otomatik çekilir
        },
        {
            steamid: "76561199089756265",
            name: "Kurucu", // Steam profilinden otomatik çekilir, yedek isim
            rank: "Kurucu",
            avatar: ""
        }
    ],

    // Müzik Çalar Ayarları
    music: {
        enabled: true,          // Müzik çalar aktif mi? (true/false)
        autoplay: true,         // Otomatik başlasın mı? (true/false)
        defaultVolume: 0.3,     // Varsayılan ses seviyesi (0.0 ile 1.0 arası)
        
        // Çalma Listesi (music/ klasörüne attığınız MP3 dosyalarını buraya yazın)
        playlist: [
            {
                title: "Arkaplan Müziği 1",
                artist: "Globla DarkRP",
                src: "music/sarki1.mp3"
            },
            {
                title: "Arkaplan Müziği 2",
                artist: "Globla DarkRP",
                src: "music/sarki2.mp3"
            }
        ]
    },

    // Varsayılan Oyuncu Bilgileri (GMod dışında doğrudan tarayıcıda açılırsa görünür)
    defaultPlayer: {
        name: "Oyuncu",
        steamid: "76561198000000000",
        avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"
    },

    // Sosyal Medya & Bağlantılar (İsteğe bağlı)
    links: {
        discord: "https://discord.gg/yourserver",
        website: "https://globladarkrp.com"
    }
};
