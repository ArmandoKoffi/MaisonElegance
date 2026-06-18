import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Cart from "@/pages/Cart";
import AuthPage from "@/pages/AuthPage";
import MyAccount from "@/pages/MyAccount";
import AdminDashboard from "@/pages/admin/Dashboard";
import ManageProducts from "@/pages/admin/ManageProducts";
import ManageCategories from "@/pages/admin/ManageCategories";
import ManageOrders from "@/pages/admin/ManageOrders";
import ManageClients from "@/pages/admin/ManageClients";
import Finances from "@/pages/admin/Finances";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import NotFound from "@/pages/NotFound";

import { ScrollToTop } from "@/components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/produits" element={<Products />} />
                <Route path="/produits/:id" element={<ProductDetail />} />
                <Route path="/panier" element={<Cart />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/connexion" element={<AuthPage />} />
                <Route path="/mon-compte" element={<MyAccount />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin/connexion" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="categories" element={<ManageCategories />} />
                <Route path="produits" element={<ManageProducts />} />
                <Route path="commandes" element={<ManageOrders />} />
                <Route path="clients" element={<ManageClients />} />
                <Route path="finances" element={<Finances />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
