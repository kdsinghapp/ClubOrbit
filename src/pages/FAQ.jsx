import React, { useState } from 'react';

const faqData = [
    {
        question: "How do I create a new club?",
        answer: "To create a new club, navigate to the 'Clubs' section from the main menu and click on the 'Create Club' button. You'll need to provide a club name, description, and select a category that best fits your community."
    },
    {
        question: "Is Club Orbit free to use?",
        answer: "Yes! Creating an account, joining clubs, and participating in most community events is completely free. Some organizers may charge for specific premium events or activities."
    },
    {
        question: "How can I invite friends to my club?",
        answer: "Once your club is created, go to your Club Dashboard. You will find an 'Invite Members' button where you can share a direct link to your club or invite people via their email address."
    },
    {
        question: "How do I delete my account?",
        answer: "If you wish to delete your account, please go to 'User Profile' > 'Settings' > 'Account'. Scroll to the bottom of the page and select 'Delete Account'. Please note that this action is irreversible."
    },
    {
        question: "Can I join multiple clubs?",
        answer: "Absolutely! You can join as many clubs as you'd like. We encourage our users to explore different communities and interests."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleAccordion = (index) => {
        if (openIndex === index) {
            setOpenIndex(null);
        } else {
            setOpenIndex(index);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Header Section */}
            <div className="bg-[#f5c518] py-16 md:py-24 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg md:text-xl text-black/80 max-w-2xl mx-auto leading-relaxed">
                        Have questions? We're here to help. Find answers to the most common questions about Club Orbit below.
                    </p>
                </div>
            </div>

            {/* FAQ Accordion Section */}
            <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-10">
                    <div className="space-y-4">
                        {faqData.map((faq, index) => (
                            <div 
                                key={index} 
                                className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full px-6 py-5 text-left bg-white hover:bg-gray-50 flex items-center justify-between focus:outline-none"
                                >
                                    <span className="text-lg font-semibold text-black pr-4">
                                        {faq.question}
                                    </span>
                                    <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f5c518]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>
                                
                                <div 
                                    className={`transition-all duration-300 ease-in-out ${
                                        openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                    } overflow-hidden`}
                                >
                                    <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Support Contact Prompt */}
                    <div className="mt-12 text-center bg-gray-50 p-8 rounded-xl border border-gray-100">
                        <h3 className="text-xl font-bold text-black mb-3">Still have questions?</h3>
                        <p className="text-gray-600 mb-6">
                            Can't find the answer you're looking for? Please chat to our friendly team.
                        </p>
                        <a 
                            href="/contact-us" 
                            className="inline-block bg-[#f5c518] hover:bg-[#e0b416] text-black font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
