import React from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface SosButtonProps {
  phone: string;
  clinicName: string;
}

export const SosButton: React.FC<SosButtonProps> = ({ phone, clinicName }) => {
  const { language } = useTranslation();

  const handleCall = () => {
    window.location.href = `tel:${phone}`;
  };

  const translations = {
    ru: {
      description: "Нажмите для немедленного звонка в клинику",
      features: [
        "Работаем в экстренных случаях",
        "Принимаем пациентов без записи",
        "Оказываем неотложную помощь"
      ],
      callButton: "SOS"
    },
    ro: {
      description: "Apăsați pentru a suna imediat la clinică",
      features: [
        "Lucrăm în cazuri de urgență",
        "Primim pacienți fără programare",
        "Oferim asistență de urgență"
      ],
      callButton: "SOS"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.ru;

  return (
    <div className="mb-6 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Мигающий эмодзи */}
      <div className="flex justify-center mb-3 relative z-10">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-lg">🚨</span>
        </div>
      </div>
      
      {/* Кнопка SOS */}
      <div className="flex justify-center mb-4 relative z-20">
        <button
          onClick={handleCall}
          className="
            bg-gradient-to-r from-white to-white/95 text-red-600 font-bold
            text-xl
            px-8 py-4 rounded-2xl
            hover:from-white/95 hover:to-white hover:scale-105
            active:scale-95
            transition-all duration-300
            shadow-2xl hover:shadow-3xl
            flex items-center gap-3
            whitespace-nowrap
            min-w-[140px]
            border border-white/20
            backdrop-blur-sm
          "
        >
          <Phone className="h-5 w-5" />
          {t.callButton}
        </button>
      </div>
      
      {/* Пояснение */}
      <div className="text-center relative z-10">
        <p className="text-white/95 text-base mb-3">
          {t.description}
        </p>
        
        <div className="space-y-1">
          {t.features.map((feature, index) => (
            <div key={index} className="flex items-center justify-center gap-2 text-sm text-white/80">
              <div className="w-1 h-1 bg-white/60 rounded-full"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
