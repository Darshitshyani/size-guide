export default function SupportPage() {
    const sections = [
        {
            title: "Data Privacy & Security",
            description: "Your data is safe with us",
            color: "indigo",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            items: [
                "We collect only the data required for app functionality.",
                "All merchant and customer data is handled securely.",
                "We never share data with third parties without consent.",
                "Data usage follows Shopify's API and data protection rules."
            ]
        },
        {
            title: "Transparent App Behavior",
            description: "What you see is what you get",
            color: "emerald",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            items: [
                "The app performs only the actions clearly described in its features.",
                "No hidden functionality or background processes are used.",
                "All permissions requested are essential for core app features."
            ]
        },
        {
            title: "Billing & Pricing Transparency",
            description: "Clear and honest pricing",
            color: "amber",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            items: [
                "All pricing plans (Free / Basic / Pro) are clearly explained.",
                "No hidden charges or unexpected billing.",
                "Merchants can upgrade, downgrade, or cancel plans at any time."
            ]
        },
        {
            title: "App Performance & Stability",
            description: "Built for reliability",
            color: "rose",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            items: [
                "The app is optimized for performance and reliability.",
                "Regular updates are provided to maintain compatibility with Shopify.",
                "Any issues or bugs are addressed promptly."
            ]
        },
        {
            title: "Support & Communication",
            description: "We're here to help",
            color: "sky",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            items: [
                "We provide timely support for all merchants using the app.",
                "Queries related to setup, usage, or billing are handled professionally.",
                "Feedback is always welcome and helps us improve the app."
            ]
        }
    ];

    const colorClasses = {
        indigo: {
            bg: "bg-indigo-50",
            iconBg: "bg-indigo-100",
            iconText: "text-indigo-600",
            border: "border-indigo-200",
            badge: "bg-indigo-100 text-indigo-700",
            check: "text-indigo-500"
        },
        emerald: {
            bg: "bg-emerald-50",
            iconBg: "bg-emerald-100",
            iconText: "text-emerald-600",
            border: "border-emerald-200",
            badge: "bg-emerald-100 text-emerald-700",
            check: "text-emerald-500"
        },
        amber: {
            bg: "bg-amber-50",
            iconBg: "bg-amber-100",
            iconText: "text-amber-600",
            border: "border-amber-200",
            badge: "bg-amber-100 text-amber-700",
            check: "text-amber-500"
        },
        rose: {
            bg: "bg-rose-50",
            iconBg: "bg-rose-100",
            iconText: "text-rose-600",
            border: "border-rose-200",
            badge: "bg-rose-100 text-rose-700",
            check: "text-rose-500"
        },
        sky: {
            bg: "bg-sky-50",
            iconBg: "bg-sky-100",
            iconText: "text-sky-600",
            border: "border-sky-200",
            badge: "bg-sky-100 text-sky-700",
            check: "text-sky-500"
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            {/* Icon - Ruler/Size Guide related */}
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    {/* Ruler icon */}
                                    <rect x="2" y="6" width="20" height="12" rx="1" strokeWidth="1.5" />
                                    <line x1="6" y1="6" x2="6" y2="10" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="10" y1="6" x2="10" y2="12" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="14" y1="6" x2="14" y2="10" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="18" y1="6" x2="18" y2="12" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
                                <p className="text-gray-500 text-sm mt-0.5">Size Guide App - Help & Compliance</p>
                            </div>
                        </div>
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium text-green-700">All Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border border-indigo-100">
                    <p className="text-gray-700 leading-relaxed">
                        Welcome to the Support page for our Shopify app. We are committed to providing reliable assistance and ensuring full compliance with Shopify App Store guidelines.
                    </p>
                </div>

                {/* Compliance Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">App Compliance & Guidelines</h2>
                </div>

                {/* Compliance Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {sections.map((section, index) => {
                        const colors = colorClasses[section.color];
                        return (
                            <div
                                key={index}
                                className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${index === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center ${colors.iconText}`}>
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                                        <p className="text-xs text-gray-500">{section.description}</p>
                                    </div>
                                </div>
                                
                                {/* Items */}
                                <ul className="space-y-2">
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                            <svg className={`w-4 h-4 ${colors.check} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="leading-snug">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Need Help Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Need Help?</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    If you have any questions, issues, or feedback, please contact our support team. We're here to help you get the best experience from our Shopify app.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 md:flex-shrink-0">
                            <a
                                href="mailto:support@example.com"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Contact Support
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Documentation
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 py-6">
                    <p className="text-gray-500 text-sm">
                        Thank you for choosing our app. We value your trust and are committed to providing the best service.
                    </p>
                </div>
            </div>
        </div>
    );
}
