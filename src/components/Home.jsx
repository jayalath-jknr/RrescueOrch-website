
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Zap, Bot, BrainCircuit, Play,
    Radio, Cpu, Flame, ArrowRight, ChevronDown,
    Clock, Target, Users, Radar
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center">
            {/* ── Hero Section ────────────────────────────── */}
            <section className="relative w-full min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden hero-bg">
                {/* Animated grid background */}
                <div className="absolute inset-0 hero-grid animate-grid-fade" />

                {/* Radial glow accent */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-rescue-orange/[0.04] blur-[120px] pointer-events-none" />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="z-10 max-w-4xl"
                >
                    {/* Tag */}
                    <motion.div variants={fadeUp} custom={0} className="flex items-center justify-center mb-8">
                        <span className="tag-pill">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Next-Gen Emergency Response
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeUp}
                        custom={1}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight"
                    >
                        Autonomous Rescue
                        <br />
                        <span className="gradient-text">Orchestrated by AI</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={fadeUp}
                        custom={2}
                        className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Deploy intelligent swarms of drones and ground robots to save lives
                        in hazardous environments.{' '}
                        <span className="text-gray-300 font-medium">Zero human risk. Maximum efficiency.</span>
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/simulation')}
                            className="btn-shimmer bg-rescue-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-base transition-all transform hover:scale-[1.03] active:scale-[0.98] glow flex items-center justify-center gap-2.5"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Launch Simulation
                        </button>
                        <button className="glass px-8 py-4 rounded-full font-semibold text-base transition-all hover:bg-white/[0.06] flex items-center justify-center gap-2.5 text-gray-300 hover:text-white">
                            <Radio className="w-4 h-4" />
                            Watch Demo
                        </button>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-10 z-10"
                >
                    <ChevronDown className="w-5 h-5 text-gray-500 animate-bounce" />
                </motion.div>
            </section>

            {/* ── Stats Strip ─────────────────────────────── */}
            <section className="w-full border-y border-white/[0.04] bg-rescue-surface">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={stagger}
                    className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.04]"
                >
                    <StatItem icon={<Clock className="w-4 h-4" />} value="<30s" label="Deployment Time" delay={0} />
                    <StatItem icon={<Target className="w-4 h-4" />} value="99.2%" label="Detection Accuracy" delay={1} />
                    <StatItem icon={<Bot className="w-4 h-4" />} value="12+" label="Robot Agents" delay={2} />
                    <StatItem icon={<Users className="w-4 h-4" />} value="0" label="Humans at Risk" delay={3} />
                </motion.div>
            </section>

            {/* ── Features Section ────────────────────────── */}
            <section className="py-28 px-4 w-full max-w-7xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.p variants={fadeUp} className="tag-pill mb-4 mx-auto">
                        <Cpu className="w-3.5 h-3.5" /> Core Capabilities
                    </motion.p>
                    <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Built for the unthinkable
                    </motion.h2>
                    <motion.p variants={fadeUp} custom={2} className="text-gray-400 text-lg max-w-xl mx-auto">
                        A fully autonomous pipeline from fire detection to victim extraction.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <FeatureCard
                        icon={<BrainCircuit className="w-8 h-8" />}
                        color="purple"
                        title="Gemini AI Core"
                        desc="LLM-driven decision making adapts to dynamic fire conditions in real-time, generating optimal rescue strategies."
                        delay={0}
                    />
                    <FeatureCard
                        icon={<Bot className="w-8 h-8" />}
                        color="blue"
                        title="Multi-Robot Swarm"
                        desc="Coordinated TIAGo robots and Mavic drones working in seamless synchronization across complex environments."
                        delay={1}
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8" />}
                        color="yellow"
                        title="Instant Response"
                        desc="Deploys in under 30 seconds upon alarm trigger. Every second counts when lives are at stake."
                        delay={2}
                    />
                </motion.div>
            </section>

            {/* ── How It Works ────────────────────────────── */}
            <div className="section-divider w-full max-w-5xl" />

            <section className="py-28 px-4 w-full max-w-7xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={stagger}
                    className="text-center mb-20"
                >
                    <motion.p variants={fadeUp} className="tag-pill mb-4 mx-auto">
                        <Radar className="w-3.5 h-3.5" /> Pipeline
                    </motion.p>
                    <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        How it works
                    </motion.h2>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                    <StepCard step="01" title="Detect" desc="Thermal and visual sensors detect fire and hazardous conditions." icon={<Flame className="w-5 h-5" />} delay={0} />
                    <StepCard step="02" title="Analyze" desc="Gemini AI processes sensor data to map threats and locate victims." icon={<BrainCircuit className="w-5 h-5" />} delay={1} />
                    <StepCard step="03" title="Deploy" desc="Swarm robots receive coordinated task assignments in real-time." icon={<Radio className="w-5 h-5" />} delay={2} />
                    <StepCard step="04" title="Rescue" desc="Autonomous extraction and medical triage with zero human exposure." icon={<ShieldCheck className="w-5 h-5" />} delay={3} />
                </motion.div>
            </section>

            {/* ── CTA Section ─────────────────────────────── */}
            <section className="w-full py-28 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-rescue-dark via-rescue-surface to-rescue-dark" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rescue-orange/[0.05] blur-[150px] pointer-events-none" />

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="relative z-10 max-w-3xl mx-auto text-center"
                >
                    <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
                        Ready to see it in action?
                    </motion.h2>
                    <motion.p variants={fadeUp} custom={1} className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                        Launch the interactive simulation and watch the swarm respond to a live fire scenario.
                    </motion.p>
                    <motion.div variants={fadeUp} custom={2}>
                        <button
                            onClick={() => navigate('/simulation')}
                            className="btn-shimmer bg-rescue-orange hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-base transition-all transform hover:scale-[1.03] active:scale-[0.98] glow inline-flex items-center gap-2.5"
                        >
                            Open Mission Control
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
}

/* ── Sub-components ── */

function StatItem({ icon, value, label, delay }) {
    return (
        <motion.div
            variants={fadeUp}
            custom={delay}
            className="flex flex-col items-center py-10 px-6 gap-2"
        >
            <div className="flex items-center gap-2 text-rescue-orange mb-1">{icon}</div>
            <span className="stat-value">{value}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">{label}</span>
        </motion.div>
    );
}

function FeatureCard({ icon, color, title, desc, delay }) {
    const colorMap = {
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'hover:border-purple-500/20' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'hover:border-blue-500/20' },
        yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'hover:border-yellow-500/20' },
    };
    const c = colorMap[color] || colorMap.purple;

    return (
        <motion.div
            variants={fadeUp}
            custom={delay}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className={`glass p-8 flex flex-col items-start gap-5 ${c.border} transition-colors cursor-default`}
        >
            <div className={`p-3 rounded-xl ${c.bg}`}>
                <div className={c.text}>{icon}</div>
            </div>
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-[15px]">{desc}</p>
        </motion.div>
    );
}

function StepCard({ step, title, desc, icon, delay }) {
    return (
        <motion.div
            variants={fadeUp}
            custom={delay}
            className="relative glass p-8 flex flex-col gap-4 group hover:border-rescue-orange/20 transition-colors"
        >
            <div className="flex items-center justify-between">
                <span className="text-5xl font-extrabold text-white/[0.04] leading-none select-none">{step}</span>
                <div className="p-2 rounded-lg bg-rescue-orange/10 text-rescue-orange group-hover:bg-rescue-orange/20 transition-colors">
                    {icon}
                </div>
            </div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
}
