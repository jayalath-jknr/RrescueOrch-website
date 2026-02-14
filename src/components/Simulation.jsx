
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Activity, Flame, Bot, Terminal, AlertTriangle, Eye, Video,
    ArrowLeft, Wifi, WifiOff, CircleDot, Signal
} from 'lucide-react';

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

    const isConnected = !error && status;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#060606]">
            {/* Noise */}
            <div className="noise-overlay" />

            {/* Header */}
            <header className="glass-nav px-6 py-3 flex justify-between items-center border-b border-white/[0.04]">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-gray-500 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-5 w-px bg-white/[0.08]" />
                    <div className="flex items-center gap-2.5">
                        <Activity className="w-4 h-4 text-rescue-orange animate-pulse" />
                        <h1 className="font-bold text-sm tracking-wider uppercase">Mission Control</h1>
                    </div>
                    {/* Connection status */}
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        isConnected
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {isConnected ? 'Connected' : 'Offline'}
                    </div>
                </div>

                <div className="flex gap-1.5">
                    <button
                        onClick={() => setMode('live')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex gap-2 items-center transition-all ${
                            mode === 'live'
                                ? 'bg-rescue-orange text-white shadow-lg shadow-rescue-orange/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <Eye size={14} /> Live Feed
                    </button>
                    <button
                        onClick={() => setMode('demo')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex gap-2 items-center transition-all ${
                            mode === 'demo'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <Video size={14} /> Demo Video
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 pt-4 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">

                {/* Main Viewport */}
                <div className="lg:col-span-2 glass overflow-hidden relative border-rescue-orange/10 border">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-rescue-orange/30 rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-rescue-orange/30 rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-rescue-orange/30 rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-rescue-orange/30 rounded-br-2xl" />

                    {/* Viewport label */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        <CircleDot className={`w-3 h-3 ${mode === 'live' && isConnected ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                            {mode === 'live' ? 'Live Visual Stream' : 'Recorded Demo'}
                        </span>
                    </div>

                    {mode === 'demo' ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="text-center">
                                <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Demo Video Placeholder</p>
                                <p className="text-gray-600 text-xs mt-1">Embed your demo recording here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            {error ? (
                                <div className="flex flex-col items-center gap-5">
                                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                        <AlertTriangle className="w-8 h-8 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-red-400 mb-2">{error}</p>
                                        <p className="text-sm text-gray-500 font-mono">
                                            Run: <code className="bg-white/[0.04] px-2 py-0.5 rounded text-gray-400">python backend/main.py</code>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full h-full bg-black/30 rounded-xl overflow-hidden flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Signal className="w-6 h-6 text-gray-600 animate-pulse" />
                                        <p className="text-gray-500 text-sm font-medium">Waiting for Visual Stream...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Data Panel */}
                <div className="flex flex-col gap-4 overflow-hidden">

                    {/* Mission Status Card */}
                    <div className="glass p-5">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2 font-semibold">
                            <Flame size={12} className={status?.fire_phase !== 'IDLE' ? 'text-red-500' : 'text-gray-600'} />
                            Fire Status
                        </h2>

                        {status ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-3xl font-mono font-extrabold text-white tracking-tight">
                                        {status.fire_phase}
                                    </span>
                                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">Phase</span>
                                </div>

                                <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(status.fire_intensity || 0) * 100}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                    <span>Intensity</span>
                                    <span className="text-rescue-orange font-bold">{((status.fire_intensity || 0) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="animate-pulse h-8 bg-white/[0.03] rounded-lg" />
                                <div className="animate-pulse h-1.5 bg-white/[0.03] rounded-full" />
                                <div className="animate-pulse h-3 bg-white/[0.03] rounded w-1/2" />
                            </div>
                        )}
                    </div>

                    {/* Robots Status */}
                    <div className="glass p-5 flex-1 overflow-hidden flex flex-col min-h-0">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2 font-semibold">
                            <Bot size={12} /> Swarm Telemetry
                        </h2>

                        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                            {status?.robots && Object.entries(status.robots).map(([rid, data]) => (
                                <div
                                    key={rid}
                                    className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-white/[0.1] transition-all group"
                                >
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="font-bold text-xs text-rescue-accent uppercase tracking-wider">{rid}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                            data.task !== 'none'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'
                                        }`}>
                                            {data.task || 'IDLE'}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-600 tracking-wide">
                                        POS [{data.position?.x?.toFixed(1)}, {data.position?.y?.toFixed(1)}]
                                    </div>
                                </div>
                            ))}
                            {!status && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Bot className="w-6 h-6 text-gray-700 mb-2" />
                                    <p className="text-gray-600 text-xs">No Telemetry Data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="glass p-4 h-44 overflow-hidden flex flex-col">
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 flex items-center gap-2 font-semibold">
                            <Terminal size={10} /> System Logs
                        </h2>
                        <div className="flex-1 overflow-y-auto font-mono text-[11px] text-green-400/70 space-y-0.5 pr-1">
                            {status?.log?.slice().reverse().map((line, i) => (
                                <div
                                    key={i}
                                    className="border-l border-green-500/20 pl-2.5 py-0.5 opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    {line}
                                </div>
                            ))}
                            {!status?.log && (
                                <div className="text-gray-600 text-center py-4 text-[10px]">
                                    Awaiting log stream...
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
