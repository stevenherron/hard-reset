import React, { useEffect, useState } from 'react';
import { useRhythmEngine } from '../logic/useRhythmEngine';
import { MOVES } from '../data/moves';


export default function TrainingScreen({ settings, onFinish }) {
    const engine = useRhythmEngine();
    const [flash, setFlash] = useState(false);

    // Initialize engine on mount
    useEffect(() => {
        engine.setSettings(settings);
        engine.startTraining();
        return () => {
            engine.stopTraining();
        };
        // eslint-disable-next-line
    }, []);

    // Flash effect on beat
    useEffect(() => {
        if (engine.currentActionIndex >= 0) {
            setFlash(true);
            const t = setTimeout(() => setFlash(false), 100);
            return () => clearTimeout(t);
        }
    }, [engine.currentActionIndex]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentMoveId = engine.currentCombo?.sequence[engine.currentActionIndex];
    const currentMoveName = MOVES[currentMoveId]?.name || currentMoveId;

    // Calculate progress through combo for display
    const comboPreview = engine.currentCombo?.sequence.map((mid, idx) => {
        const mName = MOVES[mid]?.name || mid;
        const isActive = idx === engine.currentActionIndex;
        const isPast = idx < engine.currentActionIndex;
        return (
            <span
                key={idx}
                className={`combo-move ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                style={{
                    transform: isActive ? 'scale(1.2)' : 'scale(1)',
                    opacity: isActive ? 1 : isPast ? 0.3 : 0.6,
                    color: isActive ? 'var(--color-primary)' : 'inherit',
                    fontWeight: isActive ? '800' : '600',
                }}
            >
                {mName}
                {idx < engine.currentCombo.sequence.length - 1 && <span className="separator"> - </span>}
            </span>
        );
    });

    return (
        <div className="screen training-screen">
            <div className="info-bar">
                <span>R {engine.currentRound}</span>
                <span>{settings.sport} - {settings.level}</span>
            </div>

            <div className={`visual-beat ${flash ? 'flash' : ''}`} />

            <div className="main-content">
                {engine.status === 'PREP' && <div className="giant-text">GET READY</div>}
                {engine.status === 'ROUND_REST' && <div className="giant-text">REST</div>}

                {engine.status === 'ROUND_ACTIVE' && (
                    <div className="combo-display">
                        {engine.currentCombo ? (
                            <>
                                <div className="combo-meta">
                                    {settings.repetitionCount === 'Infinity' ? (
                                        <div className="rep-dot infinite">∞</div>
                                    ) : (
                                        Array.from({ length: engine.repsLeft }).map((_, i) => (
                                            <div key={i} className="rep-dot" />
                                        ))
                                    )}
                                </div>
                                <div className="combo-sequence" style={{ opacity: engine.subStatus === 'EXECUTING' ? 1 : 0.5 }}>
                                    {comboPreview}
                                </div>
                                <div className="current-move-large">
                                    {currentMoveName || "..."}
                                </div>
                            </>
                        ) : <div className="giant-text">...</div>}
                    </div>
                )}
            </div>

            {/* Fixed Height Footer for Status Messages */}
            <div className="status-footer">
                {engine.status === 'ROUND_ACTIVE' && (
                    <>
                        {engine.subStatus === 'RESET' && (
                            <div className="phase-content reset">
                                <div className="giant-text small">RESET</div>
                                <div className="beat-dots">
                                    {Array.from({ length: settings.resetLength || 4 }, (_, i) => i + 1).map(n => (
                                        <div key={n} className={`dot ${engine.beatCount >= n ? 'active' : ''}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {engine.subStatus === 'COUNT_IN' && (
                            <div className="phase-content count-in">
                                <div className="giant-text small">GET READY</div>
                                <div className="beat-dots red">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className={`dot ${engine.beatCount >= n ? 'active' : ''}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {engine.subStatus === 'ANNOUNCING' && (
                            <div className="phase-content">
                                <div className="giant-text small">LISTEN</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="timer-display">
                {formatTime(engine.roundTimeLeft)}
            </div>

            <div className="controls">
                <button className="stop-btn" onClick={() => {
                    engine.stopTraining();
                    onFinish(engine.getStats());
                }}>END WORKOUT</button>
            </div>

            <style>{`
                .training-screen {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 15px;
                    box-sizing: border-box;
                    background: var(--color-bg);
                    overflow: hidden;
                    position: relative;
                }
                .info-bar {
                    display: flex;
                    justify-content: space-between;
                    color: var(--color-text-dim);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    height: 35px;
                    padding-bottom: 8px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    border-bottom: 1px solid #222;
                }
                .visual-beat {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle, var(--color-primary-glow) 0%, rgba(0,0,0,0) 70%);
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.05s ease-out;
                    z-index: 0;
                }
                .visual-beat.flash { opacity: 1; }
                
                .main-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                    padding: 20px 0;
                }
                
                .status-footer {
                    min-height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                    margin-bottom: 10px;
                }

                .giant-text {
                    font-size: 3.5rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    color: var(--color-primary);
                    text-shadow: 0 0 30px var(--color-primary-glow);
                    text-align: center;
                    line-height: 1.1;
                }
                .giant-text.small {
                    font-size: 2.5rem;
                }

                .combo-display {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    text-align: center;
                }

                .combo-sequence {
                    margin-bottom: 2rem;
                    font-size: 1.4rem;
                    color: var(--color-text-dim);
                    text-align: center;
                    width: 100%;
                    white-space: nowrap;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    min-height: 40px;
                }
                .combo-move {
                    display: inline-block;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-origin: center;
                }
                .combo-move.active {
                    color: var(--color-primary);
                    text-shadow: 0 0 10px var(--color-primary-glow);
                }
                .separator {
                    margin-left: 12px;
                    opacity: 0.3;
                    font-weight: normal;
                }
                .current-move-large {
                    font-size: 3.5rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    color: #fff;
                    line-height: 1;
                    text-align: center;
                    animation: pop 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-shadow: 0 0 20px rgba(255,0,0,0.6);
                    width: 100%;
                }
                
                .beat-dots {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    margin-top: 0.8rem;
                }
                .dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 2px solid #333;
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .reset .dot.active {
                    background-color: #777;
                    border-color: #777;
                    transform: scale(1.2);
                }
                .count-in .dot { border-color: var(--color-primary-dim); }
                .count-in .dot.active {
                    background-color: var(--color-primary);
                    border-color: var(--color-primary);
                    box-shadow: 0 0 25px var(--color-primary);
                    transform: scale(1.4);
                }

                .timer-display {
                    font-size: 4rem;
                    font-weight: 800;
                    font-variant-numeric: tabular-nums;
                    text-align: center;
                    margin-bottom: 15px;
                    color: var(--color-text);
                    opacity: 0.8;
                }
                
                .combo-meta {
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    min-height: 15px;
                }
                .rep-dot {
                    width: 12px;
                    height: 12px;
                    background-color: var(--color-primary);
                    border-radius: 50%;
                    box-shadow: 0 0 10px var(--color-primary-glow);
                }
                .rep-dot.infinite {
                    color: var(--color-primary);
                    font-size: 1.8rem;
                    line-height: 0.5;
                }
                .stop-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid #333;
                    color: var(--color-text-muted);
                    width: 100%;
                    padding: 18px;
                    border-radius: var(--border-radius);
                    font-size: 1rem;
                    letter-spacing: 2px;
                    transition: all 0.3s;
                }
                .stop-btn:active {
                    background: rgba(255,0,0,0.1);
                    border-color: var(--color-primary-dim);
                    color: var(--color-primary);
                }
            `}</style>
        </div>
    );
}
