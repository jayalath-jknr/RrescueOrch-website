
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Bot, BrainCircuit, Play } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="relative w-full h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden hero-bg">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542382257-80dedb725088?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10 max-w-4xl"
                >
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <ShieldCheck className="w-8 h-8 text-rescue-orange" />
                        <span className="text-rescue-accent tracking-[0.2em] font-bold text-sm uppercase">Next-Gen Emergency Response</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Autonomous Rescue <br />
                        <span className="gradient-text">Orchestrated by AI</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
                        Deploy intelligent swarms of drones and robots to save lives in hazardous environments. Zero human risk. Maximum efficiency.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/simulation')}
                            className="bg-rescue-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl glow flex items-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Launch Simulation
                        </button>
                        <button className="glass px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/10 flex items-center gap-2">
                            Watch Demo
                        </button>
                    </div>
                </motion.div>

                {/* Animated Particles/Grid could go here */}
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 w-full max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<BrainCircuit className="w-10 h-10 text-purple-400" />}
                        title="Gemini AI Core"
                        desc="LLM-driven decision making adapts to dynamic fire conditions in real-time."
                    />
                    <FeatureCard
                        icon={<Bot className="w-10 h-10 text-blue-400" />}
                        title="Multi-Robot Swarm"
                        desc="Coordinated TIAGo robots and Mavic drones working in seamless synchronization."
                    />
                    <FeatureCard
                        icon={<Zap className="w-10 h-10 text-yellow-400" />}
                        title="Instant Response"
                        desc="Wait for nothing. Deploys under 30 seconds upon alarm trigger."
                    />
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass p-8 flex flex-col items-start gap-4 hover:border-rescue-orange/30 transition-colors"
        >
            <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}
