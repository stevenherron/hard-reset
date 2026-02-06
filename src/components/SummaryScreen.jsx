import React from 'react';

export default function SummaryScreen({ stats, onRestart }) {
    return (
        <div className="screen summary-screen flex-center">
            <h1 className="text-primary">WORKOUT COMPLETE</h1>
            <p>Great job.</p>
            {/* Stats placeholders */}
            <div className="stats-grid">
                <div className="stat-box">
                    <span className="label">ROUNDS</span>
                    <span className="value">{stats?.rounds || 0}</span>
                </div>
                <div className="stat-box">
                    <span className="label">COMBOS</span>
                    <span className="value">{stats?.combosCompleted || 0}</span>
                </div>
                <div className="stat-box">
                    <span className="label">TIME</span>
                    <span className="value">
                        {Math.floor((stats?.duration || 0) / 60)}:
                        {((stats?.duration || 0) % 60).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            <button className="restart-btn" onClick={onRestart}>
                MAIN MENU
            </button>

            <style>{`
                .summary-screen {
                    text-align: center;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 100%;
                }
                .text-primary {
                    color: var(--color-primary);
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 15px;
                    margin: 3rem 0;
                }
                .stat-box {
                    background: #222;
                    padding: 15px;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .stat-box .label {
                    color: #888;
                    font-size: 0.8rem;
                    margin-bottom: 5px;
                }
                .stat-box .value {
                    color: #fff;
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                .restart-btn {
                    margin-top: 30px;
                }
            `}</style>
        </div>
    );
}
