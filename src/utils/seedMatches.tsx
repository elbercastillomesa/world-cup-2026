import { Timestamp } from "firebase/firestore";

export const seedData = [

  // ======================
  // GRUPO A
  // ======================
  {
    id: "seed_1",
    homeTeam: "México",
    awayTeam: "Sudáfrica",
    homeFlag: "🇲🇽",
    awayFlag: "🇿🇦",
    stage: "Grupo A",
    kickoff: Timestamp.fromDate(new Date("2026-06-11T13:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_2",
    homeTeam: "Corea del Sur",
    awayTeam: "República Checa",
    homeFlag: "🇰🇷",
    awayFlag: "🇨🇿",
    stage: "Grupo A",
    kickoff: Timestamp.fromDate(new Date("2026-06-11T20:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_3",
    homeTeam: "México",
    awayTeam: "Corea del Sur",
    homeFlag: "🇲🇽",
    awayFlag: "🇰🇷",
    stage: "Grupo A",
    kickoff: Timestamp.fromDate(new Date("2026-06-18T20:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_4",
    homeTeam: "República Checa",
    awayTeam: "Sudáfrica",
    homeFlag: "🇨🇿",
    awayFlag: "🇿🇦",
    stage: "Grupo A",
    kickoff: Timestamp.fromDate(new Date("2026-06-18T12:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_5",
    homeTeam: "Sudáfrica",
    awayTeam: "Corea del Sur",
    homeFlag: "🇿🇦",
    awayFlag: "🇰🇷",
    stage: "Grupo A",
    kickoff: Timestamp.fromDate(new Date("2026-06-24T20:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_6",
    homeTeam: "República Checa",
    awayTeam: "México",
    homeFlag: "🇨🇿",
    awayFlag: "🇲🇽",
    stage: "Grupo A",
    kickoff: Timestamp.fromDate(new Date("2026-06-24T20:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },

  // ======================
  // GRUPO B
  // ======================
  {
    id: "seed_7",
    homeTeam: "Canadá",
    awayTeam: "Bosnia y Herzegovina",
    homeFlag: "🇨🇦",
    awayFlag: "🇧🇦",
    stage: "Grupo B",
    kickoff: Timestamp.fromDate(new Date("2026-06-12T13:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_8",
    homeTeam: "Catar",
    awayTeam: "Suiza",
    homeFlag: "🇶🇦",
    awayFlag: "🇨🇭",
    stage: "Grupo B",
    kickoff: Timestamp.fromDate(new Date("2026-06-13T13:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_9",
    homeTeam: "Suiza",
    awayTeam: "Bosnia y Herzegovina",
    homeFlag: "🇨🇭",
    awayFlag: "🇧🇦",
    stage: "Grupo B",
    kickoff: Timestamp.fromDate(new Date("2026-06-18T15:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_10",
    homeTeam: "Canadá",
    awayTeam: "Catar",
    homeFlag: "🇨🇦",
    awayFlag: "🇶🇦",
    stage: "Grupo B",
    kickoff: Timestamp.fromDate(new Date("2026-06-18T19:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_11",
    homeTeam: "Bosnia y Herzegovina",
    awayTeam: "Catar",
    homeFlag: "🇧🇦",
    awayFlag: "🇶🇦",
    stage: "Grupo B",
    kickoff: Timestamp.fromDate(new Date("2026-06-24T19:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_12",
    homeTeam: "Suiza",
    awayTeam: "Canadá",
    homeFlag: "🇨🇭",
    awayFlag: "🇨🇦",
    stage: "Grupo B",
    kickoff: Timestamp.fromDate(new Date("2026-06-24T19:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },

  // ======================
  // GRUPO C
  // ======================
  {
    id: "seed_13",
    homeTeam: "Brasil",
    awayTeam: "Marruecos",
    homeFlag: "🇧🇷",
    awayFlag: "🇲🇦",
    stage: "Grupo C",
    kickoff: Timestamp.fromDate(new Date("2026-06-13T16:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_14",
    homeTeam: "Haití",
    awayTeam: "Escocia",
    homeFlag: "🇭🇹",
    awayFlag: "🏴",
    stage: "Grupo C",
    kickoff: Timestamp.fromDate(new Date("2026-06-13T19:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_15",
    homeTeam: "Brasil",
    awayTeam: "Haití",
    homeFlag: "🇧🇷",
    awayFlag: "🇭🇹",
    stage: "Grupo C",
    kickoff: Timestamp.fromDate(new Date("2026-06-20T19:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_16",
    homeTeam: "Marruecos",
    awayTeam: "Escocia",
    homeFlag: "🇲🇦",
    awayFlag: "🏴",
    stage: "Grupo C",
    kickoff: Timestamp.fromDate(new Date("2026-06-20T18:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_17",
    homeTeam: "Escocia",
    awayTeam: "Brasil",
    homeFlag: "🏴",
    awayFlag: "🇧🇷",
    stage: "Grupo C",
    kickoff: Timestamp.fromDate(new Date("2026-06-26T20:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  },
  {
    id: "seed_18",
    homeTeam: "Marruecos",
    awayTeam: "Haití",
    homeFlag: "🇲🇦",
    awayFlag: "🇭🇹",
    stage: "Grupo C",
    kickoff: Timestamp.fromDate(new Date("2026-06-26T20:00:00-05:00")),
    status: "scheduled",
    homeScore: null,
    awayScore: null
  }

];