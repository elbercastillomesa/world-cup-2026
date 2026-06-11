import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { HelpCircle, Star, Award, XCircle, Clock } from "lucide-react";

export const Rules: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <HelpCircle color="var(--color-primary)" />
        {t("rules_title")}
      </h2>
      <p style={{ color: "var(--text-sub)", fontSize: "0.95rem" }}>{t("rules_intro")}</p>

      <div style={{ display: "grid", gap: "1rem" }}>
        
        {/* Rule 1 */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          padding: "1rem", 
          borderRadius: "var(--radius-md)", 
          background: "light-dark(rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02))",
          border: "1px solid var(--border-card)"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Award size={32} color="#22c55e" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#22c55e" }}>{t("rule_1_title")}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-sub)", marginTop: "0.25rem" }}>{t("rule_1_desc")}</p>
          </div>
        </div>

        {/* Rule 2 */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          padding: "1rem", 
          borderRadius: "var(--radius-md)", 
          background: "light-dark(rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.02))",
          border: "1px solid var(--border-card)"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Star size={32} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f59e0b" }}>{t("rule_2_title")}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-sub)", marginTop: "0.25rem" }}>{t("rule_2_desc")}</p>
          </div>
        </div>

        {/* Rule 3 */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          padding: "1rem", 
          borderRadius: "var(--radius-md)", 
          background: "light-dark(rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02))",
          border: "1px solid var(--border-card)"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <XCircle size={32} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ef4444" }}>{t("rule_3_title")}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-sub)", marginTop: "0.25rem" }}>{t("rule_3_desc")}</p>
          </div>
        </div>

        {/* Locking Rule */}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          padding: "1rem", 
          borderRadius: "var(--radius-md)", 
          background: "light-dark(rgba(0, 0, 0, 0.02), rgba(255, 255, 255, 0.02))",
          border: "1px solid var(--border-card)"
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Clock size={32} color="var(--text-light)" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>{t("rule_lock_title")}</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-sub)", marginTop: "0.25rem" }}>{t("rule_lock_desc")}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Rules;
