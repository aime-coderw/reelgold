import React from 'react';
import { FaEnvelope, FaWhatsapp, FaInstagram, FaTwitter } from 'react-icons/fa';
import BottomNav from './BottomNav';

const ContactUs = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-16">
      <div className="max-w-xl w-full mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold text-yellow-400 text-center">Contact Us</h1>
        <p className="text-center text-gray-300">
          Have questions, feedback, or need help? Reach out to us!
        </p>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-lg">
            <FaEnvelope className="text-yellow-400 text-xl" />
            <span className="text-sm break-all">aimemeddy25@gmail.com</span>
          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/250791231993"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 p-4 rounded-lg transition"
          >
            <FaWhatsapp className="text-white text-xl" />
            <span className="text-sm">+250 791 231 993 (WhatsApp)</span>
          </a>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-gray-700">
        <BottomNav />
      </div>
    </div>
  );
};

export default ContactUs;
