import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Activity, Flame, Bot, Terminal, ArrowLeft,
    Play, Square, CircleDot, Monitor, Map,
    Clock, Shield, Zap, Users, ChevronRight, BrainCircuit
} from 'lucide-react';

/* ─── Constants from Webots Simulation ─── */
const FIRE_POS = { x: 8.5, y: 2.5 };
const INJURED_POS = { x: 5.0, y: 0.5 };

const ROBOT_META = {
    mavic:  { label: 'Mavic Drone', icon: '🛸', type: 'Aerial Recon', color: '#3b82f6' },
    tiago1: { label: 'TIAGo #1',   icon: '🤖', type: 'Ground Unit',  color: '#22c55e' },
    tiago2: { label: 'TIAGo #2',   icon: '🤖', type: 'Ground Unit',  color: '#10b981' },
    tiago3: { label: 'TIAGo #3',   icon: '🤖', type: 'Ground Unit',  color: '#06d6a0' },
};

const TASK_STYLES = {
    extinguish: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
    rescue:     { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    scout:      { bg: 'rgba(59,130,246,0.15)',  text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
    standby:    { bg: 'rgba(136,153,176,0.1)',  text: '#8899b0', border: 'rgba(136,153,176,0.2)' },
};

/* ─── Dummy Mission Script ─── */
const MISSION_SCRIPT = [
    // --- Phase: IDLE ---
    { at: 0,  type: 'log', msg: '[SYSTEM] All units online — awaiting deployment' },
    { at: 0,  type: 'log', msg: '[SYSTEM] Sensors calibrated ✓' },
    { at: 0,  type: 'phase', phase: 'IDLE', intensity: 0 },

    // --- Phase: GAS_LEAK ---
    { at: 3,  type: 'phase', phase: 'GAS_LEAK', intensity: 0.05 },
    { at: 3,  type: 'log', msg: '[SENSOR] ⚠ Gas leak detected near oil barrels — Zone B' },
    { at: 4,  type: 'log', msg: '[SENSOR] Elevated methane levels — 320 ppm' },
    { at: 4,  type: 'llm', msg: 'report_status("Gas leak confirmed. Initiating emergency protocol.")' },
    { at: 5,  type: 'phase', phase: 'GAS_LEAK', intensity: 0.1 },
    { at: 6,  type: 'log', msg: '[SYSTEM] Emergency protocol ALPHA initiated' },

    // --- Phase: IGNITION ---
    { at: 7,  type: 'phase', phase: 'IGNITION', intensity: 0.2 },
    { at: 7,  type: 'log', msg: '[FIRE] 🔥 Ignition confirmed at (8.5, 2.5)!' },
    { at: 8,  type: 'llm', msg: 'move_drone(8.5, 3.0, 3.0) — Scout fire zone from altitude' },
    { at: 8,  type: 'move', robot: 'mavic', target: { x: 8.5, y: 3.0 } },
    { at: 8,  type: 'task', robot: 'mavic', task: 'scout' },
    { at: 8,  type: 'log', msg: '[AI] Deploying Mavic for aerial reconnaissance' },
    { at: 9,  type: 'phase', phase: 'IGNITION', intensity: 0.3 },

    // --- Phase: FIRE_SPREAD — Robot Deployment ---
    { at: 10, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.35 },
    { at: 10, type: 'log', msg: '[FIRE] Fire spreading — intensity rising' },
    { at: 11, type: 'llm', msg: 'move_robot("tiago1", 8.5, 2.5) — Navigate to fire zone' },
    { at: 11, type: 'llm', msg: 'move_robot("tiago2", 5.0, 0.5) — Navigate to injured person' },
    { at: 11, type: 'llm', msg: 'move_robot("tiago3", 3.0, -3.0) — Backup / perimeter watch' },
    { at: 11, type: 'move', robot: 'tiago1', target: { x: 8.5, y: 2.5 } },
    { at: 11, type: 'move', robot: 'tiago2', target: { x: 5.0, y: 0.5 } },
    { at: 11, type: 'move', robot: 'tiago3', target: { x: 3.0, y: -3.0 } },
    { at: 11, type: 'log', msg: '[AI] Ground units dispatched — 3 robots en route' },
    { at: 12, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.45 },
    { at: 13, type: 'log', msg: '[MAVIC] Aerial scan complete — fire source: oil barrel cluster' },
    { at: 14, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.55 },
    { at: 14, type: 'log', msg: '[TIAGO1] Approaching fire zone — ETA 4s' },
    { at: 15, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.62 },
    { at: 16, type: 'log', msg: '[TIAGO2] En route to injured person — ETA 6s' },
    { at: 17, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.68 },

    // --- FIRE_SPREAD — Extinguishing ---
    { at: 18, type: 'llm', msg: 'assign_task("tiago1", "extinguish") — Robot in range of fire' },
    { at: 18, type: 'task', robot: 'tiago1', task: 'extinguish' },
    { at: 18, type: 'log', msg: '[TIAGO1] 🧯 Reached fire zone — beginning suppression' },
    { at: 19, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.6 },
    { at: 20, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.5 },
    { at: 20, type: 'log', msg: '[TIAGO1] Fire intensity decreasing — 50%' },
    { at: 21, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.4 },
    { at: 22, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.3 },
    { at: 22, type: 'log', msg: '[TIAGO1] Suppression effective — intensity at 30%' },
    { at: 23, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.2 },
    { at: 24, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.12 },

    // --- Rescue begins ---
    { at: 24, type: 'llm', msg: 'assign_task("tiago2", "rescue") — Robot reached injured person' },
    { at: 24, type: 'task', robot: 'tiago2', task: 'rescue' },
    { at: 24, type: 'log', msg: '[TIAGO2] 🚑 Reached injured person — initiating rescue' },
    { at: 25, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.06 },
    { at: 25, type: 'log', msg: '[TIAGO2] Victim vitals: pulse 72bpm — stable' },
    { at: 25, type: 'llm', msg: 'assign_task("tiago3", "scout") — Perimeter secured' },
    { at: 25, type: 'task', robot: 'tiago3', task: 'scout' },

    // --- Extinguished ---
    { at: 27, type: 'phase', phase: 'EXTINGUISHED', intensity: 0 },
    { at: 27, type: 'log', msg: '[FIRE] ✅ Fire fully extinguished' },
    { at: 27, type: 'task', robot: 'tiago1', task: 'standby' },
    { at: 28, type: 'rescued' },
    { at: 28, type: 'log', msg: '[TIAGO2] ✅ Victim rescued and secured' },
    { at: 28, type: 'task', robot: 'tiago2', task: 'standby' },
    { at: 29, type: 'llm', msg: 'report_status("Mission complete. Fire extinguished. Person rescued. All units standing down.")' },
    { at: 29, type: 'log', msg: '[SYSTEM] 🎉 MISSION COMPLETE — All objectives achieved' },
    { at: 30, type: 'task', robot: 'mavic', task: 'standby' },
    { at: 30, type: 'task', robot: 'tiago3', task: 'standby' },
    { at: 30, type: 'log', msg: '[SYSTEM] All units returning to standby' },
];

const TIMELINE_STEPS = [
    { id: 0, title: 'System Init',     phase: 'IDLE',         start: 0,  icon: Shield },
    { id: 1, title: 'Gas Leak',        phase: 'GAS_LEAK',     start: 3,  icon: Zap },
    { id: 2, title: 'Fire Ignition',   phase: 'IGNITION',     start: 7,  icon: Flame },
    { id: 3, title: 'Drone Recon',     phase: 'FIRE_SPREAD',  start: 10, icon: Activity },
    { id: 4, title: 'Extinguishing',   phase: 'FIRE_SPREAD',  start: 18, icon: Zap },
    { id: 5, title: 'Rescue Op',       phase: 'FIRE_SPREAD',  start: 24, icon: Users },
    { id: 6, title: 'Mission Complete', phase: 'EXTINGUISHED', start: 27, icon: Shield },
];

/* ─── Custom Hook: Dummy Mission Engine ─── */
function useDummyMission() {
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [firePhase, setFirePhase] = useState('IDLE');
    const [fireIntensity, setFireIntensity] = useState(0);
    const [robots, setRobots] = useState({
        mavic:  { x: 0, y: -6, task: 'standby', targetX: 0, targetY: -6 },
        tiago1: { x: -5, y: -8, task: 'standby', targetX: -5, targetY: -8 },
        tiago2: { x: -3, y: -8, task: 'standby', targetX: -3, targetY: -8 },
        tiago3: { x: -1, y: -8, task: 'standby', targetX: -1, targetY: -8 },
    });
    const [logs, setLogs] = useState([]);
    const [llmDecisions, setLlmDecisions] = useState([]);
    const [personRescued, setPersonRescued] = useState(false);
    const [missionComplete, setMissionComplete] = useState(false);
    const scriptIdxRef = useRef(0);

    const reset = useCallback(() => {
        setElapsed(0);
        setFirePhase('IDLE');
        setFireIntensity(0);
        setRobots({
            mavic:  { x: 0, y: -6, task: 'standby', targetX: 0, targetY: -6 },
            tiago1: { x: -5, y: -8, task: 'standby', targetX: -5, targetY: -8 },
            tiago2: { x: -3, y: -8, task: 'standby', targetX: -3, targetY: -8 },
            tiago3: { x: -1, y: -8, task: 'standby', targetX: -1, targetY: -8 },
        });
        setLogs([]);
        setLlmDecisions([]);
        setPersonRescued(false);
        setMissionComplete(false);
        scriptIdxRef.current = 0;
    }, []);

    const start = useCallback(() => { reset(); setRunning(true); }, [reset]);
    const stop  = useCallback(() => { setRunning(false); }, []);

    useEffect(() => {
        if (!running) return;
        const TICK = 200;
        const SPEED = { mavic: 3.0, tiago1: 1.8, tiago2: 1.8, tiago3: 1.8 };

        const interval = setInterval(() => {
            setElapsed(prev => {
                const next = prev + TICK / 1000;

                while (scriptIdxRef.current < MISSION_SCRIPT.length) {
                    const evt = MISSION_SCRIPT[scriptIdxRef.current];
                    if (evt.at > next) break;
                    scriptIdxRef.current++;

                    switch (evt.type) {
                        case 'phase':
                            setFirePhase(evt.phase);
                            setFireIntensity(evt.intensity);
                            break;
                        case 'log':
                            setLogs(l => [...l, { time: evt.at, msg: evt.msg }]);
                            break;
                        case 'llm':
                            setLlmDecisions(d => [...d, { time: evt.at, msg: evt.msg }]);
                            break;
                        case 'move':
                            setRobots(r => ({
                                ...r,
                                [evt.robot]: { ...r[evt.robot], targetX: evt.target.x, targetY: evt.target.y },
                            }));
                            break;
                        case 'task':
                            setRobots(r => ({
                                ...r,
                                [evt.robot]: { ...r[evt.robot], task: evt.task },
                            }));
                            break;
                        case 'rescued':
                            setPersonRescued(true);
                            break;
                    }
                }

                if (scriptIdxRef.current >= MISSION_SCRIPT.length && next > 31) {
                    setMissionComplete(true);
                    setRunning(false);
                }

                return next;
            });

            setRobots(prev => {
                const dt = TICK / 1000;
                const next = { ...prev };
                for (const rid of Object.keys(next)) {
                    const r = { ...next[rid] };
                    const dx = r.targetX - r.x;
                    const dy = r.targetY - r.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const speed = SPEED[rid] || 1.8;
                    if (dist > 0.15) {
                        const step = Math.min(speed * dt, dist);
                        r.x += (dx / dist) * step;
                        r.y += (dy / dist) * step;
                    } else {
                        r.x = r.targetX;
                        r.y = r.targetY;
                    }
                    next[rid] = r;
                }
                return next;
            });
        }, TICK);

        return () => clearInterval(interval);
    }, [running]);

    return {
        running, elapsed, firePhase, fireIntensity,
        robots, logs, llmDecisions, personRescued, missionComplete,
        start, stop, reset,
    };
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

export default function Simulation() {
    const [tab, setTab] = useState('control');
    const mission = useDummyMission();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#060606]">
            <div className="noise-overlay" />

            {/* Header */}
            <header className="glass-nav px-4 md:px-6 py-3 flex justify-between items-center border-b border-white/[0.04]">
                <div className="flex items-center gap-3 md:gap-4">
                    <Link to="/" className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-gray-500 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-5 w-px bg-white/[0.08]" />
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rescue-orange animate-pulse" />
                        <h1 className="font-bold text-sm tracking-wider uppercase hidden sm:block">Mission Control</h1>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        mission.missionComplete
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : mission.running
                                ? 'bg-rescue-orange/10 text-rescue-orange border border-rescue-orange/20'
                                : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'
                    }`}>
                        <CircleDot className={`w-2.5 h-2.5 ${mission.running ? 'animate-pulse' : ''}`} />
                        {mission.missionComplete ? 'Complete' : mission.running ? 'Active' : 'Standby'}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
                        <button
                            onClick={() => setTab('control')}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex gap-1.5 items-center transition-all ${
                                tab === 'control'
                                    ? 'bg-rescue-orange text-white shadow-lg shadow-rescue-orange/20'
                                    : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <Monitor size={12} /> Frontend
                        </button>
                        <button
                            onClick={() => setTab('simulation')}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex gap-1.5 items-center transition-all ${
                                tab === 'simulation'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <Map size={12} /> Simulation
                        </button>
                    </div>

                    {!mission.running && !mission.missionComplete && (
                        <button onClick={mission.start} className="btn-shimmer bg-rescue-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex gap-1.5 items-center glow transition-all">
                            <Play size={12} className="fill-current" /> Start Mission
                        </button>
                    )}
                    {mission.running && (
                        <button onClick={mission.stop} className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex gap-1.5 items-center transition-all">
                            <Square size={12} /> Stop
                        </button>
                    )}
                    {mission.missionComplete && (
                        <button onClick={mission.reset} className="bg-white/[0.06] hover:bg-white/[0.1] text-white px-4 py-2 rounded-lg text-xs font-bold flex gap-1.5 items-center transition-all">
                            Reset
                        </button>
                    )}
                </div>
            </header>

            {/* Content */}
            <AnimatePresence mode="wait">
                {tab === 'control' ? (
                    <motion.main
                        key="control"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 overflow-hidden"
                    >
                        <div className="lg:col-span-2 glass overflow-hidden relative border-rescue-orange/10 border">
                            <CornerAccents />
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                <CircleDot className={`w-3 h-3 ${mission.running ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Factory Floor — Live</span>
                            </div>
                            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                                <Clock size={10} />
                                {formatTime(mission.elapsed)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <FactoryMap
                                    robots={mission.robots}
                                    fireIntensity={mission.fireIntensity}
                                    firePhase={mission.firePhase}
                                    personRescued={mission.personRescued}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 md:gap-4 overflow-hidden">
                            <FireStatusCard phase={mission.firePhase} intensity={mission.fireIntensity} />
                            <RobotFleetCard robots={mission.robots} />
                            <LogsCard logs={mission.logs} />
                        </div>
                    </motion.main>
                ) : (
                    <motion.main
                        key="simulation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 overflow-hidden"
                    >
                        <div className="lg:col-span-3 glass overflow-hidden relative border-blue-500/10 border">
                            <CornerAccents color="blue" />
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                                <CircleDot className={`w-3 h-3 ${mission.running ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Simulation View</span>
                            </div>
                            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
                                <Clock size={10} />
                                {formatTime(mission.elapsed)}
                            </div>
                            <div className="absolute bottom-4 left-4 z-10">
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                    mission.firePhase === 'EXTINGUISHED'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : mission.firePhase === 'FIRE_SPREAD' || mission.firePhase === 'IGNITION'
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            : 'bg-white/[0.04] text-gray-400 border border-white/[0.06]'
                                }`}>
                                    {mission.firePhase.replace('_', ' ')}
                                    {mission.fireIntensity > 0 && ` — ${(mission.fireIntensity * 100).toFixed(0)}%`}
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                                <FactoryMap
                                    robots={mission.robots}
                                    fireIntensity={mission.fireIntensity}
                                    firePhase={mission.firePhase}
                                    personRescued={mission.personRescued}
                                    large
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 md:gap-4 overflow-hidden">
                            <MissionTimeline elapsed={mission.elapsed} missionComplete={mission.missionComplete} />
                            <LLMFeedCard decisions={mission.llmDecisions} />
                        </div>
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

function FactoryMap({ robots, fireIntensity, firePhase, personRescued, large }) {
    const fireR = fireIntensity * 1.8;
    const showFire = firePhase !== 'IDLE' && firePhase !== 'EXTINGUISHED';

    return (
        <svg
            viewBox="-10.5 -13 21.5 17.5"
            className={`w-full h-full ${large ? 'max-w-none' : 'max-w-2xl'}`}
            style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.3))' }}
        >
            <rect x="-10.5" y="-13" width="21.5" height="17.5" fill="#0a0e17" rx="0.3" />
            <rect x="-10" y="-12.5" width="20" height="16.32" fill="none" stroke="#293548" strokeWidth="0.15" rx="0.1" />
            <g stroke="#1a2236" strokeWidth="0.03">
                <line x1="-10" y1="0" x2="10" y2="0" />
                <line x1="-10" y1="-5" x2="10" y2="-5" />
                <line x1="-10" y1="-10" x2="10" y2="-10" />
                <line x1="-5" y1="-12.5" x2="-5" y2="3.82" />
                <line x1="0" y1="-12.5" x2="0" y2="3.82" />
                <line x1="5" y1="-12.5" x2="5" y2="3.82" />
            </g>
            <rect x="7.5" y="1.5" width="2.2" height="2.2" rx="0.2" fill="rgba(249,115,22,0.08)" stroke="rgba(249,115,22,0.2)" strokeWidth="0.05" strokeDasharray="0.15,0.1" />
            <text x="8.6" y="1.3" fontSize="0.4" fill="#8899b0" textAnchor="middle" fontFamily="Inter, sans-serif">Oil Barrels</text>
            <rect x="-2.5" y="-5.6" width="5" height="1.6" rx="0.1" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.04" />
            <text x="0" y="-5.9" fontSize="0.35" fill="#556677" textAnchor="middle" fontFamily="Inter, sans-serif">Work Table</text>
            <rect x="8.4" y="-2.5" width="1.5" height="3" rx="0.1" fill="rgba(255,255,255,0.03)" stroke="#293548" strokeWidth="0.04" />
            <text x="9.15" y="-0.8" fontSize="0.3" fill="#556677" textAnchor="middle" transform="rotate(-90 9.15 -0.8)" fontFamily="Inter, sans-serif">Stairs</text>
            <rect x="9.9" y="-4.5" width="0.2" height="1" fill="rgba(99,102,241,0.3)" rx="0.05" />
            <rect x="-10.1" y="-0.5" width="0.2" height="1" fill="rgba(99,102,241,0.3)" rx="0.05" />
            <text x="9.2" y="-3.7" fontSize="0.3" fill="#556677" fontFamily="Inter, sans-serif">Door</text>
            <text x="-9.3" y="0.8" fontSize="0.3" fill="#556677" fontFamily="Inter, sans-serif">Door</text>

            {showFire && (
                <>
                    <circle cx={FIRE_POS.x} cy={FIRE_POS.y} r={fireR} fill="rgba(249,115,22,0.3)" className="animate-pulse">
                        <animate attributeName="r" values={`${fireR * 0.9};${fireR * 1.1};${fireR * 0.9}`} dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={FIRE_POS.x} cy={FIRE_POS.y} r={fireR * 0.4} fill="rgba(239,68,68,0.6)">
                        <animate attributeName="r" values={`${fireR * 0.35};${fireR * 0.45};${fireR * 0.35}`} dur="0.8s" repeatCount="indefinite" />
                    </circle>
                    <text x={FIRE_POS.x} y={FIRE_POS.y + 0.15} fontSize="0.6" textAnchor="middle">🔥</text>
                </>
            )}
            {firePhase === 'EXTINGUISHED' && (
                <text x={FIRE_POS.x} y={FIRE_POS.y + 0.2} fontSize="0.5" textAnchor="middle">✅</text>
            )}

            <g opacity={personRescued ? 0.3 : 1}>
                <circle cx={INJURED_POS.x} cy={INJURED_POS.y} r="0.35" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="0.06" strokeDasharray="0.1,0.08">
                    {!personRescued && <animate attributeName="r" values="0.35;0.5;0.35" dur="2s" repeatCount="indefinite" />}
                </circle>
                <text x={INJURED_POS.x} y={INJURED_POS.y + 0.15} fontSize="0.55" textAnchor="middle">🧑</text>
                <text x={INJURED_POS.x} y={INJURED_POS.y - 0.5} fontSize="0.3" fill={personRescued ? '#22c55e' : '#a855f7'} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600">
                    {personRescued ? 'Rescued ✓' : 'Injured'}
                </text>
            </g>

            {Object.entries(robots).map(([rid, r]) => {
                const meta = ROBOT_META[rid];
                const col = meta.color;
                return (
                    <g key={rid}>
                        <circle cx={r.x} cy={r.y} r="0.55" fill={`${col}22`} stroke={col} strokeWidth="0.06" />
                        <circle cx={r.x} cy={r.y} r="0.2" fill={col} />
                        <text x={r.x} y={r.y + 0.95} fontSize="0.32" fill={col} textAnchor="middle" fontWeight="600" fontFamily="Inter, sans-serif">
                            {meta.label}
                        </text>
                        {r.task && r.task !== 'standby' && (
                            <text x={r.x} y={r.y - 0.7} fontSize="0.25" fill={(TASK_STYLES[r.task] || TASK_STYLES.standby).text} textAnchor="middle" fontWeight="700" fontFamily="Inter, sans-serif">
                                {r.task.toUpperCase()}
                            </text>
                        )}
                    </g>
                );
            })}

            <text x="-9.8" y="3.5" fontSize="0.25" fill="#293548" fontFamily="JetBrains Mono, monospace">(-10, 3.8)</text>
            <text x="8.2" y="3.5" fontSize="0.25" fill="#293548" fontFamily="JetBrains Mono, monospace">(10, 3.8)</text>
            <text x="-9.8" y="-12" fontSize="0.25" fill="#293548" fontFamily="JetBrains Mono, monospace">(-10, -12.5)</text>
        </svg>
    );
}

function CornerAccents({ color = 'orange' }) {
    const c = color === 'blue' ? 'border-blue-500/30' : 'border-rescue-orange/30';
    return (
        <>
            <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 ${c} rounded-tl-2xl`} />
            <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 ${c} rounded-tr-2xl`} />
            <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 ${c} rounded-bl-2xl`} />
            <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 ${c} rounded-br-2xl`} />
        </>
    );
}

function FireStatusCard({ phase, intensity }) {
    return (
        <div className="glass p-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2 font-semibold">
                <Flame size={12} className={phase !== 'IDLE' && phase !== 'EXTINGUISHED' ? 'text-red-500' : 'text-gray-600'} />
                Fire Status
            </h2>
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <span className="text-2xl font-mono font-extrabold text-white tracking-tight">
                        {phase.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">Phase</span>
                </div>
                <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600"
                        animate={{ width: `${intensity * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    <span>Intensity</span>
                    <span className="text-rescue-orange font-bold">{(intensity * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
}

function RobotFleetCard({ robots }) {
    return (
        <div className="glass p-5 flex-1 overflow-hidden flex flex-col min-h-0">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2 font-semibold">
                <Bot size={12} /> Swarm Telemetry
            </h2>
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {Object.entries(robots).map(([rid, r]) => {
                    const meta = ROBOT_META[rid];
                    const ts = TASK_STYLES[r.task] || TASK_STYLES.standby;
                    return (
                        <div key={rid} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-white/[0.1] transition-all">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{meta.icon}</span>
                                    <span className="font-bold text-xs uppercase tracking-wider" style={{ color: meta.color }}>{meta.label}</span>
                                </div>
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase"
                                    style={{ background: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}
                                >
                                    {r.task}
                                </span>
                            </div>
                            <div className="text-[10px] font-mono text-gray-600 tracking-wide">
                                POS [{r.x.toFixed(1)}, {r.y.toFixed(1)}]
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LogsCard({ logs }) {
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [logs]);

    return (
        <div className="glass p-4 h-44 overflow-hidden flex flex-col">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 flex items-center gap-2 font-semibold">
                <Terminal size={10} /> System Logs
            </h2>
            <div ref={scrollRef} className="flex-1 overflow-y-auto font-mono text-[11px] text-green-400/70 space-y-0.5 pr-1">
                {logs.length === 0 && (
                    <div className="text-gray-600 text-center py-4 text-[10px]">Awaiting mission start...</div>
                )}
                {logs.map((l, i) => (
                    <div key={i} className="border-l border-green-500/20 pl-2.5 py-0.5 opacity-70 hover:opacity-100 transition-opacity flex items-start gap-2">
                        <span className="text-green-500/30 shrink-0">{l.time.toFixed(0)}s</span>
                        <span>{l.msg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MissionTimeline({ elapsed, missionComplete }) {
    return (
        <div className="glass p-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2 font-semibold">
                <ChevronRight size={12} /> Mission Steps
            </h2>
            <div className="space-y-1">
                {TIMELINE_STEPS.map((step, i) => {
                    const nextStart = TIMELINE_STEPS[i + 1]?.start || 999;
                    const isActive = elapsed >= step.start && elapsed < nextStart;
                    const isDone = elapsed >= nextStart || (i === TIMELINE_STEPS.length - 1 && missionComplete);
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                isActive
                                    ? 'bg-rescue-orange/10 border border-rescue-orange/20'
                                    : isDone
                                        ? 'bg-green-500/[0.04] border border-green-500/10'
                                        : 'border border-transparent'
                            }`}
                        >
                            <div className={`p-1.5 rounded-md ${
                                isActive ? 'bg-rescue-orange/20 text-rescue-orange' :
                                isDone ? 'bg-green-500/10 text-green-400' :
                                'bg-white/[0.03] text-gray-600'
                            }`}>
                                <Icon size={12} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold ${isActive ? 'text-white' : isDone ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {step.title}
                                </div>
                                <div className="text-[10px] text-gray-600 font-mono">
                                    {step.phase.replace('_', ' ')}
                                </div>
                            </div>
                            {isDone && <span className="text-green-400 text-[10px]">✓</span>}
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-rescue-orange animate-pulse" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LLMFeedCard({ decisions }) {
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [decisions]);

    return (
        <div className="glass p-4 flex-1 overflow-hidden flex flex-col min-h-0">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2 font-semibold">
                <BrainCircuit size={12} className="text-purple-400" /> AI Decisions
            </h2>
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
                {decisions.length === 0 && (
                    <div className="text-gray-600 text-center py-6 text-[10px]">No AI decisions yet</div>
                )}
                {decisions.map((d, i) => {
                    const isMove = d.msg.includes('move_');
                    const isTask = d.msg.includes('assign_task');
                    const color = isMove ? '#3b82f6' : isTask ? '#f97316' : '#a855f7';

                    return (
                        <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                <span className="text-[10px] font-mono text-gray-500">{d.time.toFixed(0)}s</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>
                                    {isMove ? 'MOVE' : isTask ? 'TASK' : 'STATUS'}
                                </span>
                            </div>
                            <p className="text-[11px] font-mono text-gray-400 leading-relaxed break-all">{d.msg}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
