/* ==========================================================================
   GLOBLA DARKRP COMMUNITY - LOADING SCREEN CORE LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initServerInfo();
    initPlayerInfo();
    initFounderInfo();
    initMessageRotator();
    initAudioPlayer();
    initGModHooks();
});

function initServerInfo() {
    const sloganEl = document.getElementById("server-slogan");
    if (sloganEl && typeof CONFIG !== "undefined") {
        sloganEl.textContent = CONFIG.slogan || "KLASİK DARKRP TADINDA.";
    }
}

/* --------------------------------------------------------------------------
   1. OYUNCU BİLGİSİ (STEAMID & HARİTA)
   -------------------------------------------------------------------------- */
function initPlayerInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const steamId = urlParams.get("steamid");

    const playerNameEl = document.getElementById("player-name");
    const playerAvatarEl = document.getElementById("player-avatar");

    if (steamId && steamId !== "%s") {
        fetchSteamProfile(steamId, (profile) => {
            if (playerNameEl) playerNameEl.textContent = profile.name;
            if (playerAvatarEl && profile.avatar) playerAvatarEl.src = profile.avatar;
        });
    } else {
        if (playerNameEl && typeof CONFIG !== "undefined" && CONFIG.defaultPlayer) {
            playerNameEl.textContent = CONFIG.defaultPlayer.name || "Oyuncu";
        }
    }
}

/* --------------------------------------------------------------------------
   2. KURUCU BİLGİSİ
   -------------------------------------------------------------------------- */
function initFounderInfo() {
    if (typeof CONFIG === "undefined" || !CONFIG.founders || !CONFIG.founders[0]) return;

    const firstFounder = CONFIG.founders[0];
    const founderNameEl = document.getElementById("founder-name");
    const founderRankEl = document.getElementById("founder-rank");
    const founderAvatarEl = document.getElementById("founder-avatar");

    if (founderNameEl) founderNameEl.textContent = firstFounder.name || "SifKox";
    if (founderRankEl) founderRankEl.textContent = firstFounder.rank || "Kurucu";

    if (firstFounder.steamid) {
        fetchSteamProfile(firstFounder.steamid, (profile) => {
            if (profile.name && profile.name !== "Garry's Mod Player" && founderNameEl) {
                founderNameEl.textContent = profile.name;
            }
            if (profile.avatar && founderAvatarEl) {
                founderAvatarEl.src = profile.avatar;
            }
        });
    }
}

/* --------------------------------------------------------------------------
   3. STEAM PROFİL ÇEKİCİ (CORS & XML YEDEK)
   -------------------------------------------------------------------------- */
function fetchSteamProfile(steam64id, callback) {
    const xmlUrl = `https://corsproxy.io/?https://steamcommunity.com/profiles/${steam64id}?xml=1`;

    fetch(xmlUrl)
        .then(res => res.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            const name = data.querySelector("steamID") ? data.querySelector("steamID").textContent : null;
            const avatar = data.querySelector("avatarFull") ? data.querySelector("avatarFull").textContent : null;
            callback({ name, avatar });
        })
        .catch(() => {
            callback({
                name: "Garry's Mod Player",
                avatar: "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg"
            });
        });
}

/* --------------------------------------------------------------------------
   4. MESAJ ROTATÖRÜ
   -------------------------------------------------------------------------- */
function initMessageRotator() {
    const msgEl = document.getElementById("rotating-message");
    if (!msgEl || typeof CONFIG === "undefined" || !CONFIG.messages || CONFIG.messages.length === 0) return;

    let index = 0;
    msgEl.textContent = CONFIG.messages[0];

    setInterval(() => {
        msgEl.classList.remove("fade-in");
        msgEl.classList.add("fade-out");

        setTimeout(() => {
            index = (index + 1) % CONFIG.messages.length;
            msgEl.textContent = CONFIG.messages[index];
            msgEl.classList.remove("fade-out");
            msgEl.classList.add("fade-in");
        }, 400);

    }, CONFIG.messageInterval || 5000);
}

