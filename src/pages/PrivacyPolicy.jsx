export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">

                <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    Privacy Policy
                </h1>

                <p className="text-gray-600 mb-8 leading-7">
                    Welcome to Club Orbit. Your privacy is important to us. This Privacy Policy
                    explains how we collect, use, and protect your information when you use our app.
                </p>

                <div className="space-y-8 text-gray-700">

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            1. Information We Collect
                        </h2>
                        <p className="mb-2">
                            We may collect the following types of information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Personal Information (name, email address, phone number)</li>
                            <li>Account credentials (username, password)</li>
                            <li>Usage data (pages visited, features used)</li>
                            <li>Device information (IP address, browser type, OS)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            2. How We Use Your Information
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide and improve our services</li>
                            <li>To personalize user experience</li>
                            <li>To communicate updates and notifications</li>
                            <li>To ensure security and prevent fraud</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            3. Sharing of Information
                        </h2>
                        <p>
                            We do not sell your personal data. We may share information with
                            trusted third parties only when necessary to operate our services,
                            comply with legal obligations, or protect our rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            4. Data Security
                        </h2>
                        <p>
                            We implement industry-standard security measures to protect your data.
                            However, no system is completely secure, and we cannot guarantee
                            absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            5. Cookies & Tracking Technologies
                        </h2>
                        <p>
                            We use cookies and similar technologies to enhance user experience,
                            analyze traffic, and improve our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            6. User Rights
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal data</li>
                            <li>Request correction or deletion</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            7. Third-Party Services
                        </h2>
                        <p>
                            Our app may contain links to third-party services. We are not responsible
                            for their privacy practices.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            8. Changes to This Policy
                        </h2>
                        <p>
                            We may update this Privacy Policy from time to time. Changes will be
                            posted on this page with an updated effective date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            9. Contact Us
                        </h2>
                        <p>
                            If you have any questions about this Privacy Policy, contact us at{" "}
                            <a
                                href="mailto:support@cluborbit.app"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                support@cluborbit.app
                            </a>
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}