"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlaskConical } from "lucide-react";

export default function MobileNav() {
    const [open, setOpen] = useState(false);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    return (
        <div className="md:hidden">
            {/* Hamburger button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative w-10 h-10 flex items-center justify-center text-white z-50"
                aria-label="Toggle menu"
            >
                <div className="flex flex-col gap-1.5">
                    <span
                        className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${open ? "rotate-45 translate-y-2" : ""
                            }`}
                    />
                    <span
                        className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${open ? "opacity-0" : ""
                            }`}
                    />
                    <span
                        className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-2" : ""
                            }`}
                    />
                </div>
            </button>

            {/* Mobile menu overlay */}
            <div
                className={`fixed left-0 right-0 bottom-0 top-16 z-40 bg-[#0a0a0f] border-t border-white/5 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out ${open
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setOpen(false)}
            >
                <div
                    className={`flex flex-col items-center justify-center h-full gap-8 px-6 transition-all duration-300 ease-in-out ${open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
                        }`}
                >
                    <Link
                        href="/#features"
                        onClick={() => setOpen(false)}
                        className="text-xl text-[#8888a0] hover:text-white transition-colors"
                    >
                        Features
                    </Link>
                    <Link
                        href="/privacy"
                        onClick={() => setOpen(false)}
                        className="text-xl text-[#8888a0] hover:text-white transition-colors"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/terms"
                        onClick={() => setOpen(false)}
                        className="text-xl text-[#8888a0] hover:text-white transition-colors"
                    >
                        Terms
                    </Link>
                    <Link
                        href="/testing"
                        onClick={() => setOpen(false)}
                        className="mt-4 inline-flex items-center gap-2 px-10 py-4 bg-amber-400 text-black font-semibold rounded-full hover:bg-amber-300 transition-all hover:scale-105"
                    >
                        <FlaskConical className="w-5 h-5" />
                        Join Beta
                    </Link>
                </div>
            </div>
        </div>
    );
}
