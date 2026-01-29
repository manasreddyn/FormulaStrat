import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COMPOUND_COLORS = {
    "SOFT": "#FF3333",
    "MEDIUM": "#FFE033",
    "HARD": "#FFFFFF",
    "INTERMEDIATE": "#33FF33",
    "WET": "#3333FF"
};

export default function TyreStintChart({ data }) {
    if (!data) return <div>No Tyre Data</div>;

    // Filter for top drivers to avoid clutter
    const topDrivers = ["VER", "PER", "ALO", "SAI", "HAM", "LEC", "RUS"];
    const filteredData = data.filter(d => topDrivers.includes(d.driver));

    // Transform for chart if needed, but simple bar chart of stint length grouped by driver might work.
    // Actually, a stacked bar chart is tricky if we don't normalize the x-axis to be 'stint 1', 'stint 2'.
    // Let's just show a scatter or simple bar of specific stints for now.

    // Better visual: "Tyre Life" - X axis is Driver+Stint, Y is Laps.
    const chartData = filteredData.map(d => ({
        name: `${d.driver} S${d.stint}`,
        laps: d.laps_count,
        compound: d.compound,
        driver: d.driver
    }));

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" interval={0} fontSize={10} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#888" label={{ value: 'Laps', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="laps" name="Laps per Stint">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COMPOUND_COLORS[entry.compound] || '#888'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 15, justifyContent: 'center', marginTop: 10 }}>
                {Object.entries(COMPOUND_COLORS).slice(0, 3).map(([name, color]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }}></div>
                        {name}
                    </div>
                ))}
            </div>
        </div>
    );
}
