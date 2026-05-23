// Frontend/src/pages/pujaDetails/PopUp.jsx

import React from "react";

export default function Popup({ service, onClose, onBookNow }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:rotate-90" onClick={onClose}>X</button>
        <h2 className="mb-4 text-xl font-serif font-bold text-[#642627]">{service.name}</h2>
        {service.image && <img src={service.image} alt={service.name} className="mb-4 w-full max-h-48 object-cover rounded-lg" />}
        <p className="mb-3 text-sm font-semibold">Details:</p>
        <ul className="list-none space-y-2 mb-4">
          {(service.details || []).map((point, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="mb-4 inline-block text-lg font-bold text-[#2c5530]">{service.price}</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => onBookNow?.(service)} className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-br from-brand-maroon1 to-brand-maroon2 px-4 py-3 text-sm font-semibold text-white shadow-heavy-maroon">Book Now</button>
          <button type="button" onClick={onClose} className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-[#642627] px-4 py-3 text-sm font-semibold text-[#642627] transition hover:bg-[#642627] hover:text-white">Close</button>
        </div>
      </div>
    </div>
  );
}
