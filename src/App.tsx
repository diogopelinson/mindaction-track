import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CheckIn from "./pages/CheckIn";
import History from "./pages/History";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AICoach from "./pages/AICoach";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Mentee-only routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requireRole="mentee">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/checkin" element={
            <ProtectedRoute requireRole="mentee">
              <CheckIn />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute requireRole="mentee">
              <History />
            </ProtectedRoute>
          } />
          <Route path="/help" element={
            <ProtectedRoute requireRole="mentee">
              <Help />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requireRole="mentee">
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/ai-coach" element={
            <ProtectedRoute requireRole="mentee">
              <AICoach />
            </ProtectedRoute>
          } />
          
          {/* Admin-only route */}
          <Route path="/admin" element={
            <ProtectedRoute requireRole="admin">
              <Admin />
            </ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
