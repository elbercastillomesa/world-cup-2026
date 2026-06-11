import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { Lock, Unlock, Save, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  kickoff: any; // Timestamp
  stage: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "finished";
}

interface Prediction {
  id: string;
  uid: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned: number | null;
  resultStatus: "exact" | "outcome" | "wrong" | null;
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
}

interface DashboardProps {
  currentUser: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const { t, language } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [otherPredictions, setOtherPredictions] = useState<Record<string, Prediction[]>>({});
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  
  // Local state for predictions editing before saving
  const [predInputs, setPredInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [savingStatus, setSavingStatus] = useState<Record<string, string>>({});
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedStage, setSelectedStage] = useState<string>("all");

  // Keep track of current time for live locking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // 1. Listen to all users to display profiles on predictions list
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersMap: Record<string, UserProfile> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        usersMap[doc.id] = {
          uid: doc.id,
          displayName: data.displayName || "User",
          photoURL: data.photoURL || ""
        };
      });
      setUsers(usersMap);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to matches
  useEffect(() => {
    const q = query(collection(db, "matches"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchesList: Match[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        matchesList.push({
          id: doc.id,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          homeFlag: data.homeFlag,
          awayFlag: data.awayFlag,
          kickoff: data.kickoff,
          stage: data.stage,
          homeScore: data.homeScore !== undefined ? data.homeScore : null,
          awayScore: data.awayScore !== undefined ? data.awayScore : null,
          status: data.status || "scheduled"
        });
      });
      // Sort matches by kickoff time
      matchesList.sort((a, b) => {
        const timeA = a.kickoff?.toDate().getTime() || 0;
        const timeB = b.kickoff?.toDate().getTime() || 0;
        return timeA - timeB;
      });
      setMatches(matchesList);
    });
    return () => unsubscribe();
  }, []);

  // 3. Listen to current user's predictions
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "predictions"), where("uid", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const predsMap: Record<string, Prediction> = {};
      const inputsMap: Record<string, { home: string; away: string }> = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as Prediction;
        predsMap[data.matchId] = data;
        inputsMap[data.matchId] = {
          home: data.homeScore.toString(),
          away: data.awayScore.toString()
        };
      });
      setPredictions(predsMap);
      setPredInputs(prev => ({ ...prev, ...inputsMap }));
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 4. Fetch predictions from other users for expanded locked matches
  useEffect(() => {
    if (!expandedMatchId) return;
    
    // Check if match is locked
    const match = matches.find(m => m.id === expandedMatchId);
    if (!match) return;
    const isLocked = match.kickoff?.toDate() <= currentTime;
    if (!isLocked) return;

    const q = query(collection(db, "predictions"), where("matchId", "==", expandedMatchId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const otherPredsList: Prediction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Prediction;
        // Don't duplicate current user
        if (data.uid !== currentUser?.uid) {
          otherPredsList.push(data);
        }
      });
      setOtherPredictions(prev => ({ ...prev, [expandedMatchId]: otherPredsList }));
    });
    return () => unsubscribe();
  }, [expandedMatchId, matches, currentTime, currentUser]);

  // Handle score prediction input change
  const handleInputChange = (matchId: string, side: "home" | "away", val: string) => {
    // Only digits
    const cleaned = val.replace(/\D/g, "");
    setPredInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        home: side === "home" ? cleaned : prev[matchId]?.home || "",
        away: side === "away" ? cleaned : prev[matchId]?.away || ""
      }
    }));
  };

  // Save prediction to firestore
  const savePrediction = async (matchId: string) => {
    const input = predInputs[matchId];
    if (!input || input.home === "" || input.away === "") return;
    
    setSavingStatus(prev => ({ ...prev, [matchId]: "saving" }));
    try {
      const predictionId = `${currentUser.uid}_${matchId}`;
      const predRef = doc(db, "predictions", predictionId);
      await setDoc(predRef, {
        id: predictionId,
        uid: currentUser.uid,
        matchId,
        homeScore: parseInt(input.home),
        awayScore: parseInt(input.away),
        pointsEarned: null,
        resultStatus: null,
        updatedAt: serverTimestamp()
      });
      setSavingStatus(prev => ({ ...prev, [matchId]: "success" }));
      setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [matchId]: "" }));
      }, 2000);
    } catch (err) {
      console.error("Error saving prediction:", err);
      setSavingStatus(prev => ({ ...prev, [matchId]: "error" }));
    }
  };

  // Format date in GMT-5
  const formatKickoff = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat(language === "es" ? "es-CO" : "en-US", {
      timeZone: "America/Bogota", // Enforce America/Bogota (GMT-5)
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(date);
  };

  // Format remaining time or lock status
  const getRemainingTimeStr = (kickoffTimestamp: any) => {
    if (!kickoffTimestamp) return "";
    const kickoff = kickoffTimestamp.toDate();
    const diff = kickoff.getTime() - currentTime.getTime();

    if (diff <= 0) {
      return "locked";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Unique list of stages for filtering
  const stages = ["all", ...new Set(matches.map(m => m.stage))];

  const filteredMatches = selectedStage === "all" 
    ? matches 
    : matches.filter(m => m.stage === selectedStage);

  return (
    <div className="animate-fade-in">
      {/* Filter Tabs */}
      {stages.length > 1 && (
        <div className="app-tabs">
          {stages.map((stage) => (
            <button
              key={stage}
              type="button"
              className={`tab-btn ${selectedStage === stage ? "active" : ""}`}
              onClick={() => setSelectedStage(stage)}
            >
              {stage === "all" ? (language === "es" ? "Todos" : "All") : stage}
            </button>
          ))}
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: "3rem" }}>
          <p style={{ color: "var(--text-sub)" }}>{t("no_matches")}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {filteredMatches.map((match) => {
            const kickoffDate = match.kickoff?.toDate();
            const isLocked = kickoffDate <= currentTime;
            const remaining = getRemainingTimeStr(match.kickoff);
            
            const userPrediction = predictions[match.id];
            const inputs = predInputs[match.id] || { home: "", away: "" };
            const saving = savingStatus[match.id];
            
            const isExpanded = expandedMatchId === match.id;
            const others = otherPredictions[match.id] || [];

            return (
              <div 
                key={match.id} 
                className="glass-card" 
                style={{ 
                  background: "var(--bg-card)",
                  backgroundImage: "var(--card-grass-bg)",
                  position: "relative"
                }}
              >
                {/* Match Stage & Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ 
                    fontSize: "0.8rem", 
                    fontWeight: 700, 
                    textTransform: "uppercase", 
                    letterSpacing: "0.05em",
                    color: "var(--color-primary)",
                    background: "light-dark(rgba(22, 163, 74, 0.08), rgba(22, 163, 74, 0.15))",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px"
                  }}>
                    {match.stage}
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-sub)" }}>
                    <Calendar size={14} />
                    <span>{formatKickoff(match.kickoff)}</span>
                  </div>
                </div>

                {/* Main Scoreboard Layout */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr auto 1fr", 
                  alignItems: "center", 
                  gap: "1rem", 
                  padding: "0.5rem 0" 
                }}>
                  {/* Home Team */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <span style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>{match.homeFlag}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem" }}>{match.homeTeam}</span>
                  </div>

                  {/* Actual Match Result or VS */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                    {match.status === "finished" ? (
                      <div style={{ 
                        fontFamily: "var(--font-display)", 
                        fontSize: "2rem", 
                        fontWeight: 800, 
                        letterSpacing: "0.1em",
                        color: "var(--text-main)"
                      }}>
                        {match.homeScore} - {match.awayScore}
                      </div>
                    ) : match.status === "live" ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 700, 
                          color: "#ef4444", 
                          textTransform: "uppercase",
                          animation: "pulse 1.5s infinite"
                        }}>
                          ● {t("status_live")}
                        </span>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800 }}>
                          {match.homeScore} - {match.awayScore}
                        </div>
                      </div>
                    ) : (
                      <span style={{ 
                        fontFamily: "var(--font-display)", 
                        fontSize: "0.9rem", 
                        fontWeight: 800, 
                        color: "var(--text-light)",
                        background: "light-dark(rgba(0,0,0,0.03), rgba(255,255,255,0.03))",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px dashed var(--border-card)"
                      }}>
                        VS
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <span style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>{match.awayFlag}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem" }}>{match.awayTeam}</span>
                  </div>
                </div>

                {/* Prediction Input / Locked view */}
                <div style={{ 
                  marginTop: "1.5rem", 
                  padding: "1rem", 
                  borderRadius: "var(--radius-md)", 
                  background: "light-dark(rgba(0,0,0,0.02), rgba(255,255,255,0.02))",
                  border: "1px solid var(--border-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-sub)" }}>
                      {t("your_prediction")}
                    </span>
                    
                    {isLocked ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 500 }}>
                        <Lock size={12} />
                        {t("match_locked")}
                      </span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 600 }}>
                        <Unlock size={12} />
                        {t("match_open")} {remaining !== "locked" ? `(${t("time_remaining")}: ${remaining})` : ""}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                    {isLocked ? (
                      // Locked Prediction View
                      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        {userPrediction ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                              {userPrediction.homeScore} - {userPrediction.awayScore}
                            </span>
                            
                            {/* Points result indicator if match finished */}
                            {match.status === "finished" && userPrediction.pointsEarned !== null && (
                              <span style={{ 
                                fontSize: "0.85rem", 
                                fontWeight: 700, 
                                padding: "0.25rem 0.75rem", 
                                borderRadius: "9999px",
                                background: userPrediction.resultStatus === "exact" 
                                  ? "rgba(34, 197, 94, 0.15)" 
                                  : userPrediction.resultStatus === "outcome" 
                                    ? "rgba(245, 158, 11, 0.15)" 
                                    : "rgba(239, 68, 68, 0.15)",
                                color: userPrediction.resultStatus === "exact" 
                                  ? "#22c55e" 
                                  : userPrediction.resultStatus === "outcome" 
                                    ? "#f59e0b" 
                                    : "#ef4444"
                              }}>
                                {userPrediction.resultStatus === "exact" 
                                  ? t("exact_match") 
                                  : userPrediction.resultStatus === "outcome" 
                                    ? t("outcome_match") 
                                    : t("no_points")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-light)", fontSize: "0.9rem", fontStyle: "italic" }}>
                            {language === "es" ? "No ingresaste pronóstico" : "No prediction entered"}
                          </span>
                        )}
                      </div>
                    ) : (
                      // Open Prediction Edit Form
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", justifyContent: "center" }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={inputs.home}
                          onChange={(e) => handleInputChange(match.id, "home", e.target.value)}
                          placeholder="-"
                          style={{ 
                            width: "50px", 
                            height: "44px", 
                            textAlign: "center", 
                            fontSize: "1.25rem", 
                            fontWeight: 700,
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-card)",
                            background: "light-dark(#ffffff, rgba(0,0,0,0.2))",
                            color: "var(--text-main)"
                          }}
                          aria-label={`${match.homeTeam} prediction`}
                        />
                        <span style={{ color: "var(--text-light)", fontWeight: 600 }}>-</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={inputs.away}
                          onChange={(e) => handleInputChange(match.id, "away", e.target.value)}
                          placeholder="-"
                          style={{ 
                            width: "50px", 
                            height: "44px", 
                            textAlign: "center", 
                            fontSize: "1.25rem", 
                            fontWeight: 700,
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-card)",
                            background: "light-dark(#ffffff, rgba(0,0,0,0.2))",
                            color: "var(--text-main)"
                          }}
                          aria-label={`${match.awayTeam} prediction`}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={saving === "saving" || inputs.home === "" || inputs.away === ""}
                          onClick={() => savePrediction(match.id)}
                          style={{ minHeight: "44px", padding: "0 1rem", marginLeft: "1rem" }}
                        >
                          <Save size={16} />
                          <span>
                            {saving === "saving" 
                              ? "..." 
                              : saving === "success" 
                                ? "✓" 
                                : t("save_prediction")}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expand Accordion to show Other Users' Predictions */}
                {isLocked && (
                  <div style={{ marginTop: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "var(--color-primary)", 
                        cursor: "pointer", 
                        fontWeight: 600, 
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.5rem 0"
                      }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span>{t("predictions_title")}</span>
                    </button>

                    {isExpanded && (
                      <div 
                        style={{ 
                          marginTop: "0.75rem",
                          borderTop: "1px dashed var(--border-card)",
                          paddingTop: "0.75rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem"
                        }}
                      >
                        {others.length === 0 ? (
                          <p style={{ color: "var(--text-light)", fontStyle: "italic", fontSize: "0.85rem" }}>
                            {t("no_predictions")}
                          </p>
                        ) : (
                          <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                            {others.map((pred) => {
                              const userObj = users[pred.uid];
                              const name = userObj?.displayName || "User";
                              const photo = userObj?.photoURL;
                              
                              return (
                                <div 
                                  key={pred.id} 
                                  style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "space-between", 
                                    padding: "0.4rem 0.75rem", 
                                    borderRadius: "var(--radius-sm)",
                                    background: "light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.01))",
                                    border: "1px solid var(--border-card)"
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
                                    {photo ? (
                                      <img 
                                        src={photo} 
                                        alt="" 
                                        style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} 
                                      />
                                    ) : (
                                      <div style={{ 
                                        width: "24px", 
                                        height: "24px", 
                                        borderRadius: "50%", 
                                        background: "var(--color-primary)", 
                                        color: "white", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        fontSize: "0.7rem",
                                        fontWeight: 750
                                      }}>
                                        {name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span style={{ 
                                      fontSize: "0.85rem", 
                                      fontWeight: 500, 
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: "90px"
                                    }}>
                                      {name}
                                    </span>
                                  </div>
                                  
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span style={{ fontSize: "0.9rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                                      {pred.homeScore} - {pred.awayScore}
                                    </span>

                                    {/* Small checkmark or points badge for others if finished */}
                                    {match.status === "finished" && pred.pointsEarned !== null && (
                                      <span style={{ 
                                        fontSize: "0.7rem", 
                                        fontWeight: 700, 
                                        color: pred.resultStatus === "exact" 
                                          ? "#22c55e" 
                                          : pred.resultStatus === "outcome" 
                                            ? "#f59e0b" 
                                            : "#ef4444"
                                      }}>
                                        ({pred.pointsEarned}p)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Dashboard;
