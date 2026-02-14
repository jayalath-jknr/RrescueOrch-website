import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Activity, Flame, Bot, Terminal, ArrowLeft,
    Play, Square, CircleDot, Clock, Shield,
    Zap, Users, BrainCircuit, Send, Gamepad2, Video
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   SCENARIO DEFINITIONS
   ═══════════════════════════════════════════════ */

const SCENARIOS = {
    kitchen: {
        id: 'kitchen',
        label: 'Scenario 1 — Kitchen Fire',
        shortLabel: 'Scenario 1',
        description: 'Kitchen fire rescue',
        icon: '🍳',
        mapLabel: 'Kitchen — Live View',
        firePos: { x: 3.0, y: -2.0 },
        injuredPos: { x: -4.0, y: 1.0 },
        robots: {
            mavic:  { label: 'Mavic Drone', icon: '🛸', type: 'Aerial Recon', color: '#3b82f6' },
            tiago1: { label: 'TIAGo #1',   icon: '🤖', type: 'Ground Unit',  color: '#22c55e' },
            tiago2: { label: 'TIAGo #2',   icon: '🤖', type: 'Ground Unit',  color: '#10b981' },
        },
        initialRobots: {
            mavic:  { x: -6, y: -5, task: 'standby', targetX: -6, targetY: -5 },
            tiago1: { x: -7, y: 2, task: 'standby', targetX: -7, targetY: 2 },
            tiago2: { x: -7, y: 4, task: 'standby', targetX: -7, targetY: 4 },
        },
        script: [
            { at: 0,  type: 'log', msg: '[SYSTEM] All units online — awaiting deployment' },
            { at: 0,  type: 'log', msg: '[SYSTEM] Kitchen sensors calibrated ✓' },
            { at: 0,  type: 'phase', phase: 'IDLE', intensity: 0 },
            { at: 3,  type: 'phase', phase: 'GAS_LEAK', intensity: 0.05 },
            { at: 3,  type: 'log', msg: '[SENSOR] ⚠ Gas leak detected near stove — Zone A' },
            { at: 4,  type: 'log', msg: '[SENSOR] Elevated propane levels — 280 ppm' },
            { at: 4,  type: 'llm', msg: 'report_status("Gas leak confirmed near stove. Initiating kitchen emergency protocol.")' },
            { at: 5,  type: 'phase', phase: 'GAS_LEAK', intensity: 0.1 },
            { at: 6,  type: 'log', msg: '[SYSTEM] Emergency protocol KITCHEN-ALPHA initiated' },
            { at: 7,  type: 'phase', phase: 'IGNITION', intensity: 0.2 },
            { at: 7,  type: 'log', msg: '[FIRE] 🔥 Ignition confirmed at stove area (3.0, -2.0)!' },
            { at: 8,  type: 'llm', msg: 'move_drone(3.0, -3.0, 2.5) — Scout kitchen fire zone' },
            { at: 8,  type: 'move', robot: 'mavic', target: { x: 3.0, y: -3.0 } },
            { at: 8,  type: 'task', robot: 'mavic', task: 'scout' },
            { at: 8,  type: 'log', msg: '[AI] Deploying Mavic for aerial reconnaissance' },
            { at: 9,  type: 'phase', phase: 'IGNITION', intensity: 0.3 },
            { at: 10, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.35 },
            { at: 10, type: 'log', msg: '[FIRE] Fire spreading to adjacent counters' },
            { at: 11, type: 'llm', msg: 'move_robot("tiago1", 3.0, -2.0) — Navigate to fire zone' },
            { at: 11, type: 'llm', msg: 'move_robot("tiago2", -4.0, 1.0) — Navigate to injured person' },
            { at: 11, type: 'move', robot: 'tiago1', target: { x: 3.0, y: -2.0 } },
            { at: 11, type: 'move', robot: 'tiago2', target: { x: -4.0, y: 1.0 } },
            { at: 11, type: 'log', msg: '[AI] Ground units dispatched — 2 robots en route' },
            { at: 12, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.45 },
            { at: 13, type: 'log', msg: '[MAVIC] Aerial scan — fire spreading from stove to counter' },
            { at: 14, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.55 },
            { at: 15, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.62 },
            { at: 16, type: 'log', msg: '[TIAGO2] En route to injured person — ETA 5s' },
            { at: 17, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.65 },
            { at: 18, type: 'llm', msg: 'assign_task("tiago1", "extinguish") — Robot in range of fire' },
            { at: 18, type: 'task', robot: 'tiago1', task: 'extinguish' },
            { at: 18, type: 'log', msg: '[TIAGO1] 🧯 Reached stove fire — beginning suppression' },
            { at: 19, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.55 },
            { at: 20, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.45 },
            { at: 20, type: 'log', msg: '[TIAGO1] Fire intensity decreasing — 45%' },
            { at: 21, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.35 },
            { at: 22, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.25 },
            { at: 22, type: 'log', msg: '[TIAGO1] Suppression effective — intensity at 25%' },
            { at: 23, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.15 },
            { at: 24, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.08 },
            { at: 24, type: 'llm', msg: 'assign_task("tiago2", "rescue") — Robot reached injured person' },
            { at: 24, type: 'task', robot: 'tiago2', task: 'rescue' },
            { at: 24, type: 'log', msg: '[TIAGO2] 🚑 Reached injured person near dining area' },
            { at: 25, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.03 },
            { at: 25, type: 'log', msg: '[TIAGO2] Victim vitals: pulse 80bpm — stable' },
            { at: 27, type: 'phase', phase: 'EXTINGUISHED', intensity: 0 },
            { at: 27, type: 'log', msg: '[FIRE] ✅ Kitchen fire fully extinguished' },
            { at: 27, type: 'task', robot: 'tiago1', task: 'standby' },
            { at: 28, type: 'rescued' },
            { at: 28, type: 'log', msg: '[TIAGO2] ✅ Victim rescued and secured' },
            { at: 28, type: 'task', robot: 'tiago2', task: 'standby' },
            { at: 29, type: 'llm', msg: 'report_status("Mission complete. Kitchen fire extinguished. Person rescued.")' },
            { at: 29, type: 'log', msg: '[SYSTEM] 🎉 MISSION COMPLETE — All objectives achieved' },
            { at: 30, type: 'task', robot: 'mavic', task: 'standby' },
            { at: 30, type: 'log', msg: '[SYSTEM] All units returning to standby' },
        ],
        videos: [
            { src: '/videos/RescueOrch_kitchen.mp4', label: 'RescuOrch kitchen rescue mission' },
            { src: '/videos/kitchen.mp4', label: 'Webots kitchen environment' },
        ],
    },
    factory: {
        id: 'factory',
        label: 'Scenario 2 — Factory Fire',
        shortLabel: 'Scenario 2',
        description: 'Factory fire rescue',
        icon: '🏭',
        mapLabel: 'Factory Floor — Live View',
        firePos: { x: 8.5, y: 2.5 },
        injuredPos: { x: 5.0, y: 0.5 },
        robots: {
            mavic:  { label: 'Mavic Drone', icon: '🛸', type: 'Aerial Recon', color: '#3b82f6' },
            tiago1: { label: 'TIAGo #1',   icon: '🤖', type: 'Ground Unit',  color: '#22c55e' },
            tiago2: { label: 'TIAGo #2',   icon: '🤖', type: 'Ground Unit',  color: '#10b981' },
            tiago3: { label: 'TIAGo #3',   icon: '🤖', type: 'Ground Unit',  color: '#06d6a0' },
        },
        initialRobots: {
            mavic:  { x: 0, y: -6, task: 'standby', targetX: 0, targetY: -6 },
            tiago1: { x: -5, y: -8, task: 'standby', targetX: -5, targetY: -8 },
            tiago2: { x: -3, y: -8, task: 'standby', targetX: -3, targetY: -8 },
            tiago3: { x: -1, y: -8, task: 'standby', targetX: -1, targetY: -8 },
        },
        script: null, // will use FACTORY_MISSION_SCRIPT below
        videos: [
            { src: '/videos/factory_rescue.mp4', label: 'Webots factory fire rescue scenario' },
        ],
    },
};

