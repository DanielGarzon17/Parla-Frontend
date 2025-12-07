import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./contexts/AuthProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ThemeToggle from "./components/ThemeToggle";
import Login from "./pages/Login";
import Index from "./pages/Index";
import MatchCards from "./pages/MatchCards";
import Time_Trial from "./pages/Time_Trial";
import FlashCards from "./pages/FlashCards";
import Progress from "./pages/Progress";
import SavedPhrases from "./pages/SavedPhrases";
import Dictionary from "./pages/Dictionary";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ThemeToggle />
            <BrowserRouter>
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/match" element={
                <ProtectedRoute>
                  <Layout>
                    <MatchCards />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/timetrial" element={
                <ProtectedRoute>
                  <Layout>
                    <Time_Trial />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/flashcards" element={
                <ProtectedRoute>
                  <Layout>
                    <FlashCards />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <Layout>
                    <Progress />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/phrases" element={
                <ProtectedRoute>
                  <Layout>
                    <SavedPhrases />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dictionary" element={
                <ProtectedRoute>
                  <Layout>
                    <Dictionary />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              } />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
