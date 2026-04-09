"use client";

import { Star, Quote } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function TestimonialsSection() {
    const testimonials = [
        {
            role: "Vendor",
            location: "Pune",
            text: "Within 30 days, I got access to genuine OEMs and started receiving real inquiries. This platform solved my biggest GeM problem.",
            author: "GeM Vendor"
        },
        {
            role: "OEM",
            location: "Delhi",
            text: "Finally found serious and verified vendors. No time waste, no fake inquiries. Highly recommended.",
            author: "OEM Partner"
        },
        {
            role: "Consultant",
            location: "",
            text: "Working in a trusted ecosystem makes a huge difference. Clients are genuine and long-term.",
            author: "GeM Consultant"
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
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <section className="py-20 md:py-24 bg-[#050b1a] relative overflow-hidden">
            {/* Subtle Royal Blue Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0047AB]/5 blur-[120px] rounded-full -z-10" />
            
            <div className="container mx-auto px-6 sm:px-10">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="text-center mb-16 md:mb-20"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                        What Our Vendors Say
                    </motion.h2>
                    <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Trusted by professionals across the government procurement landscape.
                    </motion.p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {testimonials.map((item, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -8 }}
                            className="p-8 sm:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm relative group overflow-hidden"
                        >
                            <Quote className="absolute top-8 right-8 h-10 w-10 text-white/5 group-hover:text-[#10b981]/10 transition-colors" />
                            
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-[#facc15] text-[#facc15]" />
                                ))}
                            </div>

                            <p className="text-white text-lg sm:text-xl leading-relaxed font-medium mb-8 relative z-10 italic">
                                "{item.text}"
                            </p>
                            
                            <div className="mt-auto border-t border-white/5 pt-6">
                                <p className="text-[#10b981] font-bold text-lg mb-1">
                                    — {item.author}{item.location ? `, ${item.location}` : ""}
                                </p>
                                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
                                    {item.role}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
