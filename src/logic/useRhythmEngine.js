import { useState, useEffect, useRef, useCallback } from 'react';
import { audioController } from './AudioController';
import { COMBOS } from '../data/combos';
import { MOVES } from '../data/moves';

const STATUS = {
    IDLE: 'IDLE',
    PREP: 'PREP',
    ROUND_ACTIVE: 'ROUND_ACTIVE',
    ROUND_REST: 'ROUND_REST',
    FINISHED: 'FINISHED'
};

const SUB_STATUS = {
    RESET: 'RESET',
    ANNOUNCING: 'ANNOUNCING',
    COUNT_IN: 'COUNT_IN',
    EXECUTING: 'EXECUTING',
    WAITING_NEXT: 'WAITING_NEXT'
};

export function useRhythmEngine() {
    // Settings state for UI
    const [settings, setSettings] = useState({
        roundDuration: 180,
        restDuration: 60,
        bpm: 100,
        level: 'Easy',
        sport: 'Boxing',
        resetLength: 4,     // Beeps
        repetitionCount: 5  // Reps
    });

    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    // State
    const [status, setStatus] = useState(STATUS.IDLE);
    const [subStatus, setSubStatus] = useState(SUB_STATUS.WAITING_NEXT);
    const [roundTimeLeft, setRoundTimeLeft] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentCombo, setCurrentCombo] = useState(null);
    const [currentActionIndex, setCurrentActionIndex] = useState(-1);
    // Visual beat counter for UI (0-4)
    const [beatCount, setBeatCount] = useState(0);

    // Internal Refs
    const stateRef = useRef({
        status: STATUS.IDLE,
        subStatus: SUB_STATUS.WAITING_NEXT,
        nextBeatTime: 0,
        comboQueue: [],
        actionQueue: [],
        remainingRepeats: 0,
        currentComboObj: null,
        resetBeatsLeft: 0,
        countInBeatsLeft: 0,
        fixedResetBPM: 60, // 1 beat per second for reset/stance
        // Stats
        sessionStartTime: 0,
        combosCompleted: 0
    });

    const requestRef = useRef(null);

    const startTraining = useCallback(() => {
        audioController.init();
        setStatus(STATUS.PREP);
        setRoundTimeLeft(5);
        stateRef.current.status = STATUS.PREP;
        stateRef.current.nextBeatTime = performance.now() + 1000;
        stateRef.current.status = STATUS.PREP;
        stateRef.current.nextBeatTime = performance.now() + 1000;
        stateRef.current.sessionStartTime = Date.now();
        stateRef.current.combosCompleted = 0;
        requestRef.current = requestAnimationFrame(loop);
    }, []);

    const stopTraining = useCallback(() => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setStatus(STATUS.IDLE);
        stateRef.current.status = STATUS.IDLE;
    }, []);

    const pickCombo = (sport, level, excludeId = null) => {
        let candidates = COMBOS.filter(c => c.sport === sport && c.difficulty === level);
        if (!candidates.length) return COMBOS[0];

        // If we have multiple candidates, try to exclude the last one
        if (candidates.length > 1 && excludeId) {
            const filtered = candidates.filter(c => c.id !== excludeId);
            if (filtered.length > 0) candidates = filtered;
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const loop = (time) => {
        const state = stateRef.current;
        if (state.status === STATUS.IDLE) return;
        // state.lastFrame = time; // Not used in new logic
        if (state.status === STATUS.ROUND_ACTIVE) {
            handleRhythm(time, state);
        }
        requestRef.current = requestAnimationFrame(loop);
    };

    // Timer Effect
    useEffect(() => {
        let timer;
        if (status === STATUS.PREP || status === STATUS.ROUND_ACTIVE || status === STATUS.ROUND_REST) {
            timer = setInterval(() => {
                setRoundTimeLeft(prev => {
                    if (prev <= 1) { handlePhaseChange(); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);

    const handlePhaseChange = () => {
        if (status === STATUS.PREP) startRound();
        else if (status === STATUS.ROUND_ACTIVE) startRest();
        else if (status === STATUS.ROUND_REST) {
            startRound();
            setCurrentRound(r => r + 1);
        }
    };

    const startRound = () => {
        setStatus(STATUS.ROUND_ACTIVE);
        stateRef.current.status = STATUS.ROUND_ACTIVE;
        setRoundTimeLeft(settingsRef.current.roundDuration);
        audioController.playTone(660, 0.5);
        audioController.speak("Fight");

        // Init Round State
        stateRef.current.remainingRepeats = 0;
        stateRef.current.currentComboObj = null;

        // START DIRECTLY WITH NEW COMBO (Skip initial reset phase)
        // No exclusion for first combo
        const newCombo = pickCombo(settingsRef.current.sport, settingsRef.current.level);
        stateRef.current.currentComboObj = newCombo;

        // Initialize repetitions based on settings
        const reps = settingsRef.current.repetitionCount;
        stateRef.current.remainingRepeats = reps === 'Infinity' ? 999999 : reps;

        setCurrentCombo(newCombo);

        // Wait 1s then Announce
        triggerAnnouncePhase(performance.now() + 1000, newCombo);
    };

    const startRest = () => {
        setStatus(STATUS.ROUND_REST);
        stateRef.current.status = STATUS.ROUND_REST;
        setRoundTimeLeft(settingsRef.current.restDuration);
        audioController.playTone(660, 0.5);
        audioController.speak("Rest");
        setCurrentCombo(null);
        setCurrentActionIndex(-1);
        setSubStatus(STATUS.ROUND_REST); // This is a bit of a hack, as ROUND_REST is a STATUS, not SUB_STATUS
    };

    const triggerResetPhase = (startTime) => {
        const state = stateRef.current;
        state.subStatus = SUB_STATUS.RESET;
        setSubStatus(SUB_STATUS.RESET);
        state.resetBeatsLeft = settingsRef.current.resetLength || 4; // Use Setting, with fallback
        state.nextBeatTime = startTime;

        // Announce Last Rep if applicable
        if (state.remainingRepeats === 2 && settingsRef.current.repetitionCount !== 'Infinity') {
            audioController.announceLastRep();
        }

        state.currentActionIndex = -1;
        setCurrentActionIndex(-1);
        setBeatCount(0);
    };

    const triggerAnnouncePhase = (time, combo) => {
        const state = stateRef.current;
        state.subStatus = SUB_STATUS.ANNOUNCING;
        setSubStatus(SUB_STATUS.ANNOUNCING);

        const text = combo.sequence.map(id => MOVES[id]?.name || id).join(', ');
        audioController.speak(text);

        // Estimate speech time + small buffer
        const speechDuration = 1000 + (text.length * 50);
        state.nextBeatTime = time + speechDuration; // Set nextBeatTime for when speech is done
    };

    const triggerCountInPhase = (startTime) => {
        const state = stateRef.current;
        state.subStatus = SUB_STATUS.COUNT_IN;
        setSubStatus(SUB_STATUS.COUNT_IN);
        state.countInBeatsLeft = 4;
        state.nextBeatTime = startTime;
        setBeatCount(0);
    };

    const triggerExecutePhase = (startTime, combo) => {
        const state = stateRef.current;
        state.subStatus = SUB_STATUS.EXECUTING;
        setSubStatus(SUB_STATUS.EXECUTING);
        // state.remainingRepeats--; // REMOVED: Decrementing is handled in handleRhythm check
        state.actionQueue = [...combo.sequence];
        state.currentActionIndex = -1;
        state.nextBeatTime = startTime;
        setBeatCount(0);
    };

    const handleRhythm = (time, state) => {
        if (time < state.nextBeatTime) return;

        // 1. RESET PHASE (Fixed BPM)
        if (state.subStatus === SUB_STATUS.RESET) {
            const beatDuration = (60 / state.fixedResetBPM) * 1000;

            if (state.resetBeatsLeft > 0) {
                // Play reset tick (Woodblock / low distinct sound)
                audioController.playTone(300, 0.05, 'triangle');
                setBeatCount((settingsRef.current.resetLength + 1) - state.resetBeatsLeft);
                state.resetBeatsLeft--;
                state.nextBeatTime = time + beatDuration;
            } else {
                // Reset Finished. Decision time.
                setBeatCount(0);

                // Check if we should repeat
                let shouldRepeat = false;
                if (settingsRef.current.repetitionCount === 'Infinity') {
                    shouldRepeat = true;
                } else {
                    if (state.remainingRepeats > 1) { // Check if we have more than 1 left (since we just finished one)
                        state.remainingRepeats--;
                        shouldRepeat = true;
                    }
                }

                if (shouldRepeat && state.currentComboObj) {
                    // YES: Go straight to Execute (Skip Count-In)
                    setCurrentCombo(state.currentComboObj);
                    triggerExecutePhase(time, state.currentComboObj);
                } else {
                    // NO: Pick new combo
                    const lastId = state.currentComboObj?.id;
                    const newCombo = pickCombo(settingsRef.current.sport, settingsRef.current.level, lastId);
                    state.currentComboObj = newCombo;

                    const reps = settingsRef.current.repetitionCount;
                    state.remainingRepeats = reps === 'Infinity' ? 999999 : reps;

                    setCurrentCombo(newCombo);

                    // Go to Announce -> CountIn -> Execute
                    triggerAnnouncePhase(time, newCombo);
                }
            }

            // 2. ANNOUNCING PHASE (Wait for speech)
        } else if (state.subStatus === SUB_STATUS.ANNOUNCING) {
            // Speech time is over, Move to Count In
            triggerCountInPhase(time);

            // 3. COUNT IN PHASE (Target BPM)
        } else if (state.subStatus === SUB_STATUS.COUNT_IN) {
            const currentBPM = settingsRef.current.bpm;
            const beatDuration = (60 / currentBPM) * 1000;

            if (state.countInBeatsLeft > 0) {
                // Play Count In Tick (High pitch, sharp)
                audioController.playTone(800, 0.05, 'square');
                setBeatCount(5 - state.countInBeatsLeft); // 1 2 3 4
                state.countInBeatsLeft--;
                state.nextBeatTime = time + beatDuration;
            } else {
                setBeatCount(0);
                // Start Execution
                triggerExecutePhase(time, state.currentComboObj);
            }

            // 4. EXECUTION PHASE (Target BPM)
        } else if (state.subStatus === SUB_STATUS.EXECUTING) {
            const currentBPM = settingsRef.current.bpm;
            const beatDuration = (60 / currentBPM) * 1000;

            // Check if we just started (index -1)
            // triggerExecutePhase sets index to -1.
            // But here we increment immediately?
            // If we increment immediately, we play index 0. Correct.

            state.currentActionIndex++;
            setCurrentActionIndex(state.currentActionIndex);

            if (state.currentActionIndex >= state.actionQueue.length) {
                // Finished Combo. Go to Reset.
                state.combosCompleted++;
                triggerResetPhase(time + beatDuration);
                return;
            }

            const moveId = state.actionQueue[state.currentActionIndex];
            const move = MOVES[moveId];

            // Play Move Sound
            audioController.playBeat(move?.audio || move?.type);

            // Next beat
            const moveDuration = (move?.beats || 1) * beatDuration;
            state.nextBeatTime = time + moveDuration;
        }
    };

    const getStats = () => {
        const state = stateRef.current;
        const durationSec = state.sessionStartTime ? Math.floor((Date.now() - state.sessionStartTime) / 1000) : 0;
        return {
            duration: durationSec,
            rounds: currentRound,
            combosCompleted: state.combosCompleted,
            sport: settings.sport,
            level: settings.level
        };
    };

    return {
        getStats, // Exposed
        status,
        subStatus, // Exposed
        roundTimeLeft,
        currentCombo,
        currentActionIndex,
        beatCount, // Exposed (1-4)
        currentRound,
        repsLeft: stateRef.current.remainingRepeats, // Exposed for UI
        startTraining,
        stopTraining,
        settings,
        setSettings
    };
}
