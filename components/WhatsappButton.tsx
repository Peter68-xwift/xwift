// components/WhatsappButton.tsx

"use client";

import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

export default function WhatsappButton() {
  return (
    <Link
      href="https://wa.me/2540105205150"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition duration-300"
    >
      <FaWhatsapp className="text-2xl" />
      <span className="sr-only">Chat with us on WhatsApp</span>
    </Link>
  );
}
