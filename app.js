/* ==========================================================================
   GLOBLA DARKRP COMMUNITY - LOADING SCREEN CORE LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initServerInfo();
    initPlayerInfo();
    initFounderInfo();
    initMessageRotator();
    initAudioPlayer();
    initLinks();
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
   2. KURUCU BİLGİSİ (TÜM KURUCULARI DİNAMİK LİSTELEME)
   -------------------------------------------------------------------------- */
function initFounderInfo() {
    if (typeof CONFIG === "undefined" || !CONFIG.founders || CONFIG.founders.length === 0) return;

    const leftCapsule = document.getElementById("left-capsule");
    if (!leftCapsule) return;

    leftCapsule.innerHTML = ""; // Mevcut içeriği temizle

    CONFIG.founders.forEach((founder, idx) => {
        const founderItem = document.createElement("div");
        founderItem.className = "founder-item";

        const defaultAvatar = founder.avatar || "https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";

        founderItem.innerHTML = `
            <img class="founder-avatar" id="founder-avatar-${idx}" src="${defaultAvatar}" alt="${founder.name || 'Kurucu'}">
            <span class="founder-name" id="founder-name-${idx}">${founder.name || 'Kurucu'}</span>
            <span class="founder-rank" id="founder-rank-${idx}">${founder.rank || 'Kurucu'}</span>
        `;

        leftCapsule.appendChild(founderItem);

        if (founder.steamid) {
            fetchSteamProfile(founder.steamid, (profile) => {
                const nameEl = document.getElementById(`founder-name-${idx}`);
                const avatarEl = document.getElementById(`founder-avatar-${idx}`);
                if (profile.name && profile.name !== "Garry's Mod Player" && nameEl) {
                    nameEl.textContent = profile.name;
                }
                if (profile.avatar && avatarEl) {
                    avatarEl.src = profile.avatar;
                }
            });
        }
    });
}

