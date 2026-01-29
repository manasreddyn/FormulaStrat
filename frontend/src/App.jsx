import React, { useState, useEffect } from 'react';
import { Trophy, Users, Car, Calendar, Activity, Cpu } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TeamDetails from './components/TeamDetails';
import TechSpecs from './components/TechSpecs';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Simple Tab Navigation
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'drivers': return <div className="card"><h2>Drivers Championship Coming Soon</h2></div>;
            case 'teams': return <TeamDetails />;
            case 'specs': return <TechSpecs />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="app-container">
            <nav className="nav-bar container">
                <div className="nav-logo">Formula<span>Strat</span></div>
                <div className="nav-links" style={{ display: 'flex', gap: '20px' }}>
                    <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity size={18} />} label="Live Telemetry" />
                    <NavButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} icon={<Users size={18} />} label="Drivers" />
                    <NavButton active={activeTab === 'teams'} onClick={() => setActiveTab('teams')} icon={<Car size={18} />} label="Teams" />
                    <NavButton active={activeTab === 'specs'} onClick={() => setActiveTab('specs')} icon={<Cpu size={18} />} label="Car Specs" />
                </div>
            </nav>

            <main className="container animate-fade-in">
                {renderContent()}
            </main>

            <footer className="container" style={{ marginTop: '50px', padding: '20px 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <p>Data provided by FastF1 Python Library.</p>
            </footer>
        </div>
    );
}

const NavButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            background: 'transparent',
            border: 'none',
            color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            padding: '8px 16px',
            borderBottom: active ? '2px solid var(--text-accent)' : '2px solid transparent'
        }}
    >
        {icon} {label}
    </button>
);

export default App;
