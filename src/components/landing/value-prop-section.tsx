"use client";

import { ShieldCheck, Zap, Handshake } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function ValuePropSection() {
    const cards = [
        {
            icon: ShieldCheck,
            title: "Verified OEM Authorization",
            description: "Genuine OEMs. No fake commitments. No middlemen confusion.",
            color: "#0047AB"
        },
        {
            icon: Handshake,
            title: "Trusted Vendor–OEM Networking",
            description: "Connect with verified vendors, OEMs & consultants in one secure ecosystem.",
            color: "#10b981"
        },
        {
            icon: Zap,
            title: "Built for GeM & PSU Business",
            description: "Designed keeping GeM, PSU & government procurement realities in mind.",
            color: "#0047AB"
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
        <section className="py-20 md:py-24 bg-[#050b1a] relative overflow-hidden text-center">
            <div className="container mx-auto px-6 sm:px-10">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="mb-16 md:mb-20"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        What GovProNet Does
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed px-4 sm:px-0">
                        Simplifying the complex world of Government Procurement.
                    </motion.p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
                >
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -10, scale: 1.01 }}
                            className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.04] text-center group relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-linear-to-b from-[#10b981]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0a1122] flex items-center justify-center mb-8 sm:mb-10 mx-auto border border-white/5 shadow-inner transition-all group-hover:scale-110 group-hover:border-[#10b981]/30 group-hover:shadow-[#10b981]/10">
                                <card.icon className="h-8 w-8 sm:h-10 sm:w-10 transition-colors" style={{ color: card.color }} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 tracking-tight relative z-10 transition-colors group-hover:text-[#10b981]">
                                {card.title}
                            </h3>
                            <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium relative z-10 px-2 sm:px-0">
                                {card.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
