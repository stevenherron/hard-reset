export class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.synth = window.speechSynthesis;
        this.volume = 0.5;
        this.voice = null;
    }

    init() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        // Try to load a good voice
        let voices = this.synth.getVoices();
        const findVoice = () => {
            voices = this.synth.getVoices();
            this.voice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Premium'))) || voices[0];
        };

        if (voices.length === 0) {
            this.synth.onvoiceschanged = findVoice;
        } else {
            findVoice();
        }

        // Prime the speech engine with a silent utterance (Mobile Requirement)
        const prime = new SpeechSynthesisUtterance('');
        prime.volume = 0;
        this.synth.speak(prime);
    }

    playTone(frequency = 440, duration = 0.1, type = 'sine') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playBeat(moveAudioType) {
        // Map audio tags (from moves.js) to sounds
        switch (moveAudioType) {
            case 'jab':
                this.playTone(800, 0.08, 'sine'); // High, sharp
                break;
            case 'cross':
                this.playTone(600, 0.1, 'triangle'); // Stronger, punchier
                break;
            case 'hook':
            case 'body hook':
                this.playTone(500, 0.12, 'square'); // Thudding
                break;
            case 'uppercut':
            case 'rear uppercut':
                this.playTone(450, 0.12, 'sawtooth'); // Aggressive
                break;

            case 'low kick':
                this.playTone(150, 0.2, 'square'); // Heavy thud
                break;
            case 'middle kick':
            case 'body kick':
            case 'switch kick':
                this.playTone(250, 0.2, 'square');
                break;
            case 'high kick':
                this.playTone(700, 0.15, 'sawtooth'); // Sharp impact
                break;
            case 'teep':
                this.playTone(300, 0.15, 'triangle');
                break;

            case 'knee':
            case 'switch knee':
            case 'flying knee':
                this.playTone(350, 0.1, 'sawtooth');
                break;

            case 'slip':
            case 'roll':
            case 'pull':
            case 'defense':
                // Whoosh simulation: Standard tone for now but maybe glissando later
                // High frequency triangle used for defense
                this.playTone(1200, 0.1, 'sine');
                break;
            case 'check':
            case 'block':
                this.playTone(200, 0.05, 'sawtooth'); // Short block sound
                break;

            default:
                // Fallback
                this.playTone(600, 0.1, 'sine');
                break;
        }
    }

    announceLastRep() {
        this.speak('Last One');
    }

    speak(text, interrupt = false) {
        if (interrupt && this.synth.speaking) {
            this.synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
            utterance.voice = this.voice;
        }
        utterance.rate = 1.2; // Slightly faster
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        this.synth.speak(utterance);
    }
}

export const audioController = new AudioController();
