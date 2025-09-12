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
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/ro" component={Home} />
      <Route path="/" component={Home} />
      <Route path="/clinic/ro/:slug" component={ClinicPage} />
      <Route path="/clinic/:slug" component={ClinicPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/pricing" component={PricingPage} />
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
