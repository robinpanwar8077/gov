"use client";

import { Building2, Users, Briefcase, ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

export function AudienceSection() {
    const roles = [
        {
            icon: Users,
            title: "GeM Vendors",
            description: "Get verified OEM access & real government business opportunities.",
            link: "/signup?role=vendor",
            linkText: "Join as Vendor",
            color: "#10b981"
        },
        {
            icon: Building2,
            title: "OEMs",
            description: "OEMs Looking for Serious & Active GeM Vendors Across India",
            link: "/signup?role=oem",
            linkText: "Join as OEM",
            color: "#0047AB"
        },
        {
            icon: Briefcase,
            title: "Government Consultants",
            description: "Work within a trusted, transparent, verification-based ecosystem.",
            link: "/signup?role=consultant",
            linkText: "Join as Consultant",
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
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
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
                    className="mb-16 md:mb-24"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 sm:mb-8 leading-tight">
                        Who Is This For?
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed px-4 sm:px-0">
                        GovProNet connects verified vendors, trusted OEMs, and compliant consultants on one secure, transparent platform.
                    </motion.p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto"
                >
                    {roles.map((role, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className="flex flex-col items-center md:items-start p-10 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm group hover:bg-white/[0.04] transition-all relative overflow-hidden shadow-2xl text-center md:text-left"
                        >
                            {/* Premium Hover Glow */}
                            <div className="absolute -inset-24 bg-radial-gradient from-[#0047AB]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-[40px]" />
                            
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#050b1a] flex items-center justify-center mb-8 sm:mb-10 border border-white/5 shadow-inner transition-all group-hover:scale-110 group-hover:border-[#10b981]/20 relative z-10 mx-auto md:mx-0">
                                <role.icon className="h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-500 group-hover:rotate-6" style={{ color: role.color }} />
                            </div>
                            
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight group-hover:text-[#10b981] transition-colors relative z-10">
                                {role.title}
                            </h3>
                            
                            <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium mb-8 sm:mb-10 relative z-10 group-hover:text-slate-300 transition-colors px-2 sm:px-0">
                                {role.description}
                            </p>

                            <Link 
                                href={role.link} 
                                className="inline-flex items-center gap-2 text-[#0047AB] font-bold text-lg hover:text-[#10b981] transition-colors relative z-10 group/link mt-auto"
                            >
                                {role.linkText}
                                <ArrowRight className="h-5 w-5 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
