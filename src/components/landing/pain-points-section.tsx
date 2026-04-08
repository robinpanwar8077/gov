"use client";

import { XCircle, AlertCircle, TrendingDown } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function PainPointsSection() {
    const points = [
        {
            icon: XCircle,
            description: "GeM pe registered ho, par orders nahi mil rahe?",
        },
        {
            icon: AlertCircle,
            description: "OEM authorization lene me confusion ya scam ka darr?",
        },
        {
            icon: TrendingDown,
            description: "Consultants pe trust karna mushkil ho gaya?",
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <section className="py-20 md:py-24 bg-[#050b1a] relative overflow-hidden">
            <div className="container mx-auto px-6 sm:px-10">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="text-center mb-16 md:mb-20"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        Still Struggling on GeM?
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed px-4 sm:px-0">
                        You're not alone. Most sellers face the same invisible roadblocks — and that's exactly what GovProNet was built to fix.
                    </motion.p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 md:mb-20"
                >
                    {points.map((point, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -10, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm shadow-xl flex flex-col items-center text-center group cursor-default relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-8 sm:mb-10 mx-auto border border-white/5 transition-all group-hover:bg-[#ef4444]/10 group-hover:border-[#ef4444]/20">
                                <XCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-500/60 transition-colors group-hover:text-red-500" />
                            </div>
                            <p className="text-lg sm:text-xl text-slate-200 leading-relaxed font-bold relative z-10 transition-colors group-hover:text-white px-2">
                                {point.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl relative"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-1 bg-[#10b981] rounded-b-full shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-[#0047AB] to-[#10b981] bg-clip-text text-transparent leading-tight sm:leading-snug tracking-tight">
                        GovProNet builds trust, compliance, and verified connections — so you can finally win government business with confidence.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
