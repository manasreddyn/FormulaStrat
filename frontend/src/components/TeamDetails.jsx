import React, { useEffect, useState } from 'react';
import { Trophy, Signal, Car, Flag } from 'lucide-react';

export default function TeamDetails() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [driverStats, setDriverStats] = useState({});

    useEffect(() => {
        async function fetchTeams() {
            try {
                // Fetch from the new team-stats endpoint. Defaults to 2024.
                const res = await fetch('/api/season/2024/team-stats');
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                setTeams(data);
                if (data.length > 0) setSelectedTeam(data[0]);
                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        }
        fetchTeams();
    }, []);

    // Fetch stats for all drivers in selected team
    useEffect(() => {
        if (!selectedTeam) return;

        selectedTeam.drivers.forEach(driver => {
            fetch(`/api/driver/${driver}/career`)
                .then(res => res.json())
                .then(data => {
                    setDriverStats(prev => ({ ...prev, [driver]: data }));
                });
        });
    }, [selectedTeam]);

    if (loading) return <div>Loading Team Data (Processing Season 2024)...</div>;
    if (!teams.length) return <div>No Team Data Available. Ensure Backend is running.</div>;

    return (
        <div style={{ display: 'flex', gap: 20 }}>
            {/* Sidebar List */}
            <div className="card" style={{ width: 250, padding: 0, overflow: 'hidden' }}>
                <h3 style={{ padding: 20, borderBottom: '1px solid var(--border-color)' }}>Constructors</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {teams.map(t => (
                        <button
                            key={t.team}
                            onClick={() => setSelectedTeam(t)}
                            style={{
                                background: selectedTeam?.team === t.team ? 'rgba(225, 6, 0, 0.1)' : 'transparent',
                                border: 'none',
                                borderLeft: selectedTeam?.team === t.team ? '4px solid var(--text-accent)' : '4px solid transparent',
                                padding: '15px 20px',
                                textAlign: 'left',
                                color: selectedTeam?.team === t.team ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-display)',
                                transition: 'all 0.2s',
                                fontSize: '1rem'
                            }}
                        >
                            {t.team}
                        </button>
                    ))}
                </div>
            </div>

            {/* Details Panel */}
            <div style={{ flex: 1 }}>
                {selectedTeam && (
                    <div className="card animate-fade-in" style={{ padding: 40 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                            <h2 style={{ fontSize: '3rem', color: 'var(--text-accent)' }}>{selectedTeam.team}</h2>
                            <Car size={48} color="var(--text-secondary)" />
                        </div>

                        <div className="grid-cols-3" style={{ marginBottom: 40 }}>
                            <StatBox icon={<Trophy color="gold" />} label="Wins" value={selectedTeam.wins} />
                            <StatBox icon={<Flag color="silver" />} label="Poles" value={selectedTeam.poles} />
                            <StatBox icon={<Signal color="#a0a0b0" />} label="Race Starts" value={selectedTeam.starts} />
                        </div>

                        <div>
                            <h3 style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>Current Drivers</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                                {selectedTeam.drivers.map(d => (
                                    <div key={d} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '20px',
                                        borderRadius: 8,
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginBottom: 10 }}>{d}</div>

                                        {driverStats[d] && (
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Titles</span> <span style={{ color: 'gold' }}>{driverStats[d].wdc}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Wins</span> <span style={{ color: 'white' }}>{driverStats[d].wins}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Podiums</span> <span style={{ color: 'white' }}>{driverStats[d].podiums}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const StatBox = ({ icon, label, value }) => (
    <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: 20,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        border: '1px solid var(--border-color)'
    }}>
        {icon}
        <div>
            <div className="stat-value" style={{ fontSize: '2rem' }}>{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    </div>
);
