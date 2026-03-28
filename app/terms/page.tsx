import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service – BlockAds",
    description: "Terms of Service for the BlockAds ad blocker app.",
};

export default function TermsOfService() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-20">
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-sm text-[#8888a0] mb-10">
                Last updated: March 28, 2026
            </p>

            <div className="legal-content">
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By downloading, installing, or using BlockAds (&quot;the App&quot;),
                    you agree to be bound by these Terms of Service (&quot;Terms&quot;). If
                    you do not agree to these Terms, do not use the App.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    BlockAds is a free, open-source ad blocker for Android that uses
                    smart DNS filtering to block advertisements and trackers. The App
                    can operate by creating a local VPN tunnel or by utilizing Root Proxy (iptables) on rooted devices to intercept and filter DNS
                    queries. In either mode, no internet traffic is routed through external servers.
                </p>

                <h2>3. License</h2>
                <p>
                    BlockAds is provided as free and open-source software. You are granted
                    a non-exclusive, worldwide, royalty-free license to use, copy, and
                    distribute the App in accordance with its open-source license.
                </p>

                <h2>4. User Responsibilities</h2>
                <p>By using the App, you agree to:</p>
                <ul>
                    <li>
                        Use the App in compliance with all applicable laws and regulations
                    </li>
                    <li>Not use the App for any illegal or unauthorized purpose</li>
                    <li>Not attempt to reverse engineer or modify the App maliciously</li>
                    <li>
                        Understand that blocking ads may affect the functionality of certain
                        websites and applications
                    </li>
                </ul>

                <h2>5. Permissions (VPN & Root)</h2>
                <p>
                    Depending on your chosen routing mode, the App requires either Android VPN permission or Root access to function. By granting these permissions, you acknowledge that:
                </p>
                <ul>
                    <li>
                        The VPN or Root Proxy is created/configured locally on your device for DNS filtering purposes only.
                    </li>
                    <li>No traffic is routed through external servers.</li>
                    <li>
                        When using VPN mode, only one VPN connection can be active at a time on Android. Activating BlockAds will disconnect any other active VPN.
                    </li>
                </ul>

                <h2>6. Filter Lists</h2>
                <p>
                    BlockAds uses third-party filter lists to identify ads and trackers.
                    These filter lists are maintained by independent communities and
                    organizations. We do not guarantee the accuracy, completeness, or
                    timeliness of any filter list. Some legitimate content may
                    occasionally be blocked (false positives), and some ads may not be
                    blocked (false negatives).
                </p>

                <h2>7. Beta Features & Third-Party Configurations</h2>
                <p>
                    Certain features such as HTTPS Filtering (Beta), custom WireGuard endpoints, or DNS-over-HTTPS (DoH) providers are provided &quot;as-is&quot;. Using them might require installing a local cryptographic certificate or communicating with third-party endpoints. You are responsible for ensuring that you trust the providers or endpoints you configure.
                </p>

                <h2>8. Disclaimer of Warranties</h2>
                <p>
                    THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                    WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
                    BUT NOT LIMITED TO:
                </p>
                <ul>
                    <li>
                        WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE
                    </li>
                    <li>WARRANTIES THAT THE APP WILL BE UNINTERRUPTED OR ERROR-FREE</li>
                    <li>WARRANTIES THAT ALL ADS WILL BE BLOCKED</li>
                    <li>
                        WARRANTIES THAT THE APP WILL NOT INTERFERE WITH OTHER APPLICATIONS
                    </li>
                </ul>

                <h2>9. Limitation of Liability</h2>
                <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE DEVELOPERS OF BLOCKADS
                    SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                    CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR
                    USE OF THE APP, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul>
                    <li>Loss of data or revenue</li>
                    <li>Inability to access certain websites or services</li>
                    <li>
                        Any issues caused by third-party filter lists, beta features, or custom configurations
                    </li>
                    <li>Device performance or battery consumption</li>
                </ul>

                <h2>10. Third-Party Content</h2>
                <p>
                    The App may interact with third-party content through filter list
                    downloads and external DNS points. We are not responsible for the content,
                    policies, or practices of any third-party services.
                </p>

                <h2>11. Modifications</h2>
                <p>
                    We reserve the right to modify these Terms at any time. Changes will be
                    posted on this page with an updated &quot;Last updated&quot; date. Your
                    continued use of the App after any changes constitutes acceptance of
                    the modified Terms.
                </p>

                <h2>12. Termination</h2>
                <p>
                    You may stop using the App at any time by uninstalling it from your
                    device. All locally stored data will be removed upon uninstallation.
                </p>

                <h2>13. Governing Law</h2>
                <p>
                    These Terms shall be governed by and construed in accordance with the
                    laws of Vietnam, without regard to its conflict of law provisions.
                </p>

                <h2>14. Contact</h2>
                <p>
                    If you have any questions about these Terms, please contact us at:
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
