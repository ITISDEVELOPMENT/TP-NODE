import { readFileSync } from "node:fs";

// Ruches en mémoire
export const hives = [
  { id: "SN-CASA-001", site_id: "SN-CASA", status: "active" },
  { id: "SN-CASA-002", site_id: "SN-CASA", status: "active" },
  { id: "SN-CASA-003", site_id: "SN-CASA", status: "active" },
  { id: "CI-MAN-001", site_id: "CI-MAN", status: "active" },
  { id: "CI-MAN-002", site_id: "CI-MAN", status: "active" },
];

// Mesures du 31/10 pour nos ruches
const fichier = new URL("../../data/mesures-SN-CASA-2026-10-31.ndjson", import.meta.url);
const ids = new Set(hives.map((h) => h.id));
export const measures = readFileSync(fichier, "utf8")
  .split("\n")
  .filter((ligne) => ligne.trim())
  .map((ligne) => JSON.parse(ligne))
  .filter((m) => ids.has(m.hive_id));

// Inspections
export const inspections = [
  {
    id: "3f1c2b7e-8a4d-4c6e-9b1a-2d5e7f8a9b01",
    hive_id: "SN-CASA-001",
    inspected_at: "2026-10-15T09:30:00Z",
    queen_present: true,
    colony_status: "forte",
    observations: "Couvain compact, bonnes réserves.",
  },
  {
    id: "7a9e4d2c-1b3f-4e5a-8c6d-0f2a4b6c8d02",
    hive_id: "SN-CASA-001",
    inspected_at: "2026-10-29T10:00:00Z",
    queen_present: true,
    colony_status: "normale",
    observations: null,
  },
  {
    id: "c2d4e6f8-0a1b-4c3d-9e5f-7a8b9c0d1e03",
    hive_id: "SN-CASA-002",
    inspected_at: "2026-10-22T08:45:00Z",
    queen_present: false,
    colony_status: "faible",
    observations: "Reine non vue, peu d'activité.",
  },
];
