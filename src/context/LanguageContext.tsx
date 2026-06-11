import React, { createContext, useState, useContext } from "react";

type Language = "es" | "en";

interface TranslationDictionary {
  [key: string]: {
    es: string;
    en: string;
  };
}

const translations: TranslationDictionary = {
  // Authentication & General UI
  login_title: { es: "Polla Mundialista 2026", en: "2026 World Cup Sweepstakes" },
  login_sub: { es: "Predice los partidos y compite con tus amigos", en: "Predict matches and compete with your friends" },
  sign_in_google: { es: "Iniciar sesión con Google", en: "Sign in with Google" },
  email: { es: "Correo Electrónico", en: "Email Address" },
  password: { es: "Contraseña", en: "Password" },
  display_name: { es: "Nombre de usuario / Apodo", en: "Username / Nickname" },
  login_btn: { es: "Iniciar Sesión", en: "Log In" },
  signup_btn: { es: "Registrarse", en: "Sign Up" },
  or_separator: { es: "O", en: "Or" },
  no_account: { es: "¿No tienes cuenta? Regístrate", en: "Don't have an account? Sign up" },
  have_account: { es: "¿Ya tienes cuenta? Inicia sesión", en: "Already have an account? Log in" },
  logout: { es: "Cerrar Sesión", en: "Log Out" },
  welcome: { es: "¡Hola!", en: "Welcome!" },
  
  // Navigation Tabs
  tab_matches: { es: "Partidos", en: "Matches" },
  tab_leaderboard: { es: "Posiciones", en: "Leaderboard" },
  tab_rules: { es: "Reglas", en: "Rules" },
  tab_admin: { es: "Administración", en: "Admin" },

  // Match List & Predictions
  kickoff_time: { es: "Hora de inicio (GMT-5)", en: "Kickoff Time (GMT-5)" },
  match_locked: { es: "🔒 Pronóstico cerrado", en: "🔒 Predictions locked" },
  match_open: { es: "✏️ Pronóstico abierto", en: "✏️ Predictions open" },
  match_saved: { es: "¡Pronóstico guardado!", en: "Prediction saved!" },
  predict_prompt: { es: "Ingresa tu predicción", en: "Enter your prediction" },
  save_prediction: { es: "Guardar", en: "Save" },
  predictions_title: { es: "Polla de los amigos (Resultados)", en: "Friends' predictions (Results)" },
  no_predictions: { es: "Nadie ha pronosticado este partido aún", en: "No one has predicted this match yet" },
  no_matches: { es: "No hay partidos registrados. Pide al administrador sembrar los partidos.", en: "No matches registered. Ask the admin to seed the matches." },
  stage: { es: "Fase", en: "Stage" },
  status_scheduled: { es: "Programado", en: "Scheduled" },
  status_live: { es: "En vivo", en: "Live" },
  status_finished: { es: "Finalizado", en: "Finished" },
  points_short: { es: "pts", en: "pts" },
  exact_match: { es: "🎯 Marcador Exacto (+3 pts)", en: "🎯 Exact Score (+3 pts)" },
  outcome_match: { es: "⚽ Resultado (+1 pt)", en: "⚽ Outcome (+1 pt)" },
  no_points: { es: "❌ Sin puntos (0 pts)", en: "❌ No points (0 pts)" },
  your_prediction: { es: "Tu pronóstico", en: "Your prediction" },
  time_remaining: { es: "Tiempo restante", en: "Time remaining" },

  // Leaderboard
  rank: { es: "Puesto", en: "Rank" },
  user: { es: "Participante", en: "Participant" },
  points: { es: "Puntos", en: "Points" },
  exact_count: { es: "Marcadores Exactos (3 pts)", en: "Exact Scores (3 pts)" },
  outcome_count: { es: "Ganador/Empate (1 pt)", en: "Winner/Draw (1 pt)" },
  no_users: { es: "Aún no hay usuarios en la tabla", en: "No users in the leaderboard yet" },
  view_top_scores: { es: "Ver mejores puntajes", en: "View top scores" },
  back_to_login: { es: "Volver al inicio de sesión", en: "Back to login" },
  top_scores_title: { es: "Mejores puntajes", en: "Top Scorers" },
  top_scores_subtitle: { es: "Mira quién está liderando con la mejor puntuación", en: "See who is leading with the highest points" },
  top_scores_no_users: { es: "No hay puntajes para mostrar todavía.", en: "No scores to display yet." },

  // Rules view
  rules_title: { es: "Reglamento del Juego", en: "Game Rules" },
  rules_intro: { es: "¡Bienvenido a la Polla Mundialista 2026! Pronostica los marcadores de los partidos y compite por la copa. El sistema de puntaje es el siguiente:", en: "Welcome to the 2026 World Cup Polla! Predict the scores and compete for the cup. The scoring system is as follows:" },
  rule_1_title: { es: "🎯 3 Puntos: Marcador Exacto", en: "🎯 3 Points: Exact Score" },
  rule_1_desc: { es: "Le atinas al marcador exacto del encuentro. Ejemplo: Pronosticas 2-1 y el marcador final es 2-1.", en: "You guess the exact final score. Example: You predict 2-1 and the final score is 2-1." },
  rule_2_title: { es: "⚽ 1 Punto: Resultado/Tendencia", en: "⚽ 1 Point: Outcome/Trend" },
  rule_2_desc: { es: "Aciertas qué equipo gana o si hay empate, pero no el marcador. Ejemplo: Pronosticas 3-1, el marcador final es 1-0.", en: "You guess the correct winner or draw, but not the exact score. Example: You predict 3-1 and the final score is 1-0." },
  rule_3_title: { es: "❌ 0 Puntos: Incorrecto", en: "❌ 0 Points: Incorrect" },
  rule_3_desc: { es: "No aciertas ni el ganador/empate ni los goles. Ejemplo: Pronosticas 1-1, el marcador final es 2-0.", en: "You don't guess the winner/draw or the score. Example: You predict 1-1 and the final score is 2-0." },
  rule_lock_title: { es: "🔒 Cierre Automático", en: "🔒 Automatic Lock" },
  rule_lock_desc: { es: "Los partidos se cierran automáticamente exactamente a la hora del pitazo inicial (GMT-5). No se permiten cambios después.", en: "Matches lock automatically at kickoff time (GMT-5). No changes allowed after." },

  // Admin View
  admin_title: { es: "Panel de Administración", en: "Admin Dashboard" },
  seed_matches_btn: { es: "Sembrar Partidos del Mundial 2026 (GMT-5)", en: "Seed 2026 World Cup Matches (GMT-5)" },
  add_match_title: { es: "Agregar Partido", en: "Add Match" },
  edit_match_title: { es: "Editar Partido", en: "Edit Match" },
  home_team: { es: "Equipo Local", en: "Home Team" },
  away_team: { es: "Equipo Visitante", en: "Away Team" },
  home_flag: { es: "Bandera Local (Emoji)", en: "Home Flag (Emoji)" },
  away_flag: { es: "Bandera Visitante (Emoji)", en: "Away Flag (Emoji)" },
  kickoff_label: { es: "Fecha y Hora de Kickoff (GMT-5)", en: "Kickoff Date & Time (GMT-5)" },
  submit_match: { es: "Guardar Partido", en: "Save Match" },
  set_result_title: { es: "Registrar Marcador Final", en: "Enter Final Score" },
  recalculate_btn: { es: "Finalizar y Calcular Puntos", en: "Finish and Calculate Points" },
  actions: { es: "Acciones", en: "Actions" },
  delete_match: { es: "Eliminar", en: "Delete" }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("polla_locale");
    return (saved === "es" || saved === "en" ? saved : "es") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("polla_locale", lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