/* ─── Factory Mission Script (Scenario 2) ─── */
const FACTORY_MISSION_SCRIPT = [
    { at: 0,  type: 'log', msg: '[SYSTEM] All units online — awaiting deployment' },
    { at: 0,  type: 'log', msg: '[SYSTEM] Sensors calibrated ✓' },
    { at: 0,  type: 'phase', phase: 'IDLE', intensity: 0 },
    { at: 3,  type: 'phase', phase: 'GAS_LEAK', intensity: 0.05 },
    { at: 3,  type: 'log', msg: '[SENSOR] ⚠ Gas leak detected near oil barrels — Zone B' },
    { at: 4,  type: 'log', msg: '[SENSOR] Elevated methane levels — 320 ppm' },
    { at: 4,  type: 'llm', msg: 'report_status("Gas leak confirmed. Initiating emergency protocol.")' },
    { at: 5,  type: 'phase', phase: 'GAS_LEAK', intensity: 0.1 },
    { at: 6,  type: 'log', msg: '[SYSTEM] Emergency protocol ALPHA initiated' },
    { at: 7,  type: 'phase', phase: 'IGNITION', intensity: 0.2 },
    { at: 7,  type: 'log', msg: '[FIRE] 🔥 Ignition confirmed at (8.5, 2.5)!' },
    { at: 8,  type: 'llm', msg: 'move_drone(8.5, 3.0, 3.0) — Scout fire zone from altitude' },
    { at: 8,  type: 'move', robot: 'mavic', target: { x: 8.5, y: 3.0 } },
    { at: 8,  type: 'task', robot: 'mavic', task: 'scout' },
    { at: 8,  type: 'log', msg: '[AI] Deploying Mavic for aerial reconnaissance' },
    { at: 9,  type: 'phase', phase: 'IGNITION', intensity: 0.3 },
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
    { at: 24, type: 'llm', msg: 'assign_task("tiago2", "rescue") — Robot reached injured person' },
    { at: 24, type: 'task', robot: 'tiago2', task: 'rescue' },
    { at: 24, type: 'log', msg: '[TIAGO2] 🚑 Reached injured person — initiating rescue' },
    { at: 25, type: 'phase', phase: 'FIRE_SPREAD', intensity: 0.06 },
    { at: 25, type: 'log', msg: '[TIAGO2] Victim vitals: pulse 72bpm — stable' },
    { at: 25, type: 'llm', msg: 'assign_task("tiago3", "scout") — Perimeter secured' },
    { at: 25, type: 'task', robot: 'tiago3', task: 'scout' },
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
SCENARIOS.factory.script = FACTORY_MISSION_SCRIPT;

const TASK_STYLES = {
    extinguish: { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
    rescue:     { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    scout:      { bg: 'rgba(59,130,246,0.15)',  text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
    standby:    { bg: 'rgba(136,153,176,0.1)',  text: '#8899b0', border: 'rgba(136,153,176,0.2)' },
};

/* ─── Custom Hook: Scenario-Aware Mission Engine ─── */
function useDummyMission(scenario) {
    const config = SCENARIOS[scenario];
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [firePhase, setFirePhase] = useState('IDLE');
    const [fireIntensity, setFireIntensity] = useState(0);
    const [robots, setRobots] = useState({ ...config.initialRobots });
    const [logs, setLogs] = useState([]);
    const [llmDecisions, setLlmDecisions] = useState([]);
    const [personRescued, setPersonRescued] = useState(false);
    const [missionComplete, setMissionComplete] = useState(false);
    const scriptIdxRef = useRef(0);
    const scriptRef = useRef(config.script);

    // When scenario changes, reset everything
    useEffect(() => {
        const cfg = SCENARIOS[scenario];
        scriptRef.current = cfg.script;
        setRunning(false);
        setElapsed(0);
        setFirePhase('IDLE');
        setFireIntensity(0);
        setRobots({ ...cfg.initialRobots });
        setLogs([]);
        setLlmDecisions([]);
        setPersonRescued(false);
        setMissionComplete(false);
        scriptIdxRef.current = 0;
    }, [scenario]);

    const reset = useCallback(() => {
        const cfg = SCENARIOS[scenario];
        setElapsed(0);
        setFirePhase('IDLE');
        setFireIntensity(0);
        setRobots({ ...cfg.initialRobots });
        setLogs([]);
        setLlmDecisions([]);
        setPersonRescued(false);
        setMissionComplete(false);
        scriptIdxRef.current = 0;
    }, [scenario]);

    const start = useCallback(() => { reset(); setRunning(true); }, [reset]);
    const stop  = useCallback(() => { setRunning(false); }, []);

    useEffect(() => {
        if (!running) return;
        const TICK = 200;
        const SPEED = { mavic: 3.0, tiago1: 1.8, tiago2: 1.8, tiago3: 1.8 };

        const interval = setInterval(() => {
            setElapsed(prev => {
                const next = prev + TICK / 1000;
                const currentScript = scriptRef.current;

                while (scriptIdxRef.current < currentScript.length) {
                    const evt = currentScript[scriptIdxRef.current];
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

                if (scriptIdxRef.current >= currentScript.length && next > 31) {
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
   MAIN COMPONENT — Command Center Layout
   ═══════════════════════════════════════════════ */

export default function Simulation() {
    const [scenario, setScenario] = useState('kitchen');
    const config = SCENARIOS[scenario];
    const mission = useDummyMission(scenario);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [manualRobot, setManualRobot] = useState('tiago1');
    const [manualAction, setManualAction] = useState('Move');
    const [manualX, setManualX] = useState('0');
    const [manualY, setManualY] = useState('0');

    const activeUnits = Object.values(mission.robots).filter(r => r.task !== 'standby').length;
    const totalUnits = Object.keys(mission.robots).length;

    const handleManualCommand = () => {
        const x = parseFloat(manualX) || 0;
        const y = parseFloat(manualY) || 0;
        const timeNow = mission.elapsed.toFixed(2);
        mission.llmDecisions.push({
            time: parseFloat(timeNow),
            msg: `Manual: ${manualAction.toLowerCase()} ${manualRobot} {"x":${x},"y":${y},"z":0.095}`,
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0b0f1a] text-white overflow-x-hidden">
            <div className="noise-overlay" />

            {/* ─── Header Bar ─── */}
            <header className="sticky top-0 z-50 bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link to="/" className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rescue-orange to-red-600 flex items-center justify-center">
                            <Flame className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-sm font-bold tracking-wide">
                            Rescu<span className="text-rescue-orange">Orch</span> v2 — <span className="text-gray-400 font-medium">Command Center</span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                        mission.running
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${mission.running ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                        {mission.running ? 'Connected' : 'Disconnected'}
                    </div>
                    <div className="text-sm font-mono text-gray-400 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                        T+ {formatTime(mission.elapsed)}
                    </div>
                </div>
            </header>

            {/* ─── Scenario Selector ─── */}
            <div className="px-4 md:px-6 pt-4 flex items-center gap-3">
                {Object.values(SCENARIOS).map(sc => (
                    <button
                        key={sc.id}
                        onClick={() => setScenario(sc.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border ${
                            scenario === sc.id
                                ? 'bg-rescue-orange/10 text-rescue-orange border-rescue-orange/30 shadow-lg shadow-rescue-orange/10'
                                : 'bg-white/[0.03] text-gray-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                        }`}
                    >
                        <span>{sc.icon}</span> {sc.shortLabel}
                    </button>
                ))}
                <div className="flex-1" />
                <span className="text-xs text-gray-500 font-mono">{config.description}</span>
            </div>

            {/* ─── Status Cards Row ─── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6 py-4">
                <StatusCard
                    icon="🔥"
                    value={mission.firePhase === 'IDLE' ? 'UNKNOWN' : mission.firePhase.replace('_', ' ')}
                    label="FIRE PHASE"
                    color={mission.firePhase === 'FIRE_SPREAD' || mission.firePhase === 'IGNITION' ? 'red' : mission.firePhase === 'EXTINGUISHED' ? 'green' : 'gray'}
                    progress={mission.fireIntensity}
                />
                <StatusCard
                    icon="🤖"
                    value={`${activeUnits} / ${totalUnits}`}
                    label="ACTIVE UNITS"
                    color="blue"
                />
                <StatusCard
                    icon="🧑"
                    value={mission.personRescued ? 'RESCUED' : 'NOT RESCUED'}
                    label="INJURED PERSON"
                    color={mission.personRescued ? 'green' : 'red'}
                    alert={!mission.personRescued}
                />
                <StatusCard
                    icon="🚀"
                    value={mission.missionComplete ? 'COMPLETE' : mission.running ? 'ACTIVE' : 'STANDBY'}
                    label="MISSION STATUS"
                    color={mission.missionComplete ? 'green' : mission.running ? 'green' : 'gray'}
                />
            </div>

            {/* ─── Main Content: Factory Floor + Sidebar ─── */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 px-4 md:px-6 pb-4">
                {/* Factory Floor Live View */}
                <div className="cc-panel relative min-h-[500px]">
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        <span className="text-base">{config.icon}</span>
                        <span className="text-xs font-bold tracking-wide text-gray-300">{config.mapLabel}</span>
                    </div>
                    <div className="absolute top-4 right-4 z-10 text-[11px] font-mono text-gray-500">
                        x: {mousePos.x.toFixed(1)} y: {mousePos.y.toFixed(1)}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-6 pt-12">
                        {scenario === 'kitchen' ? (
                            <KitchenMap
                                robots={mission.robots}
                                fireIntensity={mission.fireIntensity}
                                firePhase={mission.firePhase}
                                personRescued={mission.personRescued}
                                onMouseMove={setMousePos}
                                config={config}
                            />
                        ) : (
                            <FactoryMap
                                robots={mission.robots}
                                fireIntensity={mission.fireIntensity}
                                firePhase={mission.firePhase}
                                personRescued={mission.personRescued}
                                onMouseMove={setMousePos}
                                config={config}
                            />
                        )}
                    </div>
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4">
                        <LegendDot color="#3b82f6" label="Drone" />
                        <LegendDot color="#22c55e" label="TIAGo" />
                        <LegendDot color="#f97316" label="Fire" />
                        <LegendDot color="#a855f7" label="Injured" />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col gap-4">
                    {/* Mission Control */}
                    <div className="cc-panel p-5">
                        <h2 className="cc-section-title mb-4">
                            <span className="text-base">🚀</span> Mission Control
                        </h2>
                        <div className="flex gap-3">
                            {!mission.running && !mission.missionComplete && (
                                <button
                                    onClick={mission.start}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20"
                                >
                                    <Play size={14} className="fill-current" /> START MISSION
                                </button>
                            )}
                            {mission.running && (
                                <button
                                    onClick={mission.start}
                                    className="flex-1 bg-green-600/50 text-green-300 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default"
                                    disabled
                                >
                                    <Play size={14} className="fill-current" /> RUNNING...
                                </button>
                            )}
                            {mission.missionComplete && (
                                <button
                                    onClick={mission.reset}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                >
                                    ↻ RESTART
                                </button>
                            )}
                            <button
                                onClick={mission.stop}
                                disabled={!mission.running}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                    mission.running
                                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                                        : 'bg-red-900/30 text-red-400/40 cursor-not-allowed'
                                }`}
                            >
                                <Square size={12} /> STOP
                            </button>
                        </div>
                    </div>

                    {/* Robot Fleet */}
                    <div className="cc-panel p-5 flex-1 overflow-hidden flex flex-col min-h-0">
                        <h2 className="cc-section-title mb-3">
                            <span className="text-base">🤖</span> Robot Fleet
                        </h2>
                        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                            {Object.entries(mission.robots).map(([rid, r]) => {
                                const meta = config.robots[rid] || { label: rid, icon: '🤖', color: '#888' };
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

                    {/* Manual Command */}
                    <div className="cc-panel p-5">
                        <h2 className="cc-section-title mb-4">
                            <Gamepad2 size={14} className="text-blue-400" /> Manual Command
                        </h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={manualRobot}
                                    onChange={e => setManualRobot(e.target.value)}
                                    className="cc-select"
                                >
                                    {Object.entries(config.robots).map(([rid, meta]) => (
                                        <option key={rid} value={rid}>{meta.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={manualAction}
                                    onChange={e => setManualAction(e.target.value)}
                                    className="cc-select"
                                >
                                    <option value="Move">Move</option>
                                    <option value="Scout">Scout</option>
                                    <option value="Extinguish">Extinguish</option>
                                    <option value="Rescue">Rescue</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    value={manualX}
                                    onChange={e => setManualX(e.target.value)}
                                    placeholder="X"
                                    className="cc-input"
                                />
                                <input
                                    type="number"
                                    value={manualY}
                                    onChange={e => setManualY(e.target.value)}
                                    placeholder="Y"
                                    className="cc-input"
                                />
                            </div>
                            <button
                                onClick={handleManualCommand}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                <Send size={12} /> SEND COMMAND
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── LLM Decision Feed ─── */}
            <div className="px-4 md:px-6 pb-4">
                <LLMFeedCard decisions={mission.llmDecisions} logs={mission.logs} />
            </div>

            {/* ─── Video Section ─── */}
            <div className="px-4 md:px-6 pb-6">
                <div className="cc-panel p-5">
                    <h2 className="cc-section-title mb-4">
                        <Video size={14} className="text-rescue-orange" /> Simulation Recordings — {config.shortLabel}
                    </h2>
                    <div className={`grid gap-4 ${config.videos.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                        {config.videos.map((vid, i) => (
                            <div key={vid.src}>
                                <div className="w-full aspect-video bg-[#0a0e17] rounded-xl border border-white/[0.06] overflow-hidden">
                                    <video
                                        className="w-full h-full object-cover rounded-xl"
                                        controls
                                    >
                                        <source src={vid.src} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <p className="text-[11px] text-gray-600 mt-2 text-center font-mono">
                                    {vid.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

function StatusCard({ icon, value, label, color, progress, alert }) {
    const colorStyles = {
        red:   { border: 'border-red-500/20', text: 'text-red-400', bg: 'bg-red-500/5' },
        green: { border: 'border-green-500/20', text: 'text-green-400', bg: 'bg-green-500/5' },
        blue:  { border: 'border-blue-500/20', text: 'text-blue-400', bg: 'bg-blue-500/5' },
        gray:  { border: 'border-white/[0.06]', text: 'text-gray-300', bg: 'bg-white/[0.02]' },
    };
    const cs = colorStyles[color] || colorStyles.gray;

    return (
        <div className={`cc-panel p-4 ${cs.border} flex items-start gap-3`}>
            <span className="text-2xl mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <div className={`text-lg font-extrabold tracking-tight ${cs.text} flex items-center gap-2`}>
                    {alert && <span className="text-yellow-400 text-sm">⚠</span>}
                    {value}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-semibold">{label}</div>
                {progress !== undefined && progress > 0 && (
                    <div className="mt-2 w-full bg-white/[0.04] h-1 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600"
                            animate={{ width: `${progress * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function LegendDot({ color, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-400 font-medium">{label}</span>
        </div>
    );
}

function FactoryMap({ robots, fireIntensity, firePhase, personRescued, onMouseMove, config }) {
    const svgRef = useRef(null);
    const fireR = fireIntensity * 1.8;
    const showFire = firePhase !== 'IDLE' && firePhase !== 'EXTINGUISHED';
    const FIRE_POS = config.firePos;
    const INJURED_POS = config.injuredPos;

    const handleMouseMove = useCallback((e) => {
        if (!svgRef.current || !onMouseMove) return;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
        onMouseMove({ x: svgPt.x, y: svgPt.y });
    }, [onMouseMove]);

    return (
        <svg
            ref={svgRef}
            viewBox="-10.5 -13 21.5 17.5"
            className="w-full h-full max-w-none"
            style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.3))' }}
            onMouseMove={handleMouseMove}
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
                const meta = config.robots[rid] || { label: rid, icon: '🤖', color: '#888' };
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

function KitchenMap({ robots, fireIntensity, firePhase, personRescued, onMouseMove, config }) {
    const svgRef = useRef(null);
    const fireR = fireIntensity * 1.8;
    const showFire = firePhase !== 'IDLE' && firePhase !== 'EXTINGUISHED';
    const FIRE_POS = config.firePos;
    const INJURED_POS = config.injuredPos;

    const handleMouseMove = useCallback((e) => {
        if (!svgRef.current || !onMouseMove) return;
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
        onMouseMove({ x: svgPt.x, y: svgPt.y });
    }, [onMouseMove]);

    return (
        <svg
            ref={svgRef}
            viewBox="-10 -8 20 16"
            className="w-full h-full max-w-none"
            style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.3))' }}
            onMouseMove={handleMouseMove}
        >
            {/* Background */}
            <rect x="-10" y="-8" width="20" height="16" fill="#0a0e17" rx="0.3" />
            {/* Room outline */}
            <rect x="-9" y="-7" width="18" height="14" fill="none" stroke="#293548" strokeWidth="0.12" rx="0.1" />
            {/* Grid */}
            <g stroke="#1a2236" strokeWidth="0.03">
                <line x1="-9" y1="0" x2="9" y2="0" />
                <line x1="-9" y1="-3.5" x2="9" y2="-3.5" />
                <line x1="-9" y1="3.5" x2="9" y2="3.5" />
                <line x1="-4.5" y1="-7" x2="-4.5" y2="7" />
                <line x1="0" y1="-7" x2="0" y2="7" />
                <line x1="4.5" y1="-7" x2="4.5" y2="7" />
            </g>

            {/* Stove */}
            <rect x="1.5" y="-3.5" width="3.5" height="2.5" rx="0.15" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" strokeWidth="0.05" />
            <text x="3.25" y="-3.8" fontSize="0.35" fill="#8899b0" textAnchor="middle" fontFamily="Inter, sans-serif">Stove</text>
            {/* Burners */}
            <circle cx="2.3" cy="-2.8" r="0.3" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="0.04" />
            <circle cx="3.5" cy="-2.8" r="0.3" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="0.04" />
            <circle cx="2.3" cy="-1.8" r="0.3" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="0.04" />
            <circle cx="3.5" cy="-1.8" r="0.3" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="0.04" />

            {/* Counter */}
            <rect x="5.5" y="-6.5" width="3" height="6" rx="0.1" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.1)" strokeWidth="0.04" />
            <text x="7" y="-6.8" fontSize="0.3" fill="#556677" textAnchor="middle" fontFamily="Inter, sans-serif">Counter</text>

            {/* Sink */}
            <rect x="5.8" y="-5.5" width="2.2" height="1.2" rx="0.1" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.15)" strokeWidth="0.04" />
            <text x="6.9" y="-4.6" fontSize="0.25" fill="#556677" textAnchor="middle" fontFamily="Inter, sans-serif">Sink</text>

            {/* Fridge */}
            <rect x="-8.5" y="-6.5" width="2" height="3" rx="0.15" fill="rgba(148,163,184,0.06)" stroke="rgba(148,163,184,0.15)" strokeWidth="0.05" />
            <text x="-7.5" y="-6.8" fontSize="0.3" fill="#556677" textAnchor="middle" fontFamily="Inter, sans-serif">Fridge</text>

            {/* Dining Table */}
            <rect x="-6" y="0.5" width="4" height="2.5" rx="0.15" fill="rgba(168,85,247,0.04)" stroke="rgba(168,85,247,0.1)" strokeWidth="0.04" />
            <text x="-4" y="0.2" fontSize="0.35" fill="#556677" textAnchor="middle" fontFamily="Inter, sans-serif">Dining Table</text>
            {/* Chairs */}
            <rect x="-6.3" y="1.0" width="0.2" height="0.6" rx="0.05" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.1)" strokeWidth="0.02" />
            <rect x="-6.3" y="2.0" width="0.2" height="0.6" rx="0.05" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.1)" strokeWidth="0.02" />
            <rect x="-1.9" y="1.0" width="0.2" height="0.6" rx="0.05" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.1)" strokeWidth="0.02" />
            <rect x="-1.9" y="2.0" width="0.2" height="0.6" rx="0.05" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.1)" strokeWidth="0.02" />

            {/* Kitchen island */}
            <rect x="-1.5" y="-5" width="2.5" height="1.5" rx="0.1" fill="rgba(255,255,255,0.03)" stroke="#293548" strokeWidth="0.04" />
            <text x="-0.25" y="-5.3" fontSize="0.28" fill="#556677" textAnchor="middle" fontFamily="Inter, sans-serif">Island</text>

            {/* Door */}
            <rect x="-9.1" y="2.5" width="0.2" height="1.5" fill="rgba(99,102,241,0.3)" rx="0.05" />
            <text x="-8.3" y="3.5" fontSize="0.3" fill="#556677" fontFamily="Inter, sans-serif">Door</text>

            {/* Window */}
            <rect x="8.9" y="-4" width="0.2" height="2" fill="rgba(147,197,253,0.3)" rx="0.05" />
            <text x="8.0" y="-2.2" fontSize="0.25" fill="#556677" fontFamily="Inter, sans-serif">Window</text>

            {/* Fire */}
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

            {/* Injured person */}
            <g opacity={personRescued ? 0.3 : 1}>
                <circle cx={INJURED_POS.x} cy={INJURED_POS.y} r="0.35" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="0.06" strokeDasharray="0.1,0.08">
                    {!personRescued && <animate attributeName="r" values="0.35;0.5;0.35" dur="2s" repeatCount="indefinite" />}
                </circle>
                <text x={INJURED_POS.x} y={INJURED_POS.y + 0.15} fontSize="0.55" textAnchor="middle">🧑</text>
                <text x={INJURED_POS.x} y={INJURED_POS.y - 0.5} fontSize="0.3" fill={personRescued ? '#22c55e' : '#a855f7'} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600">
                    {personRescued ? 'Rescued ✓' : 'Injured'}
                </text>
            </g>

            {/* Robots */}
            {Object.entries(robots).map(([rid, r]) => {
                const meta = config.robots[rid] || { label: rid, icon: '🤖', color: '#888' };
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

            <text x="-8.8" y="6.8" fontSize="0.22" fill="#293548" fontFamily="JetBrains Mono, monospace">(-9, 7)</text>
            <text x="7" y="6.8" fontSize="0.22" fill="#293548" fontFamily="JetBrains Mono, monospace">(9, 7)</text>
            <text x="-8.8" y="-6.7" fontSize="0.22" fill="#293548" fontFamily="JetBrains Mono, monospace">(-9, -7)</text>
        </svg>
    );
}

function LLMFeedCard({ decisions, logs }) {
    const scrollRef = useRef(null);
    const allEntries = [
        ...logs.map(l => ({ time: l.time, msg: l.msg, type: 'log' })),
        ...decisions.map(d => ({ time: d.time, msg: d.msg, type: 'llm' })),
    ].sort((a, b) => b.time - a.time);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [allEntries.length]);

    return (
        <div className="cc-panel p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="cc-section-title">
                    <span className="w-3 h-3 rounded-full bg-rescue-orange inline-block" />
                    <span>LLM Decision Feed</span>
                </h2>
                <span className="text-xs text-gray-500 font-mono">{decisions.length} decisions</span>
            </div>
            <div ref={scrollRef} className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {allEntries.length === 0 && (
                    <div className="text-gray-600 text-center py-6 text-sm">Waiting for mission start...</div>
                )}
                {allEntries.map((entry, i) => {
                    const isLLM = entry.type === 'llm';
                    const isManual = entry.msg.includes('Manual');
                    return (
                        <div
                            key={i}
                            className={`px-4 py-3 rounded-xl border transition-all ${
                                isLLM
                                    ? 'bg-rescue-orange/[0.06] border-rescue-orange/20'
                                    : 'bg-white/[0.02] border-white/[0.04]'
                            }`}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-[11px] font-mono text-gray-500 shrink-0 mt-0.5">
                                    {formatTimestamp(entry.time)}
                                </span>
                                <span className={`text-sm ${isLLM ? 'text-gray-200 font-semibold' : 'text-gray-400'}`}>
                                    {isManual && <span className="text-rescue-orange font-bold">Manual → </span>}
                                    {isLLM && !isManual && <span className="text-rescue-orange font-bold">AI → </span>}
                                    {entry.msg}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Helpers ─── */

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function formatTimestamp(s) {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${h}:${min}:${sec}`;
}
