import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useLanguage } from "./context/LanguageContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import Rules from "./components/Rules";
import Admin from "./components/Admin";
import { Calendar, Trophy, HelpCircle, Shield, LogOut } from "lucide-react";

export const AppContent: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"matches" | "leaderboard" | "rules" | "admin">("matches");

  // Handle Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle Firestore user profile updates in real-time
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching user profile:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab("matches");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        gap: "1rem"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--border-card)",
          borderTopColor: "var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <span style={{ color: "var(--text-sub)", fontSize: "0.9rem" }}>
          {language === "es" ? "Cargando polla..." : "Loading sweepstakes..."}
        </span>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        ` }} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="header-nav">
        <div className="logo-section">
          <span className="logo-icon">🏆</span>
          <h1 className="logo-title">POLLA 2026</h1>
        </div>

        <div className="nav-actions">
          {/* Language Selector Toggle */}
          <div className="lang-toggle">
            <button 
              type="button" 
              className={`lang-toggle-btn ${language === "es" ? "active" : ""}`}
              onClick={() => setLanguage("es")}
            >
              ES
            </button>
            <button 
              type="button" 
              className={`lang-toggle-btn ${language === "en" ? "active" : ""}`}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
          </div>

          {/* User profile details and logout */}
          {user && profile && (
            <div className="flex items-center gap-4">
              <div className="user-badge">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="" />
                ) : (
                  <div style={{ 
                    width: "32px", 
                    height: "32px", 
                    borderRadius: "50%", 
                    background: "var(--color-primary)", 
                    color: "white", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: "bold"
                  }}>
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-badge-name">{profile.displayName}</span>
              </div>

              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={handleLogout}
                style={{ padding: "0.5rem", minHeight: "36px", minWidth: "36px" }}
                title={t("logout")}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Areas */}
      {!user ? (
        <Login onLoginSuccess={() => setActiveTab("matches")} />
      ) : (
        <main>
          {/* Navigation Tabs bar */}
          <div className="app-tabs">
            <button 
              type="button" 
              className={`tab-btn ${activeTab === "matches" ? "active" : ""}`}
              onClick={() => setActiveTab("matches")}
            >
              <Calendar size={16} />
              <span>{t("tab_matches")}</span>
            </button>
            
            <button 
              type="button" 
              className={`tab-btn ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => setActiveTab("leaderboard")}
            >
              <Trophy size={16} />
              <span>{t("tab_leaderboard")}</span>
            </button>

            <button 
              type="button" 
              className={`tab-btn ${activeTab === "rules" ? "active" : ""}`}
              onClick={() => setActiveTab("rules")}
            >
              <HelpCircle size={16} />
              <span>{t("tab_rules")}</span>
            </button>

            {profile?.isAdmin && (
              <button 
                type="button" 
                className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => setActiveTab("admin")}
                style={{ color: "var(--color-accent)" }}
              >
                <Shield size={16} />
                <span>{t("tab_admin")}</span>
              </button>
            )}
          </div>

          {/* Active Tab Panel */}
          <div style={{ marginTop: "1rem" }}>
            {activeTab === "matches" && <Dashboard currentUser={user} />}
            {activeTab === "leaderboard" && <Leaderboard currentUser={user} />}
            {activeTab === "rules" && <Rules />}
            {activeTab === "admin" && profile?.isAdmin && <Admin />}
          </div>
        </main>
      )}
    </div>
  );
};
export default AppContent;
