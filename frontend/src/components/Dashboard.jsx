import React, { useEffect, useState } from 'react';
import { Trophy, Timer, Zap } from 'lucide-react';
import TyreStintChart from './TyreStintChart';

const DEMO_RESULTS = {
    race: "Bahrain Grand Prix 2023 (Demo Data)",
    results: [
        { position: 1, driver: "VER", team: "Red Bull Racing", time: "1:33:56.736", points: 25 },
        { position: 2, driver: "PER", team: "Red Bull Racing", time: "+11.987s", points: 18 },
        { position: 3, driver: "ALO", team: "Aston Martin", time: "+38.637s", points: 15 },
        { position: 4, driver: "SAI", team: "Ferrari", time: "+48.052s", points: 12 },
        { position: 5, driver: "HAM", team: "Mercedes", time: "+50.977s", points: 10 }
    ]
};

const DEMO_STINTS = [
    { driver: "VER", stint: 1, compound: "SOFT", laps_count: 14, mean_lap_time: 98.2 },
    { driver: "VER", stint: 2, compound: "SOFT", laps_count: 22, mean_lap_time: 97.4 },
    { driver: "VER", stint: 3, compound: "HARD", laps_count: 21, mean_lap_time: 96.8 },
    { driver: "ALO", stint: 1, compound: "SOFT", laps_count: 12, mean_lap_time: 99.1 },
    { driver: "ALO", stint: 2, compound: "HARD", laps_count: 25, mean_lap_time: 98.5 },
];

export default function Dashboard() {
    const [races, setRaces] = useState([]);
    const [selectedRace, setSelectedRace] = useState(1);
    const [raceData, setRaceData] = useState(null);
    const [tyreData, setTyreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [useDemo, setUseDemo] = useState(false);
    const [error, setError] = useState(null);

    // Initial Fetch for Race List
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/season/2024/races')
            .then(res => res.json())
            .then(data => {
                setRaces(data);
                if (data.length > 0) setSelectedRace(data[0].round);
            })
            .catch(e => console.error("Could not fetch race list", e));
    }, []);

    // Fetch Race Data when selectedRace changes
    useEffect(() => {
        if (!selectedRace) return;
        setLoading(true);
        async function fetchData() {
            try {
                const raceRes = await fetch(`http://127.0.0.1:8000/api/race/2024/${selectedRace}/results`);
                const tyreRes = await fetch(`http://127.0.0.1:8000/api/race/2024/${selectedRace}/tyres`);

                if (!raceRes.ok || !tyreRes.ok) throw new Error("API Error");

                const rData = await raceRes.json();
                const tData = await tyreRes.json();

                setRaceData(rData);
                setTyreData(tData);
                setLoading(false);
                setUseDemo(false);
            } catch (e) {
                console.log("Backend not reachable, switching to demo mode", e);
                setUseDemo(true);
                setError(e);
                setRaceData(DEMO_RESULTS);
                setTyreData(DEMO_STINTS);
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedRace]);

    if (loading && !raceData) return <div className="container" style={{ padding: 50, textAlign: 'center' }}>Loading Telemetry...</div>;

    return (
        <div>
            <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem' }}>{raceData?.race || "Race Data"}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {useDemo ? (
                            <span style={{ color: '#ff6b6b' }}>
                                ⚠️ Connection Failed: {error ? error.message : "Backend not detected"}. Showing 2023 DEMO data.
                            </span>
                        ) : (
                            "Live Data from FastF1 Backend (Season 2024)"
                        )}
                    </p>
                </div>

                {/* Race Selector */}
                <div style={{ minWidth: 200 }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: 5 }}>SELECT RACE</label>
                    <select
                        value={selectedRace}
                        onChange={(e) => setSelectedRace(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'var(--bg-card)',
                            color: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            fontFamily: 'var(--font-display)'
                        }}
                    >
                        {races.map(r => (
                            <option key={r.round} value={r.round}>R{r.round}: {r.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Top 3 Cards */}
            <div className="grid-cols-3" style={{ marginBottom: 40 }}>
                {raceData?.results?.slice(0, 3).map((r, i) => (
                    <div key={r.driver} className="card" style={{ borderColor: i === 0 ? 'gold' : i === 1 ? 'silver' : '#cd7f32' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, opacity: 0.2 }}>0{i + 1}</span>
                            <Trophy size={32} color={i === 0 ? 'gold' : i === 1 ? 'silver' : '#cd7f32'} />
                        </div>
                        <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{r.driver}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{r.team}</p>
                        <div style={{ marginTop: 20, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                            {r.time}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <section className="card" style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Zap color="var(--text-accent)" />
                    <h3>Tyre Strategy & Stint Analysis</h3>
                </div>
                <TyreStintChart data={tyreData} />
                <div style={{ marginTop: 20, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Analysis of tyre compound life per stint.
                </div>
            </section>

            {/* Full Table */}
            <section className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Timer color="var(--text-accent)" />
                    <h3>Race Classification</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Driver</th>
                            <th>Team</th>
                            <th>Time/Gap</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {raceData?.results?.map((r) => (
                            <tr key={r.driver}>
                                <td>{r.position}</td>
                                <td style={{ fontWeight: 'bold', color: 'white' }}>{r.driver}</td>
                                <td>{r.team}</td>
                                <td style={{ fontFamily: 'monospace' }}>{r.time}</td>
                                <td style={{ color: 'var(--text-accent)' }}>{r.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
