import React, { useState } from 'react';
import SetupScreen from './SetupScreen';
import TrainingScreen from './TrainingScreen';
import SummaryScreen from './SummaryScreen';
import '../styles/index.css';

function App() {
    const [screen, setScreen] = useState('setup'); // setup, training, summary
    const [settings, setSettings] = useState({
        sport: 'Boxing',
        level: 'Easy',
        roundDuration: 120, // 2 mins
        restDuration: 60,
        bpm: 110,
        resetLength: 2,
        repetitionCount: 5
    });
    const [sessionStats, setSessionStats] = useState(null);

    const startTraining = (newSettings) => {
        setSettings(newSettings);
        setScreen('training');
    };

    const finishTraining = (stats) => {
        setSessionStats(stats);
        setScreen('summary');
    };

    const goHome = () => {
        setScreen('setup');
    };

    return (
        <div className="app-container">
            {screen === 'setup' && (
                <SetupScreen
                    initialSettings={settings}
                    onStart={startTraining}
                />
            )}
            {screen === 'training' && (
                <TrainingScreen
                    settings={settings}
                    onFinish={finishTraining}
                />
            )}
            {screen === 'summary' && (
                <SummaryScreen
                    stats={sessionStats}
                    onRestart={goHome}
                />
            )}
        </div>
    );
}

export default App;
