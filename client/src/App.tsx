import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PhoneModal } from "@/components/PhoneModal";
import { useState } from "react";
import Home from "@/pages/Home";
import ClinicPage from "@/pages/clinic/[slug]";
import AdminPage from "@/pages/admin";
import PricingPage from "@/pages/pricing";
import PrivacyPolicyPage from "@/pages/privacy";
import NotFound from "@/pages/not-found";

// Глобальное состояние для телефонного модала
let globalPhoneModalState = {
  isOpen: false,
  clinic: null as any,
  onClose: () => {}
};

// Глобальные функции для управления модалом
export const openPhoneModal = (clinic: any) => {
  globalPhoneModalState = {
    isOpen: true,
    clinic,
    onClose: () => {
      globalPhoneModalState.isOpen = false;
      globalPhoneModalState.clinic = null;
      // Принудительно обновляем компонент
      if (window.phoneModalUpdate) {
        window.phoneModalUpdate();
      }
    }
  };
  // Принудительно обновляем компонент
  if (window.phoneModalUpdate) {
    window.phoneModalUpdate();
  }
  console.log('PhoneModal opened for clinic:', clinic.nameRu || clinic.nameRo);
};

export const closePhoneModal = () => {
  globalPhoneModalState.isOpen = false;
  globalPhoneModalState.clinic = null;
  // Принудительно обновляем компонент
  if (window.phoneModalUpdate) {
    window.phoneModalUpdate();
  }
};

// Расширяем Window интерфейс
declare global {
  interface Window {
    phoneModalUpdate?: () => void;
    queryClient?: any;
  }
}

function Router() {
  return (
    <Switch>
      {/* Home page handles all city/district filtering */}
      <Route path="/ro" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug" component={Home} />
      <Route path="/ro/city/:citySlug" component={Home} />
      <Route path="/city/:citySlug/:districtSlug" component={Home} />
      <Route path="/city/:citySlug" component={Home} />
      
      {/* Feature-based routes - Romanian */}
      <Route path="/ro/pediatric-dentistry" component={Home} />
      <Route path="/ro/parking" component={Home} />
      <Route path="/ro/sos" component={Home} />
      <Route path="/ro/work24h" component={Home} />
      <Route path="/ro/credit" component={Home} />
      <Route path="/ro/weekend-work" component={Home} />
      <Route path="/ro/city/:citySlug/pediatric-dentistry" component={Home} />
      <Route path="/ro/city/:citySlug/parking" component={Home} />
      <Route path="/ro/city/:citySlug/sos" component={Home} />
      <Route path="/ro/city/:citySlug/work24h" component={Home} />
      <Route path="/ro/city/:citySlug/credit" component={Home} />
      <Route path="/ro/city/:citySlug/weekend-work" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug/pediatric-dentistry" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug/parking" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug/sos" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug/work24h" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug/credit" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug/weekend-work" component={Home} />
      <Route path="/ro/open-now" component={Home} />
      <Route path="/ro/city/:citySlug/open-now" component={Home} />
      <Route path="/ro/city/:citySlug/:districtSlug/open-now" component={Home} />
      
      {/* Feature-based routes - Russian */}
      <Route path="/pediatric-dentistry" component={Home} />
      <Route path="/parking" component={Home} />
      <Route path="/sos" component={Home} />
      <Route path="/work24h" component={Home} />
      <Route path="/credit" component={Home} />
      <Route path="/weekend-work" component={Home} />
      <Route path="/city/:citySlug/pediatric-dentistry" component={Home} />
      <Route path="/city/:citySlug/parking" component={Home} />
      <Route path="/city/:citySlug/sos" component={Home} />
      <Route path="/city/:citySlug/work24h" component={Home} />
      <Route path="/city/:citySlug/credit" component={Home} />
      <Route path="/city/:citySlug/weekend-work" component={Home} />
      <Route path="/city/:citySlug/:districtSlug/pediatric-dentistry" component={Home} />
      <Route path="/city/:citySlug/:districtSlug/parking" component={Home} />
      <Route path="/city/:citySlug/:districtSlug/sos" component={Home} />
      <Route path="/city/:citySlug/:districtSlug/work24h" component={Home} />
      <Route path="/city/:citySlug/:districtSlug/credit" component={Home} />
      <Route path="/city/:citySlug/:districtSlug/weekend-work" component={Home} />
      <Route path="/open-now" component={Home} />
      <Route path="/city/:citySlug/open-now" component={Home} />
      <Route path="/city/:citySlug/:districtSlug/open-now" component={Home} />
      
      <Route path="/" component={Home} />
      
      {/* Clinic Routes */}
      <Route path="/clinic/ro/:slug" component={ClinicPage} />
      <Route path="/clinic/:slug" component={ClinicPage} />
      
      {/* Other Routes */}
      <Route path="/admin" component={AdminPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/ro/pricing" component={PricingPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/ro/privacy" component={PrivacyPolicyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [phoneModalState, setPhoneModalState] = useState({
    isOpen: false,
    clinic: null as any,
    onClose: () => {}
  });

  // Устанавливаем функцию обновления в глобальную область
  window.phoneModalUpdate = () => {
    setPhoneModalState({
      isOpen: globalPhoneModalState.isOpen,
      clinic: globalPhoneModalState.clinic,
      onClose: globalPhoneModalState.onClose
    });
  };

  // Устанавливаем queryClient в глобальную область для доступа из компонентов
  window.queryClient = queryClient;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        
        {/* Глобальный телефонный модал */}
        {phoneModalState.isOpen && phoneModalState.clinic && (
          <PhoneModal
            isOpen={phoneModalState.isOpen}
            onClose={phoneModalState.onClose}
            clinic={phoneModalState.clinic}
          />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
