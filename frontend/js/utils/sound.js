// ===============================
// SOUND MANAGER
// ===============================

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.musicVolume = 0.3;

        // Check if sound is enabled in localStorage
        const savedEnabled = localStorage.getItem('sound_enabled');
        if (savedEnabled !== null) {
            this.enabled = savedEnabled === 'true';
        }

        const savedVolume = localStorage.getItem('sound_volume');
        if (savedVolume !== null) {
            this.volume = parseFloat(savedVolume);
        }
    }

    // Load a sound
    load(name, path, isMusic = false) {
        const audio = new Audio(path);
        audio.volume = isMusic ? this.musicVolume : this.volume;
        audio.preload = 'auto';

        this.sounds[name] = {
            audio: audio,
            isMusic: isMusic,
        };

        // Handle loading errors gracefully
        audio.addEventListener('error', () => {
            console.warn(`Failed to load sound: ${name} from ${path}`);
        });

        return this;
    }

    // Play a sound
    play(name, loop = false) {
        if (!this.enabled || !this.sounds[name]) {
            return;
        }

        const sound = this.sounds[name];

        try {
            // Reset to beginning if already playing
            sound.audio.currentTime = 0;
            sound.audio.loop = loop;

            // Play the sound
            const playPromise = sound.audio.play();

            // Handle autoplay restrictions
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Audio playback failed for ${name}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound ${name}:`, error);
        }
    }

    // Stop a sound
    stop(name) {
        if (!this.sounds[name]) {
            return;
        }

        const sound = this.sounds[name];
        sound.audio.pause();
        sound.audio.currentTime = 0;
    }

    // Pause a sound
    pause(name) {
        if (!this.sounds[name]) {
            return;
        }

        this.sounds[name].audio.pause();
    }

    // Resume a sound
    resume(name) {
        if (!this.enabled || !this.sounds[name]) {
            return;
        }

        this.sounds[name].audio.play().catch(error => {
            console.warn(`Error resuming sound ${name}:`, error);
        });
    }

    // Set volume for all sounds
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sound_volume', this.volume.toString());

        // Update volume for all non-music sounds
        for (const name in this.sounds) {
            if (!this.sounds[name].isMusic) {
                this.sounds[name].audio.volume = this.volume;
            }
        }
    }

    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));

        // Update volume for all music
        for (const name in this.sounds) {
            if (this.sounds[name].isMusic) {
                this.sounds[name].audio.volume = this.musicVolume;
            }
        }
    }

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled.toString());

        // Stop all sounds if disabled
        if (!this.enabled) {
            for (const name in this.sounds) {
                this.stop(name);
            }
        }

        return this.enabled;
    }

    // Enable sound
    enable() {
        this.enabled = true;
        localStorage.setItem('sound_enabled', 'true');
    }

    // Disable sound
    disable() {
        this.enabled = false;
        localStorage.setItem('sound_enabled', 'false');

        // Stop all sounds
        for (const name in this.sounds) {
            this.stop(name);
        }
    }

    // Check if sound is enabled
    isEnabled() {
        return this.enabled;
    }

    // Preload all sounds
    preloadAll() {
        for (const name in this.sounds) {
            this.sounds[name].audio.load();
        }
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();

// ===============================
// LOAD GAME SOUNDS
// ===============================

// Note: These are placeholder paths. You'll need to add actual sound files
// or use the Web Audio API to generate simple sounds programmatically

// UI Sounds
soundManager.load('click', 'assets/sounds/click.mp3');
soundManager.load('hover', 'assets/sounds/hover.mp3');
soundManager.load('success', 'assets/sounds/success.mp3');
soundManager.load('error', 'assets/sounds/error.mp3');

// Game Sounds
soundManager.load('kick', 'assets/sounds/kick.mp3');
soundManager.load('hit', 'assets/sounds/hit.mp3');
soundManager.load('jump', 'assets/sounds/jump.mp3');
soundManager.load('land', 'assets/sounds/land.mp3');
soundManager.load('damage', 'assets/sounds/damage.mp3');
soundManager.load('victory', 'assets/sounds/victory.mp3');
soundManager.load('defeat', 'assets/sounds/defeat.mp3');

// Background Music
soundManager.load('menu_music', 'assets/sounds/menu-music.mp3', true);
soundManager.load('battle_music', 'assets/sounds/battle-music.mp3', true);

// ===============================
// SIMPLE BEEP GENERATOR (Fallback)
// ===============================

// If you don't have sound files, you can use this to generate simple beeps
class BeepGenerator {
    constructor() {
        this.audioContext = null;

        // Initialize on user interaction (required by browsers)
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    // Generate a simple beep
    beep(frequency = 440, duration = 100, volume = 0.3) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    // Preset sounds
    click() {
        this.beep(800, 50, 0.2);
    }

    success() {
        this.beep(600, 100, 0.3);
        setTimeout(() => this.beep(800, 100, 0.3), 100);
    }

    error() {
        this.beep(200, 200, 0.3);
    }

    kick() {
        this.beep(150, 100, 0.4);
    }

    hit() {
        this.beep(180, 80, 0.4);
    }
}

// Create beep generator as fallback
const beepGenerator = new BeepGenerator();

// ===============================
// HELPER FUNCTION
// ===============================

// Play sound with fallback to beep
function playSound(name) {
    // Try to play actual sound
    soundManager.play(name);

    // If sound files don't exist, use beep generator
    if (beepGenerator[name]) {
        setTimeout(() => beepGenerator[name](), 10);
    }
}
