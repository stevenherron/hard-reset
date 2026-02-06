import { useState, useEffect, useCallback } from 'react';
import { rhythmEngine, STATUS, SUB_STATUS } from './RhythmEngine';

export function useRhythmEngine() {
    const [engineState, setEngineState] = useState({
        status: STATUS.IDLE,
        subStatus: SUB_STATUS.WAITING_NEXT,
        roundTimeLeft: 0,
        currentRound: 1,
        currentCombo: null,
        currentActionIndex: -1,
        beatCount: 0,
        repsLeft: 0,
        combosCompleted: 0
    });

    const [settings, setSettings] = useState(rhythmEngine.settings);

    // Sync React setSettings with Engine
    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            rhythmEngine.setSettings(updated);
            return updated;
        });
    }, []);

    useEffect(() => {
        // Subscribe to engine state changes
        const unsubscribe = rhythmEngine.subscribe((state) => {
            setEngineState(state);
        });

        return unsubscribe;
    }, []);

    return {
        ...engineState,
        settings,
        setSettings: updateSettings,
        startTraining: () => rhythmEngine.startTraining(),
        stopTraining: () => rhythmEngine.stopTraining(),
        getStats: () => rhythmEngine.getStats()
    };
}
