'use client';

import { useState } from "react";
import { toast } from "react-toastify";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for form submission logic
        toast.success("Message sent successfully!", {
            position: "top-right",
            autoClose: 5000,
        });
        // Reset form
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-14rem)] bg-gray-50 py-10 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="text-center mb-10 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">Contact Us</h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto">
                        We’d love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out.
                    </p>
                </div>

                {/* Main Content: Form and Contact Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-webgame text-gray-800 placeholder-gray-400"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-webgame text-gray-800 placeholder-gray-400"
                                        placeholder="your.email@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            {/* Subject Field */}
                            <div className="mb-6">
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-webgame text-gray-800 placeholder-gray-400"
                                    placeholder="Subject of your message"
                                    required
                                />
                            </div>
                            {/* Message Field */}
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-webgame text-gray-800 placeholder-gray-400 h-32 sm:h-40 resize-none"
                                    placeholder="Your message here..."
                                    required
                                />
                            </div>
                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-3 bg-webgame text-white rounded-full hover:bg-webgame-dark transition-colors duration-300 text-sm sm:text-base"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-1 bg-gray-800 text-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl sm:text-2xl font-semibold mb-6">Get in Touch</h2>
                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <p className="text-sm font-medium text-gray-300">Email</p>
                                <p className="text-base">
                                    <a href="mailto:webgame021104@gmail.com" className="hover:text-webgame transition-colors">
                                        webgame021104@gmail.com
                                    </a>
                                </p>
                            </div>
                            {/* Phone */}
                            <div>
                                <p className="text-sm font-medium text-gray-300">Phone</p>
                                <p className="text-base">
                                    <a href="tel:+1234567890" className="hover:text-webgame transition-colors">
                                        +84 985484206
                                    </a>
                                </p>
                            </div>
                            {/* Social Media */}
                            <div>
                                <p className="text-sm font-medium text-gray-300 mb-2">Follow Us</p>
                                <div className="flex space-x-4">
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-webgame transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-webgame transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                        </svg>
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-webgame transition-colors">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 3.668.227 1.981 1.97 1.826 5.332.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.155 3.362 1.898 5.049 5.26 5.204C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 3.362-.155 5.049-1.898 5.204-5.26C23.986 15.668 24 15.259 24 12c0-3.259-.014-3.668-.072-4.948-.155-3.362-1.898-5.049-5.26-5.204C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;