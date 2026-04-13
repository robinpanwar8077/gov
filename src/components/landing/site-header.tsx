"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    // Smooth background transition
    const backgroundColor = useTransform(
        scrollY,
        [0, 80],
        ["rgba(5, 11, 26, 0)", "rgba(5, 11, 26, 0.95)"]
    );

    const borderOpacity = useTransform(
        scrollY,
        [0, 80],
        ["0", "1"]
    );

    const navItems = [
        "Directory",
        "Vendors",
        "OEMs",
        "Consultants",
        "Membership",
        "Resources"
    ];

    const menuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <>
            <motion.header
                style={{
                    backgroundColor,
                    borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
                    boxShadow: useTransform(scrollY, [0, 80], ["none", "0 10px 30px -10px rgba(0,0,0,0.5)"])
                }}
                className="sticky top-0 z-[100] w-full border-b backdrop-blur-sm transition-all duration-500"
            >
                <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-10">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
                        <div className="relative h-12 w-12 sm:h-16 sm:w-16 transition-all ">
                            <Image
                                src="/logo2.jpeg"
                                alt="GovProNet Logo"
                                fill
                                className="object-contain"
                                style={{
                                    filter: 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.1)',
                                    mixBlendMode: 'screen'
                                }}
                            />
                        </div>
                        <span className="text-xl sm:text-2xl font-extrabold tracking-tighter text-white transition-colors group-hover:text-[#10b981]">GovProNet</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:flex items-center gap-8 font-bold text-[15px] tracking-tight">
                        {navItems.map((item, i) => (
                            <Link
                                key={i}
                                href={`/${item.toLowerCase()}`}
                                className="text-slate-300 transition-all hover:text-white hover:translate-y-[-1px]"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Login Link - High Contrast */}
                        <Link
                            href="/login"
                            className="hidden lg:block text-[15px] font-bold text-slate-200 transition-colors hover:text-white"
                        >
                            Log in
                        </Link>

                        {/* Primary Button - Scaled for mobile */}
                        <Button asChild size="lg" className="h-10 sm:h-12 px-5 sm:px-8 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-[#0047AB] hover:bg-[#003366] text-white font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                            <Link href="/signup">Join Network</Link>
                        </Button>

                        {/* Mobile Menu Icon */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="block xl:hidden text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-[90] xl:hidden bg-[#050b1a]/95 backdrop-blur-2xl pt-24 px-6 pb-12 overflow-y-auto"
                    >
                        <div className="flex flex-col gap-6">
                            {navItems.map((item, i) => (
                                <motion.div key={i} variants={itemVariants}>
                                    <Link
                                        href={`/${item.toLowerCase()}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-3xl font-bold text-white hover:text-[#10b981] transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.hr variants={itemVariants} className="border-white/5 my-4" />
                            <motion.div variants={itemVariants} className="flex flex-col gap-6 pt-4">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-2xl font-bold text-slate-300"
                                >
                                    Log in
                                </Link>
                                <Button asChild size="lg" className="h-16 rounded-[1.5rem] bg-[#10b981] hover:bg-[#059669] text-white text-xl font-bold">
                                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
