import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSEO } from "@/hooks/useSEO";
import Home from "@/pages/Home";
import ClinicPage from "@/pages/clinic/[slug]";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  // Initialize SEO settings globally
  useSEO();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/clinic/:slug" component={ClinicPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
