import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AppState, User } from "./types";
import SplashScreen from "./components/SplashScreen/SplashScreen";

import Navbar from "./components/Navbar";

// --- Pages ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Journal from "./pages/Journal";
import LibraryPage from "./pages/LibraryPage";
import WishlistPage from "./pages/WishlistPage";
import StatsPage from "./pages/StatsPage";
import BookClubPage from "./pages/BookClubPage";
import BookDetailPage from "./pages/BookDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";

export default function App() {
  // ---------------------------------------------------------
  // APP STATE (SplashScreen → READY)
  // ---------------------------------------------------------
  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);

  useEffect(() => {
    if (appState !== AppState.SPLASH) return;

    const timer = setTimeout(() => {
      setAppState(AppState.READY);
    }, 5000);

    return () => clearTimeout(timer);
  }, [appState]);

  // ---------------------------------------------------------
  // PWA INSTALL
  // ---------------------------------------------------------
  const [isPWA, setIsPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    setIsPWA(!!isStandalone);

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  // ---------------------------------------------------------
  // USER SESSION (PHP SESSION)
  // ---------------------------------------------------------
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Vérifier la session PHP au démarrage
  useEffect(() => {
    fetch("/api/get-user-refresh.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUser(data.user); // ✅ correction essentielle
        }
      })
      .finally(() => {
        setLoadingSession(false);
      });
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    fetch("/api/logout.php", { credentials: "include" });
    setUser(null);
  };

  // ---------------------------------------------------------
  // SPLASH SCREEN
  // ---------------------------------------------------------
  if (appState === AppState.SPLASH) {
    return <SplashScreen />;
  }

  // ---------------------------------------------------------
  // ATTENTE DE LA SESSION PHP
  // ---------------------------------------------------------
  if (loadingSession) {
    return <div className="p-10 text-center">Chargement…</div>;
  }

  // ---------------------------------------------------------
  // APP READY → ROUTER
  // ---------------------------------------------------------
  return (
    <Router>
      <div className="min-h-screen bg-paper">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onInstall={handleInstallClick}
          showInstall={!!deferredPrompt}
        />

        <main>
          <Routes>
            {/* --- Auth Pages --- */}
            <Route
              path="/login"
              element={
                !user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
              }
            />
            <Route
              path="/register"
              element={
                !user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* --- Protected Pages --- */}
            <Route
              path="/"
              element={
                user ? (
                  <Journal user={user} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            <Route
              path="/book/:id"
              element={
                user ? <BookDetailPage user={user} /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/library"
              element={
                user ? <LibraryPage user={user} /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/wishlist"
              element={
                user ? <WishlistPage user={user} /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/stats"
              element={
                user ? <StatsPage user={user} /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/shop"
              element={
                user ? <ShopPage user={user} /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/club"
              element={
                user ? <BookClubPage user={user} /> : <Navigate to="/login" />
              }
            />

            <Route
              path="/profile"
              element={
                user ? <ProfilePage user={user} /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
