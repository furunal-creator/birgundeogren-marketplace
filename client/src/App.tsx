import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import CourseDetail from "@/pages/CourseDetail";
import { LoginPage, RegisterPage } from "@/pages/Auth";
import Cart from "@/pages/Cart";
import UserDashboard from "@/pages/UserDashboard";
import InstructorDashboard from "@/pages/InstructorDashboard";
import InstructorApply from "@/pages/InstructorApply";
import InstructorAgreement from "@/pages/InstructorAgreement";
import Hakkimizda from "@/pages/Hakkimizda";
import KVKK from "@/pages/KVKK";
import Gizlilik from "@/pages/Gizlilik";
import Admin from "@/pages/Admin";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/katalog" component={Catalog} />
      <Route path="/egitim/:slug" component={CourseDetail} />
      <Route path="/giris" component={LoginPage} />
      <Route path="/kayit" component={RegisterPage} />
      <Route path="/sepet" component={Cart} />
      <Route path="/hesabim" component={UserDashboard} />
      <Route path="/egitimci/panel" component={InstructorDashboard} />
      <Route path="/egitimci/kayit" component={InstructorApply} />
      <Route path="/egitimci-sozlesmesi" component={InstructorAgreement} />
      <Route path="/hakkimizda" component={Hakkimizda} />
      <Route path="/kvkk" component={KVKK} />
      <Route path="/gizlilik" component={Gizlilik} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
