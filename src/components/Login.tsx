import React, { useState } from "react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

interface LoginProps {
  onLoginSuccess?: () => void;
  onViewTopScorers?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onViewTopScorers }) => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const initUserDocument = async (user: any, customName?: string) => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        displayName: customName || user.displayName || user.email.split("@")[0] || "User",
        email: user.email,
        photoURL: user.photoURL || "",
        totalPoints: 0,
        exactScoresCount: 0,
        correctOutcomesCount: 0,
        isAdmin: false
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await initUserDocument(result.user);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          throw new Error("Username is required");
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: username });
        await initUserDocument(result.user, username);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await initUserDocument(result.user);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: "450px", margin: "2rem auto", padding: "2.5rem" }}>
      <div className="text-center" style={{ marginBottom: "2rem" }}>
        <span className="logo-icon" style={{ fontSize: "3rem", display: "block", marginBottom: "0.5rem" }}>⚽</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>{t("login_title")}</h2>
        <p style={{ color: "var(--text-sub)", fontSize: "0.95rem", marginTop: "0.5rem" }}>{t("login_sub")}</p>
      </div>

      {error && (
        <div style={{ 
          background: "rgba(239, 68, 68, 0.1)", 
          border: "1px solid rgba(239, 68, 68, 0.2)", 
          color: "#ef4444", 
          padding: "0.75rem", 
          borderRadius: "var(--radius-md)", 
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          wordBreak: "break-all"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="flex flex-col gap-2">
        {isSignUp && (
          <div className="form-group">
            <label className="form-label" htmlFor="username">{t("display_name")}</label>
            <input 
              className="form-input" 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Messi10"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="email">{t("email")}</label>
          <input 
            className="form-input" 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">{t("password")}</label>
          <input 
            className="form-input" 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
        </div>

        <button 
          className="btn btn-primary" 
          type="submit" 
          disabled={loading}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          {loading ? "..." : (isSignUp ? t("signup_btn") : t("login_btn"))}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "var(--text-light)" }}>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--border-card)" }} />
        <span style={{ padding: "0 1rem", fontSize: "0.85rem" }}>{t("or_separator")}</span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--border-card)" }} />
      </div>

      <button 
        className="btn btn-secondary" 
        onClick={handleGoogleSignIn} 
        disabled={loading}
        style={{ width: "100%" }}
      >
        <span style={{ fontSize: "1.2rem" }}>🌐</span> {t("sign_in_google")}
      </button>

      {onViewTopScorers && (
        <button
          className="btn btn-secondary"
          type="button"
          onClick={onViewTopScorers}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          {t("view_top_scores")}
        </button>
      )}

      <div className="text-center" style={{ marginTop: "1.5rem" }}>
        <button 
          className="btn-secondary"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          style={{ 
            background: "none", 
            border: "none", 
            color: "var(--color-primary)", 
            cursor: "pointer", 
            fontWeight: 600,
            fontSize: "0.9rem"
          }}
        >
          {isSignUp ? t("have_account") : t("no_account")}
        </button>
      </div>
    </div>
  );
};
export default Login;
