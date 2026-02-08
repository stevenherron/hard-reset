import React, { useState } from 'react';
import { audioController } from '../logic/AudioController';


export default function SetupScreen({ initialSettings, onStart }) {
    const [formData, setFormData] = useState(initialSettings);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'roundDuration' || name === 'restDuration' || name === 'bpm' ? Number(value) : value
        }));
    };

    return (
        <div className="screen setup-screen">
            <div className="header-section">
                <h1 className="app-title">PRO TRAINER</h1>
                <div className="app-subtitle">HARD RESET</div>
            </div>

            <div className="settings-container">
                <section className="setting-row">
                    <label>Sport</label>
                    <div className="toggle-group sm">
                        {['Boxing', 'Kickboxing', 'Muay Thai'].map(s => (
                            <button key={s} className={formData.sport === s ? 'active' : ''} onClick={() => {
                                audioController.init();
                                setFormData({ ...formData, sport: s });
                            }}>{s}</button>
                        ))}
                    </div>
                </section>

                <section className="setting-row">
                    <label>Difficulty</label>
                    <div className="toggle-group sm">
                        {['Easy', 'Medium', 'Pro'].map(l => (
                            <button key={l} className={formData.level === l ? 'active' : ''} onClick={() => {
                                audioController.init();
                                setFormData({ ...formData, level: l });
                            }}>{l}</button>
                        ))}
                    </div>
                </section>

                <div className="settings-grid">
                    <div className="grid-item">
                        <label>Rounds</label>
                        <div className="toggle-group xs">
                            {[120, 180, 300].map(sec => (
                                <button key={sec} className={formData.roundDuration === sec ? 'active' : ''} onClick={() => setFormData({ ...formData, roundDuration: sec })}>
                                    {sec / 60}m
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid-item">
                        <label>Rest</label>
                        <div className="toggle-group xs">
                            {[30, 60].map(sec => (
                                <button key={sec} className={formData.restDuration === sec ? 'active' : ''} onClick={() => setFormData({ ...formData, restDuration: sec })}>
                                    {sec}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sliders-compact">
                    <div className="slider-row">
                        <label>Reset (Beeps): <span className="val">{formData.resetLength || 4}</span></label>
                        <input type="range" min="1" max="4" step="1" value={formData.resetLength || 4} onChange={(e) => setFormData({ ...formData, resetLength: Number(e.target.value) })} />
                    </div>

                    <div className="slider-row">
                        <label>Reps: <span className="val">{formData.repetitionCount === 'Infinity' ? '∞' : formData.repetitionCount}</span></label>
                        <input type="range" min="0" max="7" step="1"
                            value={formData.repetitionCount === 'Infinity' ? 7 : formData.repetitionCount === 1 ? 0 : (formData.repetitionCount / 5)}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                const map = [1, 5, 10, 15, 20, 25, 30, 'Infinity'];
                                setFormData({ ...formData, repetitionCount: map[val] });
                            }}
                        />
                    </div>

                    <div className="slider-row">
                        <label>BPM: <span className="val">{formData.bpm}</span></label>
                        <input type="range" min="60" max="180" step="5" value={formData.bpm} onChange={handleChange} name="bpm" />
                    </div>
                </div>
            </div>

            <button className="start-btn" onClick={() => onStart(formData)}>
                START TRAINING
            </button>

            <style>{`
                /* Compact Layout Styles */
                .header-section { margin-bottom: 15px; text-align: center; animation: fadeInUp 0.5s ease-out; }
                .app-title { font-size: 2.2rem; font-weight: 900; color: #fff; line-height: 1; font-style: italic; letter-spacing: -1px; }
                .app-subtitle { color: var(--color-primary); font-size: 0.8rem; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin-top: 4px; }
                
                .settings-container {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .setting-row label { margin-top: 0; margin-bottom: 10px; display: block; border-bottom: 1px solid #222; padding-bottom: 4px; }
                .toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
                .toggle-group button { 
                    padding: 12px 16px; 
                    font-size: 0.9rem; 
                    background: #111; 
                    color: #777; 
                    border-radius: var(--border-radius); 
                    box-shadow: none; 
                    border: 1px solid #222;
                    flex: 1;
                    min-width: 80px;
                }
                .toggle-group button.active { 
                    background: var(--color-primary); 
                    color: #000; 
                    border-color: var(--color-primary);
                    box-shadow: 0 0 15px var(--color-primary-glow); 
                }
                
                .settings-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 15px; 
                    margin-bottom: 0px; 
                    background: rgba(255,255,255,0.03); 
                    padding: 12px; 
                    border-radius: var(--border-radius); 
                }
                .grid-item { display: flex; flex-direction: column; }
                .grid-item label { 
                    font-size: 0.75rem; 
                    color: var(--color-text-dim); 
                    margin-bottom: 10px; 
                    border-bottom: 1px solid #333; 
                    padding-bottom: 4px; 
                    display: block;
                    width: 100%;
                }
                
                /* Extra small toggles */
                .toggle-group.xs button { 
                    padding: 12px 8px; 
                    font-size: 0.95rem; 
                    font-weight: 800; 
                    min-width: 60px;
                }

                .sliders-compact { 
                    background: rgba(255,255,255,0.03); 
                    padding: 15px; 
                    border-radius: var(--border-radius); 
                    display: flex; 
                    flex-direction: column; 
                    gap: 12px; 
                }
                .slider-row label { 
                    margin: 0 0 12px 0; 
                    display: flex; 
                    justify-content: space-between; 
                    font-size: 0.85rem; 
                    border-bottom: none; 
                    padding-bottom: 0; 
                    color: var(--color-text-dim);
                }

                .start-btn { 
                    margin-top: 20px; 
                    padding: 20px; 
                    font-size: 1.25rem; 
                    letter-spacing: 2px;
                    width: 100%; 
                    box-shadow: 0 4px 25px var(--color-primary-glow); 
                }
                
                label { color: #888; font-size: 0.8em; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; }
                .val { color: #fff; font-weight: 900; }
            `}</style>
        </div >
    );
}
