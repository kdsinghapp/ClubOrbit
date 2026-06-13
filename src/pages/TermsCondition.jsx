export default function TermsCondition() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
                    Terms & Conditions
                </h1>

                <p className="text-gray-600 leading-7 mb-8">
                    Welcome to Club Orbit. By accessing or using our app and services, you
                    agree to be bound by the following terms and conditions. Please read
                    them carefully.
                </p>

                <div className="space-y-8 text-gray-700">
                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By using Club Orbit, you acknowledge that you have read,
                            understood, and agreed to these Terms of Service. If you do not
                            agree, please do not use the app.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            2. Use of the Service
                        </h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must be at least 13 years old to use Club Orbit.</li>
                            <li>
                                You agree not to use the app for any unlawful or prohibited
                                activities.
                            </li>
                            <li>
                                You are responsible for maintaining the confidentiality of your
                                account credentials.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            3. User Content
                        </h2>
                        <p>
                            You retain ownership of any content you post, but grant Club Orbit
                            a non-exclusive license to use, display, and distribute it within
                            the app. You agree not to post content that is offensive, illegal,
                            or violates the rights of others.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            4. Privacy
                        </h2>
                        <p>
                            Your use of Club Orbit is also governed by our Privacy Policy,
                            which outlines how we collect and use your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            5. Modifications
                        </h2>
                        <p>
                            We may update these Terms from time to time. Continued use of the
                            app after changes are posted constitutes your acceptance of the
                            revised terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            6. Termination
                        </h2>
                        <p>
                            We reserve the right to suspend or terminate your access to Club
                            Orbit at any time, without notice, for conduct that violates these
                            Terms or is otherwise harmful to the community.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            7. Limitation of Liability
                        </h2>
                        <p>
                            Club Orbit is provided &quot;as is&quot; without warranties of any
                            kind. We are not liable for any damages arising from your use of
                            the app, including but not limited to data loss, service
                            interruptions, or third-party interactions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            8. Governing Law
                        </h2>
                        <p>
                            These Terms are governed by the laws of Ontario, Canada. Any
                            disputes shall be resolved in the courts of Ontario.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-black mb-2">
                            9. Contact Us
                        </h2>
                        <p>
                            If you have any questions about these Terms, please contact us at{" "}
                            <a
                                href="mailto:support@cluborbit.app"
                                className="text-blue-600 font-medium hover:underline"
                            >
                                support@cluborbit.app
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}