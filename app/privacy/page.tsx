import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy – BlockAds",
    description:
        "Privacy Policy for BlockAds ad blocker app. Learn how we protect your data.",
};

export default function PrivacyPolicy() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-[#8888a0] mb-10">
                Last updated: March 28, 2026
            </p>

            <div className="legal-content">
                <h2>1. Overview</h2>
                <p>
                    BlockAds (&quot;we&quot;, &quot;our&quot;, or &quot;the app&quot;) is a
                    free, open-source ad blocker for Android. We are committed to
                    protecting your privacy. This Privacy Policy explains what data we
                    collect (or rather, what we don&apos;t collect) and how the app works.
                </p>

                <h2>2. Data We Collect</h2>
                <h3>2.1 We Do NOT Collect</h3>
                <ul>
                    <li>Personal information (name, email, phone number)</li>
                    <li>Device identifiers or advertising IDs</li>
                    <li>Location data</li>
                    <li>Browsing history</li>
                    <li>Usage analytics or telemetry (unless explicitly opted-in)</li>
                    <li>Any data transmitted to external servers without your consent</li>
                </ul>

                <h3>2.2 Data Stored Locally</h3>
                <p>
                    The following data is stored <strong>only on your device</strong> and
                    is never transmitted to any server:
                </p>
                <ul>
                    <li>
                        <strong>DNS Query Logs:</strong> Records of DNS queries processed by
                        the app, including the domain name, timestamp, and whether the query
                        was blocked. These logs are stored in a local SQLite database.
                    </li>
                    <li>
                        <strong>App Settings:</strong> Your preferences such as filter list
                        selections, DNS server configuration, theme mode, and whitelisted
                        apps/domains.
                    </li>
                    <li>
                        <strong>Filter Lists:</strong> Cached copies of ad-blocking filter
                        lists downloaded from public sources.
                    </li>
                    <li>
                        <strong>Crash Reports & Logs:</strong> If you manually export local logs or explicitly opt-in to telemetry during onboarding, anonymized crash logs may be sent to help us improve the app.
                    </li>
                </ul>

                <h2>3. Dual Routing Modes (VPN & Root Proxy)</h2>
                <p>
                    BlockAds offers two routing modes to filter DNS queries: a <strong>local VPN tunnel</strong> and a <strong>Root Proxy (iptables)</strong>.
                </p>
                <ul>
                    <li>
                        <strong>VPN Mode:</strong> Creates a local VPN tunnel. It does not route your traffic through any external server.
                    </li>
                    <li>
                        <strong>Root Proxy Mode:</strong> Uses iptables to redirect DNS traffic directly, requiring Root access but no VPN interface.
                    </li>
                    <li>
                        In both modes, only DNS traffic (port 53) and optionally HTTPS/DoH is intercepted locally. All other internet traffic passes through normally.
                    </li>
                    <li>
                        No internet traffic content is logged, inspected, modified, or transmitted externally.
                    </li>
                </ul>

                <h2>4. Filter Lists</h2>
                <p>
                    BlockAds downloads filter lists from publicly available sources (e.g.,
                    ABPVN, AdGuard DNS, EasyList). These downloads contain only the filter
                    list data — no personal information is sent to the filter list
                    providers.
                </p>

                <h2>5. Third-Party Services</h2>
                <p>
                    BlockAds generally does <strong>not</strong> integrate mandatory third-party tracking services. However:
                </p>
                <ul>
                    <li><strong>Crash reporting services:</strong> Only enabled if you explicitly opt-in. We prioritize your privacy above all.</li>
                    <li>We emphatically do not use Advertising SDKs or Social media trackers.</li>
                </ul>

                <h2>6. Advanced Features (HTTPS & WireGuard)</h2>
                <p>
                    We offer advanced features such as HTTPS Filtering (Beta) and WireGuard profile imports:
                </p>
                <ul>
                    <li>
                        <strong>HTTPS Filtering:</strong> This feature may install a local certificate to inspect encrypted traffic for ad blocking purposes. All inspection happens 100% locally on your device.
                    </li>
                    <li>
                        <strong>WireGuard Imports:</strong> Custom VPN profiles are stored locally and only used to establish connection to your specified endpoint.
                    </li>
                </ul>

                <h2>7. Data Retention & Deletion</h2>
                <p>
                    All data is stored locally on your device. You can delete all stored
                    data at any time through:
                </p>
                <ul>
                    <li>
                        <strong>Settings → Clear All Logs</strong> to delete DNS query logs
                    </li>
                    <li>
                        <strong>Uninstalling the app</strong> to remove all app data
                    </li>
                </ul>

                <h2>8. Children&apos;s Privacy</h2>
                <p>
                    BlockAds is not directed at children under the age of 13. We do not
                    knowingly collect any personal information from children.
                </p>

                <h2>9. Export & Import</h2>
                <p>
                    The app allows you to export your settings to a JSON file and import
                    them on another device. This file is created and managed entirely by
                    you — it is not uploaded to any server. The exported file contains only
                    your app configuration (filter lists, DNS settings, whitelisted
                    apps/domains).
                </p>

                <h2>10. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. The updated
                    version will be posted on this page with a revised &quot;Last
                    updated&quot; date. We encourage you to review this page periodically.
                </p>

                <h2>11. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us
                    at:
                </p>
                <p>
                    <strong>Email:</strong>{" "}
                    <a
                        href="mailto:contact@pwhs.app"
                        className="text-[#00E676] hover:underline"
                    >
                        contact@pwhs.app
                    </a>
                </p>
            </div>
        </div>
    );
}
