import React from 'react';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Hero Section */}
            <div className="bg-[#f5c518] py-16 md:py-24 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
                        About Club Orbit
                    </h1>
                    <p className="text-lg md:text-xl text-black/80 max-w-2xl mx-auto leading-relaxed">
                        We are passionate about connecting people, fostering vibrant communities, and creating unforgettable experiences through our innovative platform.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        
                        {/* Our Mission */}
                        <div className="mb-16 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-black mb-6 flex items-center justify-center md:justify-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#f5c518]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                Our Mission
                            </h2>
                            <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">
                                At Club Orbit, our mission is simple yet profound: to break down barriers and bring people together. We believe that shared interests, whether it's sports, hobbies, or professional networking, form the strongest bonds. Our platform is designed to make it effortless for you to discover clubs, join groups, and participate in events that ignite your passion.
                            </p>
                        </div>

                        {/* Core Values Grid */}
                        <div>
                            <h2 className="text-3xl font-bold text-black mb-8 text-center">Our Core Values</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                
                                {/* Value 1 */}
                                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300 group">
                                    <div className="w-14 h-14 bg-[#f5c518]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-black mb-3">Community First</h3>
                                    <p className="text-gray-600">
                                        Every feature we build is centered around fostering genuine connections and a sense of belonging.
                                    </p>
                                </div>

                                {/* Value 2 */}
                                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300 group">
                                    <div className="w-14 h-14 bg-[#f5c518]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-black mb-3">Innovation</h3>
                                    <p className="text-gray-600">
                                        We continuously evolve our platform, utilizing modern technology to provide a seamless user experience.
                                    </p>
                                </div>

                                {/* Value 3 */}
                                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300 group">
                                    <div className="w-14 h-14 bg-[#f5c518]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-black mb-3">Trust & Safety</h3>
                                    <p className="text-gray-600">
                                        We prioritize creating a secure, inclusive environment where all members feel respected and valued.
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
