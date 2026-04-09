"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
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
        <section className="py-24 md:py-32 bg-[#050b1a] text-white relative overflow-hidden isolate text-center">
            {/* Soft, Premium Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-[#0047AB]/5 rounded-full blur-[80px] md:blur-[120px] -z-10" />
            <div className="absolute inset-0 bg-dot-grid opacity-20 -z-20" />
            
            <div className="container mx-auto px-6 sm:px-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={containerVariants}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/5 px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#10b981] mb-8 sm:mb-10">
                        <Sparkles className="h-4 w-4 fill-[#10b981]" />
                        <span>Limited Spots Available</span>
                    </motion.div>
                    
                    <motion.h2 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                        Ready to Modernize Your <br className="hidden sm:block" />
                        <span className="text-[#10b981]">GeM Procurement?</span>
                    </motion.h2>
                    
                    <motion.p variants={itemVariants} className="mx-auto mt-6 sm:mt-8 max-w-xl text-lg sm:text-xl text-slate-400 leading-relaxed font-medium mb-4 px-4 sm:px-0">
                        Join 1500+ verified GeM participants scaling their government business with trusted connections.
                    </motion.p>

                    <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-xl sm:text-2xl font-bold text-[#10b981] leading-relaxed mb-10 sm:mb-12 px-4 sm:px-0 italic">
                        "This is not just a platform — this is your GeM Business Growth Network."
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-6 sm:px-0">
                        <Button
                            size="lg"
                            className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white shadow-lg transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto"
                            asChild
                        >
                            <Link href="/signup">
                                Start Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/5 transition-all backdrop-blur-sm w-full sm:w-auto"
                            asChild
                        >
                            <Link href="/directory">
                                Explore the Network
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
