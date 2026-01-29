import React, { useEffect, useState } from 'react';
import { Cpu, Zap, Battery, Ruler } from 'lucide-react';

export default function TechSpecs() {
    const [specs, setSpecs] = useState(null);

    useEffect(() => {
        fetch('/api/specs')
            .then(res => res.json())
            .then(data => setSpecs(data))
            .catch(err => console.error("Specs Error", err));
    }, []);

    if (!specs) return <div className="card">Loading Technical Specs...</div>;

    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '2.5rem', marginBottom: 30, color: 'var(--text-accent)' }}>
                F1 2024 Technical Specifications
            </h2>

            <div className="grid-cols-2">
                <SpecCard
                    title="Power Unit"
                    icon={<Cpu size={32} color="#ff3333" />}
                    data={specs.engine}
                />
                <SpecCard
                    title="Performance"
                    icon={<Zap size={32} color="#ffcc00" />}
                    data={specs.power}
                />
                <SpecCard
                    title="Energy Store"
                    icon={<Battery size={32} color="#33cc33" />}
                    data={specs.battery}
                />
                <SpecCard
                    title="Dimensions"
                    icon={<Ruler size={32} color="#3399ff" />}
                    data={specs.dimensions}
                />
            </div>
        </div>
    );
}

const SpecCard = ({ title, icon, data }) => (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute', top: -20, right: -20,
            opacity: 0.1, transform: 'scale(3)'
        }}>
            {icon}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
            {icon}
            <h3 style={{ fontSize: '1.5rem' }}>{title}</h3>
        </div>

        <table style={{ marginTop: 0 }}>
            <tbody>
                {Object.entries(data).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{
                            textTransform: 'uppercase',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            letterSpacing: 1
                        }}>
                            {key.replace('_', ' ')}
                        </td>
                        <td style={{
                            textAlign: 'right',
                            color: 'white',
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.1rem'
                        }}>
                            {value}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
