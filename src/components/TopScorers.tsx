import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";

interface TopScorer {
  id: string;
  displayName: string;
  photoURL: string;
  totalPoints: number;
}

export const TopScorers: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<TopScorer[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("totalPoints", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const topUsers: TopScorer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        topUsers.push({
          id: doc.id,
          displayName: data.displayName || "User",
          photoURL: data.photoURL || "",
          totalPoints: data.totalPoints || 0,
        });
      });
      setUsers(topUsers);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="glass-card animate-fade-in" style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>{t("top_scores_title")}</h2>
          <p style={{ margin: "0.65rem 0 0", color: "var(--text-sub)", fontSize: "0.95rem" }}>{t("top_scores_subtitle")}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-light)" }}>
          {t("top_scores_no_users")}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {users.map((user, index) => (
            <div key={user.id} className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
              <div style={{ position: "relative", width: "84px", height: "84px", margin: "0 auto 0.85rem", borderRadius: "50%", overflow: "visible", display: "grid", placeItems: "center", background: "var(--border-card)", zIndex: 0 }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-primary)", color: "white", fontSize: "1.75rem", fontWeight: 700 }}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ position: "absolute", bottom: "-8px", right: "-8px", background: "var(--color-primary)", color: "white", borderRadius: "50%", width: "34px", height: "34px", display: "grid", placeItems: "center", fontWeight: 700, boxShadow: "0 0 0 4px rgba(255,255,255,0.65)", zIndex: 2 }}>
                  {index + 1}
                </span>
              </div>

              <div style={{ marginBottom: "0.35rem", fontWeight: 700, color: "var(--text-light)" }}>{user.displayName}</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--color-primary)" }}>
                {user.totalPoints} {t("points_short")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopScorers;
