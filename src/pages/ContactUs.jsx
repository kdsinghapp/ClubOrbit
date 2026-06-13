import { useState } from 'react';

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for reaching out! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left side - Contact Info */}
                    <div className="bg-[#f5c518] p-8 md:p-12 text-white flex flex-col justify-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Get in Touch</h2>
                        <p className="text-blue-100 mb-8 leading-relaxed text-black">
                            We'd love to hear from you. Our friendly team is always here to chat.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1 text-blue-200 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-lg text-black">Email</h3>
                                    <p className="text-blue-200 mt-1 text-black">support@cluborbit.app</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1 text-blue-200 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-lg text-black">Phone</h3>
                                    <p className="text-blue-200 mt-1 text-black">+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1 text-blue-200 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-lg text-black">Office</h3>
                                    <p className="text-blue-200 mt-1 text-black">123 Orbit Way, Suite 100<br />Toronto, ON, Canada</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Form */}
                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-black mb-1 ">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#f5c518] hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}