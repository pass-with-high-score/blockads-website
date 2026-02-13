import type { Metadata } from "next";
import {
    Users,
    ClipboardCheck,
    Download,
    FlaskConical,
    MessageSquare,
    Bug,
    Sparkles,
    ExternalLink,
    ArrowRight,
    ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Join Closed Testing – BlockAds",
    description:
        "Join the BlockAds closed testing program on Google Play. Get early access to new features and help shape the app before public release.",
};

export default function TestingPage() {
    const steps = [
        {
            step: 1,
            icon: Users,
            title: "Join the Google Group",
            description:
                "Join our tester community on Google Groups. This is required by Google Play to grant you access to the closed testing track.",
            action: "Join Google Group",
            link: "https://groups.google.com/g/nqm-inovation-tester",
            note: "You need a Google account to join the group.",
            color: "from-blue-500/20 to-blue-600/5",
            borderColor: "border-blue-500/20",
            iconBg: "bg-blue-500/15 text-blue-400",
            buttonBg: "bg-blue-500 hover:bg-blue-400",
        },
        {
            step: 2,
            icon: ClipboardCheck,
            title: "Accept Testing Invitation",
            description:
                "After joining the Google Group, click the link below to opt in as a tester on Google Play. You'll see a confirmation page from Google.",
            action: "Accept Invite",
            link: "https://play.google.com/apps/testing/app.pwhs.blockads",
            note: "It may take a few minutes for your access to activate after joining the group.",
            color: "from-amber-500/20 to-amber-600/5",
            borderColor: "border-amber-500/20",
            iconBg: "bg-amber-500/15 text-amber-400",
            buttonBg: "bg-amber-500 hover:bg-amber-400",
        },
        {
            step: 3,
            icon: Download,
            title: "Download from Google Play",
            description:
                "Once accepted, you can download BlockAds directly from Google Play. The app will install just like any other app from the store.",
            action: "Open Google Play",
            link: "https://play.google.com/store/apps/details?id=app.pwhs.blockads",
            note: "If the app doesn't appear, wait a few minutes and try again.",
            color: "from-emerald-500/20 to-emerald-600/5",
            borderColor: "border-emerald-500/20",
            iconBg: "bg-emerald-500/15 text-emerald-400",
            buttonBg: "bg-emerald-500 hover:bg-emerald-400",
        },
    ];

    const faqs = [
        {
            icon: FlaskConical,
            q: "What is Closed Testing?",
            a: "Closed testing is a pre-release stage on Google Play. The app is available only to approved testers, not the general public. It lets us gather feedback and fix issues before the official launch.",
        },
        {
            icon: Bug,
            q: "How do I report bugs?",
            a: "You can report bugs directly through Google Play's feedback system, or post in the Google Group. Include screenshots and steps to reproduce the issue if possible.",
        },
        {
            icon: Sparkles,
            q: "Will I get new features early?",
            a: "Yes! As a closed tester, you'll receive updates before anyone else. You'll be the first to try new features and improvements.",
        },
        {
            icon: MessageSquare,
            q: "Can I leave the testing program?",
            a: "Yes, you can opt out anytime by visiting the testing link and clicking 'Leave the program'. You can also uninstall the app normally.",
        },
    ];

    return (
        <>
            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="mesh-bg min-h-[60vh] flex items-center justify-center relative overflow-hidden px-4 py-24">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="w-[400px] h-[400px] rounded-full bg-amber-400/5 blur-3xl" />
                </div>

                <div className="text-center px-6 relative z-10 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-sm font-semibold mb-8 shimmer-badge glow-amber">
                        <FlaskConical className="w-4 h-4" />
                        Closed Testing Program
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Join the{" "}
                        <span className="text-amber-400" style={{ textShadow: "0 0 30px rgba(251, 191, 36, 0.3)" }}>
                            Early Access
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-[#8888a0] max-w-xl mx-auto leading-relaxed">
                        Be among the first to try BlockAds. Join our closed testing program
                        on Google Play and help us build the best ad blocker for Android.
                    </p>
                </div>
            </section>

            {/* ── Steps ────────────────────────────────────────── */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            3 Simple Steps
                        </h2>
                        <p className="text-[#8888a0] max-w-md mx-auto">
                            Follow these steps to become a tester and get early access to BlockAds.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {steps.map((item, index) => (
                            <div key={item.step} className="relative">
                                {/* Connector line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-8 top-full w-0.5 h-6 bg-gradient-to-b from-white/10 to-transparent z-10 hidden md:block" />
                                )}

                                <div
                                    className={`step-card relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${item.color} border ${item.borderColor} bg-[#12121a]`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-start gap-5">
                                        {/* Step number + icon */}
                                        <div className="flex items-center gap-4 md:flex-col md:items-center md:min-w-[64px]">
                                            <div
                                                className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0`}
                                            >
                                                <item.icon className="w-7 h-7" />
                                            </div>
                                            <span className="text-xs font-mono text-[#8888a0] md:mt-1">
                                                Step {item.step}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-[#8888a0] leading-relaxed mb-4">
                                                {item.description}
                                            </p>

                                            {/* Note */}
                                            <div className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-white/5 border border-white/5">
                                                <ChevronRight className="w-4 h-4 text-[#8888a0] mt-0.5 shrink-0" />
                                                <span className="text-sm text-[#8888a0]">
                                                    {item.note}
                                                </span>
                                            </div>

                                            {/* Action button */}
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-2 px-6 py-3 ${item.buttonBg} text-black font-semibold rounded-xl transition-all hover:scale-105`}
                                            >
                                                {item.action}
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────── */}
            <section className="py-20 px-6 mesh-bg">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-[#8888a0] max-w-md mx-auto">
                            Everything you need to know about the closed testing program.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {faqs.map((faq) => (
                            <div
                                key={faq.q}
                                className="p-6 rounded-2xl bg-[#12121a] border border-white/5 hover:border-amber-400/15 transition-all"
                            >
                                <faq.icon className="w-7 h-7 text-amber-400 mb-3" />
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-sm text-[#8888a0] leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────── */}
            <section className="py-20 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Join?
                    </h2>
                    <p className="text-[#8888a0] mb-8 max-w-md mx-auto">
                        Start with Step 1 — join the Google Group and you&apos;ll be testing
                        BlockAds in minutes.
                    </p>
                    <a
                        href="https://groups.google.com/g/nqm-inovation-tester"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-amber-400 text-black font-semibold rounded-2xl text-lg hover:bg-amber-300 transition-all hover:scale-105 glow-amber"
                    >
                        Join Google Group
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>
        </>
    );
}
