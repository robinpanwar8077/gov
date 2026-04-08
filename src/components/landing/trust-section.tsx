"use client";

import { ClipboardCheck, UserCheck, Network, ShieldCheck } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function TrustComplianceSection() {
    const points = [
        { icon: ClipboardCheck, label: "Compliance-driven onboarding", color: "#10b981" },
        { icon: UserCheck, label: "Verified profiles only", color: "#0047AB" },
        { icon: Network, label: "Transparent connections", color: "#10b981" }
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
            transition: { duration: 0.5 }
        }
    };

    return (
        <section className="py-20 md:py-24 bg-[#0a1122] relative overflow-hidden text-center">
            <div className="container mx-auto px-6 sm:px-10">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="mb-16 md:mb-20"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/[0.03] border border-white/5 text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                        <ShieldCheck className="h-4 w-4 text-[#10b981]" />
                        Our Foundation
                    </motion.div>
                    <motion.h2 variants={itemVariants} className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 sm:mb-8 leading-tight">
                        Trust & Compliance First
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                        In an ecosystem built on trust, we provide the ultimate verification layer for every partner.
                    </motion.p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="flex flex-wrap justify-center gap-8 sm:gap-16 md:gap-24 mb-16 md:mb-24"
                >
                    {points.map((item, i) => (
                        <motion.div 
                            key={i} 
                            variants={itemVariants}
                            className="flex flex-col items-center group min-w-[140px]"
                        >
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:bg-white/[0.04]">
                                <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-white/40" />
                            </div>
                            <span className="mt-4 sm:mt-6 font-bold text-base sm:text-lg text-slate-400 tracking-tight group-hover:text-white transition-colors px-2">
                                {item.label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.02] p-8 sm:p-14 max-w-4xl mx-auto border border-white/5 backdrop-blur-sm relative overflow-hidden text-left"
                >
                    <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-linear-to-b from-[#10b981] to-[#0047AB]" />
                    <p className="text-base sm:text-xl md:text-2xl text-slate-300 font-medium italic leading-relaxed tracking-tight">
                        "GovProNet is a private B2B platform built for GeM ecosystem participants and is <span className="text-[#10b981] underline decoration-white/10 underline-offset-4">not affiliated</span> with any government authority."
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