/* --------------------------------------------------------------------------
   5. MÜZİK ÇALAR VE OTOMATİK OYNATMA (AUTOPLAY FİX)
   -------------------------------------------------------------------------- */
function initAudioPlayer() {
    if (typeof CONFIG === "undefined" || !CONFIG.music || !CONFIG.music.enabled) return;
    if (!CONFIG.music.playlist || CONFIG.music.playlist.length === 0) return;

    const audioEl = document.getElementById("bg-audio");
    if (!audioEl) return;

    const isShuffle = CONFIG.music.shuffle !== false;
    let currentTrackIndex = isShuffle 
        ? Math.floor(Math.random() * CONFIG.music.playlist.length) 
        : 0;

    function loadTrack(index) {
        const track = CONFIG.music.playlist[index];
        if (!track) return;
        audioEl.src = track.src;
        audioEl.volume = CONFIG.music.defaultVolume || 0.3;
    }

    loadTrack(currentTrackIndex);

    // Otomatik çalmayı dener
    const playPromise = audioEl.play();

    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay engellendi, etkileşim bekleniyor:", error);
            
            // Kullanıcı ekrana ilk tıkladığında veya tuşa bastığında çal
            function enableAudioOnInteraction() {
                audioEl.play().then(() => {
                    document.removeEventListener("click", enableAudioOnInteraction);
                    document.removeEventListener("keydown", enableAudioOnInteraction);
                    document.removeEventListener("mousemove", enableAudioOnInteraction);
                }).catch(e => console.log("Audio play error:", e));
            }

            document.addEventListener("click", enableAudioOnInteraction);
            document.addEventListener("keydown", enableAudioOnInteraction);
            document.addEventListener("mousemove", enableAudioOnInteraction);
        });
    }

    // Şarkı bittiğinde sıradakine geç
    audioEl.addEventListener("ended", () => {
        if (isShuffle && CONFIG.music.playlist.length > 1) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * CONFIG.music.playlist.length);
            } while (nextIndex === currentTrackIndex);
            currentTrackIndex = nextIndex;
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % CONFIG.music.playlist.length;
        }
        loadTrack(currentTrackIndex);
        audioEl.play();
    });
}

/* --------------------------------------------------------------------------
   6. GMOD ENGINE HOOKS (YÜKLEME % TAKİBİ)
   -------------------------------------------------------------------------- */
let totalFilesNeeded = 0;
let filesRemaining = 0;

function updatePercentage(val) {
    val = Math.min(100, Math.max(0, Math.round(val)));
    const percEl = document.getElementById("percentage-val");
    if (percEl) percEl.textContent = `${val}%`;
}

function initGModHooks() {
    window.DownloadingFile = function(fileName) {
        if (totalFilesNeeded > 0) {
            filesRemaining = Math.max(0, filesRemaining - 1);
            const downloaded = totalFilesNeeded - filesRemaining;
            const perc = (downloaded / totalFilesNeeded) * 100;
            updatePercentage(perc);
        }
    };

    window.SetStatusChanged = function(status) {
        if (status.includes("Workshop") || status.includes("Mounting")) {
            updatePercentage(85);
        } else if (status.includes("Client info sent") || status.includes("Lua Started")) {
            updatePercentage(100);
        }
    };

    window.SetFilesNeeded = function(needed) {
        totalFilesNeeded = needed;
        filesRemaining = needed;
    };

    window.SetFilesTotal = function(total) {
        totalFilesNeeded = total;
        filesRemaining = total;
    };

    // Test Simülasyonu (Tarayıcıda %20 gösterir)
    if (!window.gmod) {
        runBrowserDemo();
    }
}

function runBrowserDemo() {
    let currentPerc = 0;
    const interval = setInterval(() => {
        currentPerc += 2;
        if (currentPerc >= 20) {
            currentPerc = 20; // Resimdeki gibi %20'de durur
            clearInterval(interval);
        }
        updatePercentage(currentPerc);
    }, 100);
}
