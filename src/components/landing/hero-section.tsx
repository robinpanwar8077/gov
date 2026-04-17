"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const headingWords = "India's Most Trusted Growth Network for".split(" ");

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-24 min-h-[70vh] flex flex-col items-center justify-start bg-[#050b1a]">
      {/* Decent Premium Background */}
      <div className="absolute inset-0 -z-10 bg-dot-grid opacity-20" />
      
      {/* Subtle Royal Blue Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#0047AB]/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 sm:px-10 flex flex-col items-center text-center relative z-10"
      >
        {/* Minimalist Badge */}
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 sm:px-5 sm:py-2 t text-[12px] sm:text-sm font-medium text-slate-300 backdrop-blur-sm mb-10 sm:mb-12 shadow-sm"
        >
          <div className="h-2 w-2 rounded-full bg-[#10b981]" />
          <span>Trusted by 500+ Government Bodies</span>
          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-[#facc15] fill-[#facc15]" />
        </motion.div>

        {/* Heading - Refined Scaling */}
        <motion.h1 
          className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-[92px] max-w-6xl leading-[1.1] sm:leading-[1.05]"
        >
          <div className="flex flex-wrap justify-center gap-x-3 sm:gap-x-4">
            {headingWords.map((word, i) => (
              <motion.span 
                key={i} 
                variants={itemVariants}
                className="inline-block"
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.span 
            variants={itemVariants}
            className="text-[#10b981] inline-block mt-4 lg:mt-0"
          >
            GeM Vendors & OEMs
          </motion.span>
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          variants={itemVariants}
          className="mt-8 sm:mt-10 max-w-2xl text-base sm:text-lg text-slate-400 md:text-xl leading-relaxed font-medium px-4 sm:px-0"
        >
          We help GeM vendors connect with genuine OEMs, build trusted 
          relationships, and win consistent government orders — without confusion or risk.
        </motion.p>

        {/* Buttons - Mobile Stacking */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 sm:mt-14 flex flex-col sm:flex-row justify-center gap-4 sm:gap-5 w-full sm:w-auto px-6 sm:px-0"
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white shadow-lg transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto"
              >
                Get Verified OEM Access <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white border-0 h-[650px] flex flex-col">
              <DialogHeader className="p-4 pb-2 bg-slate-50 border-b flex-shrink-0">
                <DialogTitle className="text-xl text-slate-900 border-none">Get Verified OEM Access</DialogTitle>
                <DialogDescription className="sr-only">Fill out the form below.</DialogDescription>
              </DialogHeader>
              <div className="w-full flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-2">
                <iframe
                    src="https://admin.myappz.ai/widget/form/69e21ff8b28a3"
                    style={{ width: "100%", height: "600px", border: "none", borderRadius: "3px" }}
                    id="inline-69e21ff8b28a3"
                    data-form-name="Form For Website"
                    data-layout-iframe-id="inline-69e21ff8b28a3"
                    data-form-id="69e21ff8b28a3"
                    data-height="600"
                    title="Form For Website">
                </iframe>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            size="lg"
            variant="outline"
            className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl border-white/10 bg-[#0a1122]/50 backdrop-blur-sm text-white hover:bg-white/5 transition-all w-full sm:w-auto"
            asChild
          >
            <Link href="/directory">Explore Network</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
