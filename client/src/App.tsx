import { Switch, Route, Router, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import CourseDetail from "@/pages/CourseDetail";
import AuthPage from "@/pages/Auth";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import UserDashboard from "@/pages/UserDashboard";
import InstructorDashboard from "@/pages/InstructorDashboard";
import InstructorApply from "@/pages/InstructorApply";
import InstructorAgreement from "@/pages/InstructorAgreement";
import Hakkimizda from "@/pages/Hakkimizda";
import KVKK from "@/pages/KVKK";
import Gizlilik from "@/pages/Gizlilik";
import Admin from "@/pages/Admin";
import WhatsAppButton from "@/components/WhatsAppButton";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/katalog" component={Catalog} />
      <Route path="/egitim/:slug" component={CourseDetail} />
      <Route path="/giris" component={AuthPage} />
      <Route path="/kayit">
        {() => <Redirect to="/giris?tab=kayit" />}
      </Route>
      <Route path="/sepet" component={Cart} />
      <Route path="/odeme" component={Checkout} />
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
          <CartProvider>
            <Toaster />
            <Router hook={useHashLocation}>
              <AppRouter />
              <WhatsAppButton />
            </Router>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
