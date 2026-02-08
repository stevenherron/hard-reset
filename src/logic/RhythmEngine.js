import { audioController } from './AudioController';
import { COMBOS } from '../data/combos';
import { MOVES } from '../data/moves';

export const STATUS = {
    IDLE: 'IDLE',
    PREP: 'PREP',
    ROUND_ACTIVE: 'ROUND_ACTIVE',
    ROUND_REST: 'ROUND_REST',
    FINISHED: 'FINISHED'
};

export const SUB_STATUS = {
    RESET: 'RESET',
    ANNOUNCING: 'ANNOUNCING',
    COUNT_IN: 'COUNT_IN',
    EXECUTING: 'EXECUTING',
    WAITING_NEXT: 'WAITING_NEXT'
};

export class RhythmEngine {
    constructor() {
        this.listeners = new Set();
        this.settings = {
            roundDuration: 180,
            restDuration: 60,
            bpm: 100,
            level: 'Easy',
            sport: 'Boxing',
            resetLength: 4,
            repetitionCount: 5
        };
        this.reset();
    }

    reset() {
        this.status = STATUS.IDLE;
        this.subStatus = SUB_STATUS.WAITING_NEXT;
        this.roundTimeLeft = 0;
        this.currentRound = 1;
        this.currentCombo = null;
        this.currentActionIndex = -1;
        this.beatCount = 0;

        // Internal State
        this.nextBeatTime = 0;
        this.actionQueue = [];
        this.remainingRepeats = 0;
        this.currentComboObj = null;
        this.resetBeatsLeft = 0;
        this.countInBeatsLeft = 0;
        this.fixedResetBPM = 60;
        this.sessionStartTime = 0;
        this.combosCompleted = 0;

        this.requestRef = null;
        this.timerRef = null;
    }

    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        const state = {
            status: this.status,
            subStatus: this.subStatus,
            roundTimeLeft: this.roundTimeLeft,
            currentRound: this.currentRound,
            currentCombo: this.currentCombo,
            currentActionIndex: this.currentActionIndex,
            beatCount: this.beatCount,
            repsLeft: this.remainingRepeats,
            combosCompleted: this.combosCompleted
        };
        this.listeners.forEach(l => l(state));
    }

    startTraining() {
        audioController.init();
        this.reset();
        this.status = STATUS.PREP;
        this.roundTimeLeft = 5;
        this.nextBeatTime = performance.now() + 1000;
        this.sessionStartTime = Date.now();

        this.startTimer();
        this.requestRef = requestAnimationFrame((t) => this.loop(t));
        this.notify();
    }

    stopTraining() {
        if (this.requestRef) cancelAnimationFrame(this.requestRef);
        if (this.timerRef) clearInterval(this.timerRef);
        this.status = STATUS.IDLE;
        this.notify();
    }

    startTimer() {
        this.timerRef = setInterval(() => {
            if (this.roundTimeLeft <= 1) {
                this.handlePhaseChange();
            } else {
                this.roundTimeLeft--;
                this.notify();
            }
        }, 1000);
    }

    handlePhaseChange() {
        if (this.status === STATUS.PREP) this.startRound();
        else if (this.status === STATUS.ROUND_ACTIVE) this.startRest();
        else if (this.status === STATUS.ROUND_REST) {
            this.currentRound++;
            this.startRound();
        }
    }

    pickCombo(excludeId = null) {
        let candidates = COMBOS.filter(c => c.sport === this.settings.sport && c.difficulty === this.settings.level);
        if (!candidates.length) return COMBOS[0];
        if (candidates.length > 1 && excludeId) {
            const filtered = candidates.filter(c => c.id !== excludeId);
            if (filtered.length > 0) candidates = filtered;
        }
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    startRound() {
        this.status = STATUS.ROUND_ACTIVE;
        this.roundTimeLeft = this.settings.roundDuration;
        audioController.playTone(660, 0.5);
        audioController.speak("Fight", true);

        this.remainingRepeats = 0;
        this.currentComboObj = null;

        const newCombo = this.pickCombo();
        this.currentComboObj = newCombo;
        const reps = this.settings.repetitionCount;
        this.remainingRepeats = reps === 'Infinity' ? 999999 : reps;
        this.currentCombo = newCombo;

        this.triggerAnnouncePhase(performance.now() + 1500, newCombo);
        this.notify();
    }

    startRest() {
        this.status = STATUS.ROUND_REST;
        this.subStatus = STATUS.ROUND_REST;
        this.roundTimeLeft = this.settings.restDuration;
        audioController.playTone(660, 0.5);
        audioController.speak("Rest", true);
        this.currentCombo = null;
        this.currentActionIndex = -1;
        this.notify();
    }

    loop(time) {
        if (this.status === STATUS.IDLE) return;
        if (this.status === STATUS.ROUND_ACTIVE) {
            this.handleRhythm(time);
        }
        this.requestRef = requestAnimationFrame((t) => this.loop(t));
    }

    triggerResetPhase(startTime) {
        this.subStatus = SUB_STATUS.RESET;
        this.resetBeatsLeft = this.settings.resetLength || 4;
        this.nextBeatTime = startTime;

        if (this.remainingRepeats === 2 && this.settings.repetitionCount !== 'Infinity') {
            audioController.announceLastRep();
        }

        this.currentActionIndex = -1;
        this.beatCount = 0;
        this.notify();
    }

    triggerAnnouncePhase(time, combo) {
        this.subStatus = SUB_STATUS.ANNOUNCING;
        const text = combo.sequence.map(id => MOVES[id]?.name || id).join(', ');
        audioController.speak(text);
        const speechDuration = 1000 + (text.length * 50);
        this.nextBeatTime = time + speechDuration;
        this.notify();
    }

    triggerCountInPhase(startTime) {
        this.subStatus = SUB_STATUS.COUNT_IN;
        this.countInBeatsLeft = 4;
        this.nextBeatTime = startTime;
        this.beatCount = 0;
        this.notify();
    }

    triggerExecutePhase(startTime, combo) {
        this.subStatus = SUB_STATUS.EXECUTING;
        this.actionQueue = [...combo.sequence];
        this.currentActionIndex = -1;
        this.nextBeatTime = startTime;
        this.beatCount = 0;
        this.notify();
    }

    handleRhythm(time) {
        if (time < this.nextBeatTime) return;

        if (this.subStatus === SUB_STATUS.RESET) {
            const beatDuration = 1000; // 1 beat per second
            if (this.resetBeatsLeft > 0) {
                audioController.playTone(300, 0.05, 'triangle');
                this.beatCount = (this.settings.resetLength + 1) - this.resetBeatsLeft;
                this.resetBeatsLeft--;
                this.nextBeatTime = time + beatDuration;
            } else {
                this.beatCount = 0;
                let shouldRepeat = this.settings.repetitionCount === 'Infinity' || this.remainingRepeats > 1;
                if (!shouldRepeat && this.settings.repetitionCount !== 'Infinity') {
                    // No more repeats
                } else if (this.settings.repetitionCount !== 'Infinity') {
                    this.remainingRepeats--;
                }

                if (shouldRepeat && this.currentComboObj) {
                    this.currentCombo = this.currentComboObj;
                    this.triggerExecutePhase(time, this.currentComboObj);
                } else {
                    const newCombo = this.pickCombo(this.currentComboObj?.id);
                    this.currentComboObj = newCombo;
                    const reps = this.settings.repetitionCount;
                    this.remainingRepeats = reps === 'Infinity' ? 999999 : reps;
                    this.currentCombo = newCombo;
                    this.triggerAnnouncePhase(time, newCombo);
                }
            }
            this.notify();
        } else if (this.subStatus === SUB_STATUS.ANNOUNCING) {
            this.triggerCountInPhase(time);
        } else if (this.subStatus === SUB_STATUS.COUNT_IN) {
            const beatDuration = (60 / this.settings.bpm) * 1000;
            if (this.countInBeatsLeft > 0) {
                audioController.playTone(800, 0.05, 'square');
                this.beatCount = 5 - this.countInBeatsLeft;
                this.countInBeatsLeft--;
                this.nextBeatTime = time + beatDuration;
            } else {
                this.beatCount = 0;
                this.triggerExecutePhase(time, this.currentComboObj);
            }
            this.notify();
        } else if (this.subStatus === SUB_STATUS.EXECUTING) {
            const beatDuration = (60 / this.settings.bpm) * 1000;
            this.currentActionIndex++;

            if (this.currentActionIndex >= this.actionQueue.length) {
                this.combosCompleted++;
                this.triggerResetPhase(time + beatDuration);
                return;
            }

            const moveId = this.actionQueue[this.currentActionIndex];
            const move = MOVES[moveId];
            audioController.playBeat(move?.audio || move?.type);
            this.nextBeatTime = time + (move?.beats || 1) * beatDuration;
            this.notify();
        }
    }

    getStats() {
        const durationSec = this.sessionStartTime ? Math.floor((Date.now() - this.sessionStartTime) / 1000) : 0;
        return {
            duration: durationSec,
            rounds: this.currentRound,
            combosCompleted: this.combosCompleted,
            sport: this.settings.sport,
            level: this.settings.level
        };
    }
}

// Singleton instances for easy access if needed, though we'll use a hook to manage it
export const rhythmEngine = new RhythmEngine();