function initLinks() {
    if (typeof CONFIG === "undefined" || !CONFIG.links) return;

    const discordBtn = document.getElementById("btn-discord");
    const steamBtn = document.getElementById("btn-steam");

    if (discordBtn && CONFIG.links.discord) {
        discordBtn.href = CONFIG.links.discord;
    }
    if (steamBtn && CONFIG.links.steamGroup) {
        steamBtn.href = CONFIG.links.steamGroup;
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

    const controlWrapper = document.getElementById("music-control-wrapper");
    const toggleBtn = document.getElementById("music-toggle-btn");
    const iconPlaying = document.getElementById("icon-playing");
    const iconMuted = document.getElementById("icon-muted");
    const trackNameEl = document.getElementById("music-track-name");
    const equalizerEl = document.getElementById("music-equalizer");

    const isShuffle = CONFIG.music.shuffle !== false;
    let currentTrackIndex = isShuffle 
        ? Math.floor(Math.random() * CONFIG.music.playlist.length) 
        : 0;

    let isMuted = false;
    const defaultVol = (CONFIG.music && typeof CONFIG.music.defaultVolume === "number") ? CONFIG.music.defaultVolume : 0.3;

    function updateTrackUI() {
        const track = CONFIG.music.playlist[currentTrackIndex];
        if (track && trackNameEl) {
            const titleStr = track.artist ? `${track.artist} - ${track.title}` : track.title;
            trackNameEl.textContent = titleStr;
        }
    }

    function updateAudioStateUI() {
        const isMutedOrPaused = isMuted || audioEl.paused || audioEl.muted || audioEl.volume === 0;
        
        if (toggleBtn) {
            if (isMutedOrPaused) {
                toggleBtn.classList.add("is-muted");
                toggleBtn.title = "Müziği Aç";
                if (iconPlaying) iconPlaying.classList.add("hidden");
                if (iconMuted) iconMuted.classList.remove("hidden");
            } else {
                toggleBtn.classList.remove("is-muted");
                toggleBtn.title = "Müziği Kapat";
                if (iconPlaying) iconPlaying.classList.remove("hidden");
                if (iconMuted) iconMuted.classList.add("hidden");
            }
        }

        if (equalizerEl) {
            if (isMutedOrPaused) {
                equalizerEl.classList.add("is-muted");
            } else {
                equalizerEl.classList.remove("is-muted");
            }
        }
    }

    function loadTrack(index) {
        const track = CONFIG.music.playlist[index];
        if (!track) return;
        audioEl.src = track.src;
        audioEl.volume = isMuted ? 0 : defaultVol;
        audioEl.muted = isMuted;
        updateTrackUI();
    }

    function toggleAudioState(e) {
        if (e) {
            e.stopPropagation();
        }

        const isCurrentlyMutedOrPaused = isMuted || audioEl.paused || audioEl.muted || audioEl.volume === 0;

        if (isCurrentlyMutedOrPaused) {
            isMuted = false;
            audioEl.muted = false;
            audioEl.volume = defaultVol;
            if (audioEl.paused) {
                audioEl.play().catch(err => console.log("Audio play failed:", err));
            }
        } else {
            isMuted = true;
            audioEl.pause();
            audioEl.volume = 0;
            audioEl.muted = true;
        }
        updateAudioStateUI();
    }

    loadTrack(currentTrackIndex);

    // Buton ve kontrol kapsülünün tamamına tıklama olayı
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleAudioState);
    }
    if (controlWrapper) {
        controlWrapper.addEventListener("click", (e) => {
            if (e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
                toggleAudioState(e);
            }
        });
    }

    // Otomatik çalmayı dener
    const playPromise = audioEl.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            updateAudioStateUI();
        }).catch(error => {
            console.log("Autoplay engellendi, etkileşim bekleniyor:", error);
            updateAudioStateUI();
            
            function enableAudioOnInteraction(e) {
                if (isMuted) return;
                audioEl.play().then(() => {
                    updateAudioStateUI();
                }).catch(e => console.log("Audio play error:", e));
                document.removeEventListener("click", enableAudioOnInteraction);
                document.removeEventListener("keydown", enableAudioOnInteraction);
            }

            document.addEventListener("click", enableAudioOnInteraction);
            document.addEventListener("keydown", enableAudioOnInteraction);
        });
    }

    audioEl.addEventListener("play", updateAudioStateUI);
    audioEl.addEventListener("pause", updateAudioStateUI);

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
        if (!isMuted) {
            audioEl.play().catch(e => console.log(e));
        }
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
    const statusEl = document.getElementById("status-text");
    const fileEl = document.getElementById("download-file-name");

    window.DownloadingFile = function(fileName) {
        if (fileEl && fileName) {
            let displayName = fileName;
            if (displayName.length > 55) {
                displayName = "..." + displayName.substring(displayName.length - 52);
            }
            fileEl.textContent = displayName;
        }

        if (totalFilesNeeded > 0) {
            filesRemaining = Math.max(0, filesRemaining - 1);
            const downloaded = totalFilesNeeded - filesRemaining;
            const perc = (downloaded / totalFilesNeeded) * 100;
            updatePercentage(perc);
        }
    };

    window.SetStatusChanged = function(status) {
        if (statusEl && status) {
            statusEl.textContent = status;
        }

        if (status.includes("Workshop") || status.includes("Mounting")) {
            updatePercentage(85);
        } else if (status.includes("Client info sent") || status.includes("Lua Started")) {
            updatePercentage(100);
            if (fileEl) fileEl.textContent = "Yükleme tamamlandı, oyuna giriliyor...";
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

    // Test Simülasyonu (Tarayıcıda test için)
    if (!window.gmod) {
        runBrowserDemo();
    }
}

function runBrowserDemo() {
    let currentPerc = 0;
    const demoFiles = [
        "maps/rp_downtown_v4.bsp",
        "models/player/police_01.mdl",
        "materials/models/weapons/v_models/ak47.vmt",
        "sound/weapons/m4a1/m4a1_single.wav",
        "workshop/content/4000/284091240.gma"
    ];
    let fileIdx = 0;

    const fileEl = document.getElementById("download-file-name");
    const statusEl = document.getElementById("status-text");

    if (statusEl) statusEl.textContent = "Sunucu dosyaları indiriliyor...";

    const interval = setInterval(() => {
        currentPerc += 2;
        if (demoFiles[fileIdx] && fileEl) {
            fileEl.textContent = demoFiles[fileIdx];
        }
        if (currentPerc % 4 === 0) {
            fileIdx = (fileIdx + 1) % demoFiles.length;
        }
        if (currentPerc >= 20) {
            currentPerc = 20;
            clearInterval(interval);
            if (fileEl) fileEl.textContent = "workshop/content/4000/284091240.gma";
        }
        updatePercentage(currentPerc);
    }, 150);
}
