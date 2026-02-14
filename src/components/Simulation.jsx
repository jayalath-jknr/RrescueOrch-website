
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, Bot, Terminal, AlertTriangle, Eye, Video } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

export default function Simulation() {
    const [mode, setMode] = useState('live'); // 'live' or 'demo'
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (mode !== 'live') return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/mission/status`);
                if (!res.ok) throw new Error("Backend offline");
                const data = await res.json();
                setStatus(data);
                setError(null);
            } catch (err) {
                setError("Connection to Simulation Lost. Make sure backend is running on port 8000.");
            } finally {
                setLoading(false);
            }
        };

        const interval = setInterval(fetchStatus, 1000);
        fetchStatus();
        return () => clearInterval(interval);
    }, [mode]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-black/90">
            {/* Header */}
            <header className="glass-nav p-4 flex justify-between items-center px-8">
                <div className="flex items-center gap-2">
                    <Activity className="text-rescue-orange animate-pulse" />
                    <h1 className="font-bold text-xl tracking-wider">MISSION CONTROL</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('live')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex gap-2 items-center transition-colors ${mode === 'live' ? 'bg-rescue-orange text-white' : 'glass text-gray-400 hover:text-white'}`}
                    >
                        <Eye size={16} /> Live Feed
                    </button>
                    <button
                        onClick={() => setMode('demo')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex gap-2 items-center transition-colors ${mode === 'demo' ? 'bg-blue-600 text-white' : 'glass text-gray-400 hover:text-white'}`}
                    >
                        <Video size={16} /> Demo Video
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 pt-20 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Viewport (Video / Map) */}
                <div className="lg:col-span-2 glass overflow-hidden relative border-rescue-orange/20 border-2">
                    {mode === 'demo' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                            <p className="text-gray-500">[ DEMO VIDEO PLACEHOLDER ]</p>
                            {/* Embed video here */}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            {error ? (
                                <div className="text-red-400 flex flex-col items-center gap-4">
                                    <AlertTriangle size={48} />
                                    <p className="text-xl font-bold">{error}</p>
                                    <p className="text-sm text-gray-400">Run backend locally: `python backend/main.py`</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
                                    <p className="text-gray-500 animate-pulse">Waiting for Visual Stream...</p>
                                    {/* In a real scenario, this would be an MJPEG stream or Webots Web View */}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Data Panel */}
                <div className="flex flex-col gap-6">

                    {/* Mission Status Card */}
                    <div className="glass p-6">
                        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Flame size={16} className={status?.fire_phase !== 'IDLE' ? 'text-red-500' : 'text-gray-600'} />
                            Fire Status
                        </h2>

                        {status ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-4xl font-mono font-bold text-white">{status.fire_phase}</span>
                                    <span className="text-xs text-gray-500">PHASE</span>
                                </div>

                                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all duration-500"
                                        style={{ width: `${(status.fire_intensity || 0) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 font-mono">
                                    <span>INTENSITY</span>
                                    <span>{((status.fire_intensity || 0) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-pulse h-20 bg-white/5 rounded-lg"></div>
                        )}
                    </div>

                    {/* Robots Status */}
                    <div className="glass p-6 flex-1 overflow-y-auto">
                        <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Bot size={16} /> Swarm Telemetry
                        </h2>

                        <div className="space-y-3">
                            {status?.robots && Object.entries(status.robots).map(([rid, data]) => (
                                <div key={rid} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-rescue-accent uppercase">{rid}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${data.task !== 'none' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                            {data.task || 'IDLE'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono text-gray-500">
                                        Pos: [{data.position?.x?.toFixed(1)}, {data.position?.y?.toFixed(1)}]
                                    </div>
                                </div>
                            ))}
                            {!status && <p className="text-gray-600 text-center py-4">No Telemetry</p>}
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="glass p-4 h-48 overflow-hidden flex flex-col">
                        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                            <Terminal size={12} /> System Logs
                        </h2>
                        <div className="flex-1 overflow-y-auto font-mono text-xs text-green-400/80 space-y-1 scrollbar-hide">
                            {status?.log?.slice().reverse().map((line, i) => (
                                <div key={i} className="border-l-2 border-green-500/30 pl-2 opacity-80 hover:opacity-100">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
