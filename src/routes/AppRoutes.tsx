import { Routes, Route, Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useUser";
import { useIsOnboarded, useIsLoading } from "@/store/useAppStore";
import { useTelegram } from "@/providers/TelegramProvider";

// Pages
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import MyTickets from "@/pages/MyTickets";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const { isReady, isTelegramApp } = useTelegram();
  const { isLoading: userLoading } = useCurrentUser();
  const isOnboarded = useIsOnboarded();
  const isAppLoading = useIsLoading();

  // Show loading while initializing
  if (!isReady || isAppLoading || userLoading) {
    return <LoadingScreen />;
  }

  // Show onboarding for non-onboarded users (only in Telegram)
  // In browser, we skip onboarding requirement for testing
  const needsOnboarding = isTelegramApp && !isOnboarded;

  return (
    <Routes>
      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={isOnboarded ? <Navigate to="/" replace /> : <Onboarding />}
      />

      {/* Main Routes */}
      <Route
        path="/"
        element={
          needsOnboarding ? <Navigate to="/onboarding" replace /> : <Home />
        }
      />
      <Route
        path="/events"
        element={
          needsOnboarding ? <Navigate to="/onboarding" replace /> : <Events />
        }
      />
      <Route
        path="/events/:id"
        element={
          needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <EventDetail />
          )
        }
      />
      <Route
        path="/my-tickets"
        element={
          needsOnboarding ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <MyTickets />
          )
        }
      />
      <Route
        path="/profile"
        element={
          needsOnboarding ? <Navigate to="/onboarding" replace /> : <Profile />
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
