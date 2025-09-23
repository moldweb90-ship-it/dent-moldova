import { useTranslation } from '../lib/i18n';
import { Check, ArrowRight, Star, Crown, Shield, ArrowLeft, Home, Plus, Filter, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useRoute } from 'wouter';
import { LanguageToggle } from '../components/LanguageToggle';
import { AddClinicModal } from '../components/AddClinicModal';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function PricingPage() {
  const [, paramsRo] = useRoute('/ro/pricing');
  const isRomanian = !!paramsRo;
  const { t, changeLanguage } = useTranslation();
  const [clinicFormOpen, setClinicFormOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Синхронизируем язык в i18n системе с URL
  useEffect(() => {
    changeLanguage(isRomanian ? 'ro' : 'ru');
  }, [isRomanian, changeLanguage]);

  // Fetch site settings for logo
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      const settings = await response.json();
      
      // Convert array of settings to object
      const settingsMap = Array.isArray(settings)
        ? settings.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value;
            return acc;
          }, {})
        : settings || {};
      
      return settingsMap;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Отслеживание скролла для анимированного меню
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = 64; // Высота меню - когда оно полностью исчезнет с экрана
      
      // Меню появляется только когда полностью скроллится за пределы экрана
      if (currentScrollY > headerHeight) {
        setIsHeaderVisible(true);
      }
      // Не скрываем меню при возврате в начало - оно остается видимым
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AddClinicModal 
        open={clinicFormOpen} 
        onClose={() => setClinicFormOpen(false)} 
      />
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className={`bg-white/80 backdrop-blur-md border-b border-gray-200/50 fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
          isHeaderVisible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0'
        }`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/">
                  <button 
                    className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                    title={siteSettings?.logoAlt || t('appTitle')}
                  >
                    {settingsLoading ? (
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
      ) : siteSettings?.logo ? (
        <img 
          src={siteSettings.logo} 
          alt={siteSettings.logoAlt || t('appTitle')}
          style={{ 
            width: `${siteSettings.logoWidth || 100}px`,
            height: 'auto'
          }}
          className="object-contain"
        />
      ) : (
                      <span>{t('appTitle')}</span>
                    )}
                  </button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                {/* Navigation Menu */}
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>{t('clinicList')}</span>
                  </Button>
                </Link>
                
                {/* Language Toggle - moved before Add Clinic Button for mobile */}
                <div className="flex md:hidden">
                  <LanguageToggle />
                </div>
                
                {/* Add Clinic Button */}
                <Button
                  onClick={() => setClinicFormOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-1 px-2"
                  size="sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">{t('addClinic')}</span>
                </Button>
                
                {/* Language Toggle - for desktop */}
                <div className="hidden md:flex">
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="bg-gray-50 border-b border-gray-200 pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/">
                <span className="hover:text-gray-900 transition-colors cursor-pointer">
                  {t('home')}
                </span>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{t('pricing.title')}</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {t('pricing.title')}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('pricing.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Basic Plan - Left Card (Smaller) */}
            <Card className="relative bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gray-100">
                    <Shield className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {t('pricing.basic.name')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('pricing.basic.description')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">
                    {t('pricing.basic.priceNote')}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    {t('pricing.basic.price')}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.basic.features.name')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.basic.features.address')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.basic.features.rating')}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-all duration-200 group relative overflow-hidden"
                  onClick={() => setClinicFormOpen(true)}
                >
                  <span className="relative z-10 flex items-center">
                    {t('pricing.basic.button')} 
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan - Center Card (Bigger) */}
            <Card className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 scale-105">
              {/* Background decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-lg"></div>
                <div className="absolute bottom-8 left-8 w-12 h-8 bg-white rounded"></div>
                <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-white rounded-full"></div>
              </div>
              
              {/* Recommended Badge */}
              <Badge className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 text-sm font-medium animate-pulse">
                <Star className="h-3 w-3 mr-1" />
                {t('pricing.recommended')}
              </Badge>

              <CardHeader className="text-center pb-6 relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  {t('pricing.verified.name')}
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  {t('pricing.verified.description')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                {/* Price */}
                <div className="text-center">
                  <div className="text-sm text-gray-300 mb-1">
                    {t('pricing.verified.priceNote')}
                  </div>
                  <div className="text-5xl font-bold text-white">
                    {t('pricing.verified.price')}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{t('pricing.verified.features.allBasic')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{t('pricing.verified.features.onlineBooking')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{t('pricing.verified.features.photos')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{t('pricing.verified.features.services')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{t('pricing.verified.features.filters')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{t('pricing.verified.features.reviews')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{t('pricing.verified.features.priority')}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-all duration-200 group relative overflow-hidden shadow-lg hover:shadow-xl"
                  onClick={() => setClinicFormOpen(true)}
                >
                  <span className="relative z-10 flex items-center">
                    {t('pricing.verified.button')} 
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan - Right Card (Smaller) */}
            <Card className="relative bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {t('pricing.premium.name')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {t('pricing.premium.description')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">
                    {t('pricing.premium.priceNote')}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    {t('pricing.premium.price')}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.premium.features.allVerified')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.premium.features.topPlacement')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.premium.features.recommended')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.premium.features.advertising')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.premium.features.analytics')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.premium.features.separatePage')}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{t('pricing.premium.features.manager')}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 hover:border-purple-700 hover:text-purple-700 transition-all duration-200 group relative overflow-hidden"
                  onClick={() => setClinicFormOpen(true)}
                >
                  <span className="relative z-10 flex items-center">
                    {t('pricing.premium.button')} 
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Note */}
          <div className="mt-16 text-center">
            <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📌 {t('pricing.note.title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('pricing.note.description')}
              </p>
            </div>
          </div>
        </div>
      
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-8 md:mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-600">© 2024 {t('appTitle')}. Все права защищены.</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex space-x-6 text-sm text-gray-600">
                  <a 
                    href={isRomanian ? '/ro/pricing' : '/pricing'} 
                    className="hover:text-gray-900 transition-colors"
                  >
                    {t('pricing.title')}
                  </a>
                  <a
                    href={isRomanian ? '/ro/privacy' : '/privacy'}
                    className="hover:text-gray-900 transition-colors"
                  >
                    {isRomanian ? 'Politica de confidențialitate' : 'Политика приватности'}
                  </a>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    {isRomanian ? 'Contacte' : 'Контакты'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
