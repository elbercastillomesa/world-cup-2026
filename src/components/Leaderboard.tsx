import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { Trophy, Search, Star } from "lucide-react";

interface UserProfile {
  id: string;
  displayName: string;
  photoURL: string;
  totalPoints: number;
  exactScoresCount: number;
  correctOutcomesCount: number;
}

interface LeaderboardProps {
  currentUser: any;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Query users sorted by points, then by exact scores count
    const q = query(
      collection(db, "users"),
      orderBy("totalPoints", "desc"),
      orderBy("exactScoresCount", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          displayName: data.displayName || "User",
          photoURL: data.photoURL || "",
          totalPoints: data.totalPoints || 0,
          exactScoresCount: data.exactScoresCount || 0,
          correctOutcomesCount: data.correctOutcomesCount || 0
        });
      });
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy size={18} color="var(--gold)" style={{ display: "inline", verticalAlign: "middle" }} />;
    if (rank === 2) return <Trophy size={18} color="var(--silver)" style={{ display: "inline", verticalAlign: "middle" }} />;
    if (rank === 3) return <Trophy size={18} color="var(--bronze)" style={{ display: "inline", verticalAlign: "middle" }} />;
    return <span style={{ fontWeight: 600, color: "var(--text-light)" }}>#{rank}</span>;
  };

  return (
    <div className="glass-card animate-fade-in" style={{ backgroundImage: "var(--card-trophy-bg)" }}>
      {/* Header and Search */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trophy color="var(--color-accent)" />
          {t("tab_leaderboard")}
        </h2>
        
        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "220px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }}>
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-input"
            placeholder={language === "es" ? "Buscar amigo..." : "Search friend..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "2.2rem", width: "100%", height: "40px" }}
          />
        </div>
      </div>

      {/* Podium Cards for Top 3 */}
      {filteredUsers.length > 0 && searchTerm === "" && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
          gap: "1rem", 
          marginBottom: "2rem",
          alignItems: "end"
        }}>
          {/* 2nd Place */}
          {filteredUsers[1] && (
            <div className="glass-card" style={{ padding: "1rem", textAlign: "center", borderTop: "4px solid var(--silver)", order: 1 }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
                {filteredUsers[1].photoURL ? (
                  <img src={filteredUsers[1].photoURL} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid var(--silver)" }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--silver)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {filteredUsers[1].displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ position: "absolute", bottom: "-5px", right: "-5px", background: "var(--silver)", color: "white", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>2</span>
              </div>
              <h4 style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", fontSize: "0.9rem" }}>{filteredUsers[1].displayName}</h4>
              <p style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--color-primary)", marginTop: "0.25rem" }}>{filteredUsers[1].totalPoints} {t("points_short")}</p>
            </div>
          )}

          {/* 1st Place */}
          {filteredUsers[0] && (
            <div className="glass-card" style={{ padding: "1.5rem 1rem", textAlign: "center", borderTop: "4px solid var(--gold)", order: 2, transform: "scale(1.05)", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
                {filteredUsers[0].photoURL ? (
                  <img src={filteredUsers[0].photoURL} alt="" style={{ width: "64px", height: "64px", borderRadius: "50%", border: "3px solid var(--gold)" }} />
                ) : (
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--gold)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.5rem" }}>
                    {filteredUsers[0].displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ position: "absolute", bottom: "-5px", right: "-5px", background: "var(--gold)", color: "white", borderRadius: "50%", width: "24px", height: "24px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>1</span>
              </div>
              <h3 style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{filteredUsers[0].displayName}</h3>
              <p style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--color-primary)", marginTop: "0.25rem" }}>{filteredUsers[0].totalPoints} {t("points_short")}</p>
            </div>
          )}

          {/* 3rd Place */}
          {filteredUsers[2] && (
            <div className="glass-card" style={{ padding: "1rem", textAlign: "center", borderTop: "4px solid var(--bronze)", order: 3 }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
                {filteredUsers[2].photoURL ? (
                  <img src={filteredUsers[2].photoURL} alt="" style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid var(--bronze)" }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bronze)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {filteredUsers[2].displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ position: "absolute", bottom: "-5px", right: "-5px", background: "var(--bronze)", color: "white", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>3</span>
              </div>
              <h4 style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", fontSize: "0.9rem" }}>{filteredUsers[2].displayName}</h4>
              <p style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--color-primary)", marginTop: "0.25rem" }}>{filteredUsers[2].totalPoints} {t("points_short")}</p>
            </div>
          )}
        </div>
      )}

      {/* Table Rankings */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-card)", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-light)" }}>{t("rank")}</th>
              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-light)" }}>{t("user")}</th>
              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-light)", textAlign: "center" }}>{t("exact_count")}</th>
              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-light)", textAlign: "center" }}>{t("outcome_count")}</th>
              <th style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-light)", textAlign: "right" }}>{t("points")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--text-light)", fontStyle: "italic" }}>
                  {t("no_users")}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const rank = users.findIndex(u => u.id === user.id) + 1;
                const isMe = currentUser && currentUser.uid === user.id;

                return (
                  <tr 
                    key={user.id} 
                    style={{ 
                      borderBottom: "1px solid var(--border-card)",
                      background: isMe ? "light-dark(rgba(22, 163, 74, 0.05), rgba(22, 163, 74, 0.02))" : "transparent",
                      fontWeight: isMe ? "700" : "inherit"
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: "1rem" }}>
                      {getRankBadge(rank)}
                    </td>

                    {/* User Profile Info */}
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            background: isMe ? "var(--color-primary)" : "var(--text-light)", 
                            color: "white", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            fontSize: "0.9rem",
                            fontWeight: "bold"
                          }}>
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          {user.displayName}
                          {isMe && <span title="Tú"><Star size={12} fill="var(--color-accent)" color="var(--color-accent)" /></span>}
                        </span>
                      </div>
                    </td>

                    {/* Exact count */}
                    <td style={{ padding: "1rem", textAlign: "center", color: "var(--text-sub)" }}>
                      {user.exactScoresCount}
                    </td>

                    {/* Outcome count */}
                    <td style={{ padding: "1rem", textAlign: "center", color: "var(--text-sub)" }}>
                      {user.correctOutcomesCount}
                    </td>

                    {/* Total Points */}
                    <td style={{ padding: "1rem", textAlign: "right", fontSize: "1.1rem", fontWeight: 800, color: "var(--color-primary)" }}>
                      {user.totalPoints} {t("points_short")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Leaderboard;
