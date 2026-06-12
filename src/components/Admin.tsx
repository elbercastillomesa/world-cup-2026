import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { useLanguage } from "../context/LanguageContext";
import { seedData as groupPhaseMatches } from "../utils/seedMatches";
import { Trash2, Edit, Save, CheckCircle, Database } from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  kickoff: any;
  stage: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "finished";
}

export const Admin: React.FC = () => {
  const { t, language } = useLanguage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeFlag, setHomeFlag] = useState("");
  const [awayFlag, setAwayFlag] = useState("");
  const [stage, setStage] = useState("Group Stage");
  const [kickoff, setKickoff] = useState("");
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  // Score Entry state
  const [scoreInputs, setScoreInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [calcStatus, setCalcStatus] = useState<Record<string, string>>({});

  // 1. Listen to matches
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
      // Sort matches by kickoff descending (newest first)
      matchesList.sort((a, b) => {
        const timeA = a.kickoff?.toDate().getTime() || 0;
        const timeB = b.kickoff?.toDate().getTime() || 0;
        return timeB - timeA;
      });
      setMatches(matchesList);

      // Pre-fill score inputs
      const prefillScores: Record<string, { home: string; away: string }> = {};
      matchesList.forEach(m => {
        prefillScores[m.id] = {
          home: m.homeScore !== null ? m.homeScore.toString() : "",
          away: m.awayScore !== null ? m.awayScore.toString() : ""
        };
      });
      setScoreInputs(prev => ({ ...prev, ...prefillScores }));
    });
    return () => unsubscribe();
  }, []);

  // Formats a date to the browser-local datetime-local input value: YYYY-MM-DDTHH:MM
  const dateToInputString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 2. Add or Update Match
  const handleSubmitMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || !kickoff) return;

    try {
      // Parse the datetime-local input as the browser local time
      const kickoffDate = new Date(kickoff);
      const matchData = {
        homeTeam,
        awayTeam,
        homeFlag: homeFlag || "🏳️",
        awayFlag: awayFlag || "🏳️",
        kickoff: Timestamp.fromDate(kickoffDate),
        stage,
        status: editingMatchId ? matches.find(m => m.id === editingMatchId)?.status || "scheduled" : "scheduled"
      };

      const matchId = editingMatchId || `match_${Date.now()}`;
      await setDoc(doc(db, "matches", matchId), matchData, { merge: true });

      // Clear Form
      setHomeTeam("");
      setAwayTeam("");
      setHomeFlag("");
      setAwayFlag("");
      setKickoff("");
      setEditingMatchId(null);
    } catch (err) {
      console.error("Error saving match:", err);
    }
  };

  // Delete Match
  const handleDeleteMatch = async (matchId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este partido?")) return;
    try {
      await deleteDoc(doc(db, "matches", matchId));
    } catch (err) {
      console.error("Error deleting match:", err);
    }
  };

  // Edit Mode Toggle
  const handleEditMatch = (match: Match) => {
    setEditingMatchId(match.id);
    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);
    setHomeFlag(match.homeFlag);
    setAwayFlag(match.awayFlag);
    setStage(match.stage);
    if (match.kickoff) {
      setKickoff(dateToInputString(match.kickoff.toDate()));
    }
  };

  // 3. Point Calculation & Final Score Entry
  const handleScoreChange = (matchId: string, side: "home" | "away", val: string) => {
    const cleaned = val.replace(/\D/g, "");
    setScoreInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        home: side === "home" ? cleaned : prev[matchId]?.home || "",
        away: side === "away" ? cleaned : prev[matchId]?.away || ""
      }
    }));
  };

  // Recalculates user scores based on final match outcome
  const calculatePointsForMatch = async (matchId: string) => {
    const scores = scoreInputs[matchId];
    if (!scores || scores.home === "" || scores.away === "") return;

    const hScore = parseInt(scores.home);
    const aScore = parseInt(scores.away);

    setCalcStatus(prev => ({ ...prev, [matchId]: "calculating" }));

    try {
      // 1. Update Match Doc in Firestore
      const matchRef = doc(db, "matches", matchId);
      await updateDoc(matchRef, {
        homeScore: hScore,
        awayScore: aScore,
        status: "finished"
      });

      // 2. Fetch all predictions for this match
      const predsSnapshot = await getDocs(collection(db, "predictions"));
      const batch = writeBatch(db);

      const matchPredictions = predsSnapshot.docs.filter(
        doc => doc.data().matchId === matchId
      );

      // 3. Calculate points for each prediction
      matchPredictions.forEach((pDoc) => {
        const pData = pDoc.data();
        const pH = pData.homeScore;
        const pA = pData.awayScore;

        let points = 0;
        let resStatus: "exact" | "outcome" | "wrong" = "wrong";

        if (pH === hScore && pA === aScore) {
          points = 3;
          resStatus = "exact";
        } else {
          const actualDiff = hScore - aScore;
          const predDiff = pH - pA;
          // Check if outcomes match (both home win, both away win, or both draw)
          if ((actualDiff > 0 && predDiff > 0) || (actualDiff < 0 && predDiff < 0) || (actualDiff === 0 && predDiff === 0)) {
            points = 1;
            resStatus = "outcome";
          } else {
            points = 0;
            resStatus = "wrong";
          }
        }

        batch.update(pDoc.ref, {
          pointsEarned: points,
          resultStatus: resStatus
        });
      });

      await batch.commit();

      // 4. Recalculate ALL users' total points and counts
      await recalculateAllUsers();

      setCalcStatus(prev => ({ ...prev, [matchId]: "success" }));
      setTimeout(() => {
        setCalcStatus(prev => ({ ...prev, [matchId]: "" }));
      }, 2000);
    } catch (err) {
      console.error("Error calculating points:", err);
      setCalcStatus(prev => ({ ...prev, [matchId]: "error" }));
    }
  };

  // Recalculates stats for all users based on all processed predictions
  const recalculateAllUsers = async () => {
    // Fetch all predictions and all users
    const predsSnap = await getDocs(collection(db, "predictions"));
    const usersSnap = await getDocs(collection(db, "users"));

    const userStats: Record<string, { points: number; exact: number; outcome: number }> = {};

    // Initialize stats map for all existing users
    usersSnap.forEach((uDoc) => {
      userStats[uDoc.id] = { points: 0, exact: 0, outcome: 0 };
    });

    // Accumulate prediction results
    predsSnap.forEach((pDoc) => {
      const pred = pDoc.data();
      if (pred.pointsEarned !== null && userStats[pred.uid]) {
        userStats[pred.uid].points += pred.pointsEarned;
        if (pred.resultStatus === "exact") userStats[pred.uid].exact += 1;
        if (pred.resultStatus === "outcome") userStats[pred.uid].outcome += 1;
      }
    });

    // Batch update users in database
    const batch = writeBatch(db);
    Object.entries(userStats).forEach(([uid, stats]) => {
      const userRef = doc(db, "users", uid);
      batch.update(userRef, {
        totalPoints: stats.points,
        exactScoresCount: stats.exact,
        correctOutcomesCount: stats.outcome
      });
    });

    await batch.commit();
  };

  // Seed Initial World Cup Matches
  const seedMatches = async () => {
    if (!window.confirm("¿Deseas sembrar partidos iniciales de prueba?")) return;

    // Define seed matches using explicit kickoff timestamps
    const seedData = groupPhaseMatches;

    try {
      const batch = writeBatch(db);
      seedData.forEach((match) => {
        batch.set(doc(db, "matches", match.id), {
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeFlag: match.homeFlag,
          awayFlag: match.awayFlag,
          stage: match.stage,
          kickoff: match.kickoff,
          status: match.status,
          homeScore: match.homeScore,
          awayScore: match.awayScore
        }, { merge: true });
      });
      await batch.commit();
      alert("¡Partidos sembrados con éxito!");
    } catch (err) {
      console.error("Error seeding matches:", err);
      alert("Error al sembrar partidos: " + err);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{t("admin_title")}</h2>

        {/* Seed Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={seedMatches}
          style={{ gap: "0.5rem" }}
        >
          <Database size={16} />
          <span>{t("seed_matches_btn")}</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>

        {/* 1. Add / Edit Match Form */}
        <div className="glass-card">
          <h3>{editingMatchId ? t("edit_match_title") : t("add_match_title")}</h3>
          <form onSubmit={handleSubmitMatch} className="flex flex-col gap-2 mt-4">

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="hTeam">{t("home_team")}</label>
                <input id="hTeam" className="form-input" type="text" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="aTeam">{t("away_team")}</label>
                <input id="aTeam" className="form-input" type="text" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="hFlag">{t("home_flag")}</label>
                <input id="hFlag" className="form-input" type="text" value={homeFlag} onChange={e => setHomeFlag(e.target.value)} placeholder="e.g. 🇲🇽" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="aFlag">{t("away_flag")}</label>
                <input id="aFlag" className="form-input" type="text" value={awayFlag} onChange={e => setAwayFlag(e.target.value)} placeholder="e.g. 🇨🇴" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="matchStage">{t("stage")}</label>
              <input id="matchStage" className="form-input" type="text" value={stage} onChange={e => setStage(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="kickoffDate">{t("kickoff_label")}</label>
              <input id="kickoffDate" className="form-input" type="datetime-local" value={kickoff} onChange={e => setKickoff(e.target.value)} required />
            </div>

            <div className="flex gap-2" style={{ marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Save size={16} />
                <span>{t("submit_match")}</span>
              </button>
              {editingMatchId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingMatchId(null);
                    setHomeTeam("");
                    setAwayTeam("");
                    setHomeFlag("");
                    setAwayFlag("");
                    setKickoff("");
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 2. Matches List & Score Inputting */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3>{t("tab_matches")}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "450px", overflowY: "auto", paddingRight: "0.25rem" }}>
            {matches.length === 0 ? (
              <p style={{ color: "var(--text-light)", fontStyle: "italic" }}>{language === "es" ? "No hay partidos" : "No matches"}</p>
            ) : (
              matches.map((match) => {
                const scores = scoreInputs[match.id] || { home: "", away: "" };
                const cStatus = calcStatus[match.id];

                return (
                  <div
                    key={match.id}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      background: "light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.015))",
                      border: "1px solid var(--border-card)"
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-sub)", marginBottom: "0.5rem" }}>
                      <span>{match.stage}</span>
                      <span>{match.status === "finished" ? t("status_finished") : match.status === "live" ? t("status_live") : t("status_scheduled")}</span>
                    </div>

                    {/* Flags / Teams */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.5rem 0" }}>
                      <span style={{ fontWeight: 600 }}>
                        {match.homeFlag} {match.homeTeam} vs {match.awayTeam} {match.awayFlag}
                      </span>

                      <div className="flex gap-2">
                        <button type="button" className="btn btn-secondary" style={{ padding: "0.25rem", minWidth: "32px", minHeight: "32px" }} onClick={() => handleEditMatch(match)} title="Editar">
                          <Edit size={14} />
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ padding: "0.25rem", minWidth: "32px", minHeight: "32px", color: "#ef4444" }} onClick={() => handleDeleteMatch(match.id)} title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Score Entry Panel */}
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem",
                        borderRadius: "var(--radius-sm)",
                        background: "light-dark(rgba(0,0,0,0.015), rgba(255,255,255,0.005))",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        justifyContent: "space-between"
                      }}
                    >
                      <span style={{ fontSize: "0.8rem", color: "var(--text-sub)", fontWeight: 500 }}>
                        {t("set_result_title")}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={scores.home}
                          onChange={(e) => handleScoreChange(match.id, "home", e.target.value)}
                          placeholder="-"
                          style={{ width: "32px", height: "32px", textAlign: "center", fontSize: "0.9rem", fontWeight: "bold", border: "1px solid var(--border-card)", borderRadius: "4px" }}
                          aria-label={`Home score result for ${match.homeTeam}`}
                        />
                        <span>-</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={scores.away}
                          onChange={(e) => handleScoreChange(match.id, "away", e.target.value)}
                          placeholder="-"
                          style={{ width: "32px", height: "32px", textAlign: "center", fontSize: "0.9rem", fontWeight: "bold", border: "1px solid var(--border-card)", borderRadius: "4px" }}
                          aria-label={`Away score result for ${match.awayTeam}`}
                        />
                        <button
                          type="button"
                          className="btn btn-accent"
                          disabled={cStatus === "calculating" || scores.home === "" || scores.away === ""}
                          onClick={() => calculatePointsForMatch(match.id)}
                          style={{ height: "32px", padding: "0 0.5rem", minHeight: "32px", minWidth: "32px" }}
                        >
                          {cStatus === "calculating" ? "..." : cStatus === "success" ? <CheckCircle size={14} /> : t("recalculate_btn")}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Admin;
