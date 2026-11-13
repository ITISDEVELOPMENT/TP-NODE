import { ValidationError } from "../errors.js";

// Plages physiques (UC-CY02)
export const RANGES = {
  position_lat: [-90, 90],
  position_lon: [-180, 180],
  weight_kg: [0, 150],
  temp_internal_c: [-10, 60],
  temp_external_c: [-20, 60],
  humidity_pct: [0, 100],
  acoustic_activity_score: [0, 1],
  battery_pct: [0, 100],
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// Lit un entier venu de l'URL, sa valeur par défaut s'il est absent
function readInt(value, defaut, min, max, message) {
  if (value === undefined || value === "") return defaut;
  if (typeof value !== "string" || !/^\d+$/.test(value)) throw new ValidationError(message);
  const n = Number(value);
  if (n < min || n > max) throw new ValidationError(message);
  return n;
}

// Vérifie une mesure, lève ValidationError si elle est invalide
function checkMeasure(hive, body) {
  if (body.timestamp === undefined || body.weight_kg === undefined) {
    throw new ValidationError("Les champs timestamp et weight_kg sont obligatoires.");
  }
  if (typeof body.timestamp !== "string" || !ISO_DATE.test(body.timestamp) || Number.isNaN(Date.parse(body.timestamp))) {
    throw new ValidationError("Le champ timestamp doit être une date ISO 8601 avec fuseau (ex. 2026-10-31T10:00:00Z).");
  }
  if (body.hive_id !== undefined && body.hive_id !== hive.id) {
    throw new ValidationError(`Le champ hive_id doit valoir ${hive.id}, comme dans le chemin.`);
  }
  for (const [champ, [min, max]] of Object.entries(RANGES)) {
    const v = body[champ];
    if (v === undefined) continue;
    if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) {
      throw new ValidationError(`Le champ ${champ} doit être un nombre compris entre ${min} et ${max}.`);
    }
  }
}

export function createMeasuresService({ hivesService, measuresRepository }) {
  return {
    async listMeasures(hiveId, query = {}) {
      const hive = await hivesService.getHive(hiveId);
      const limit = readInt(query.limit, 50, 1, 500, "Le paramètre limit doit être un entier compris entre 1 et 500.");
      const offset = readInt(query.offset, 0, 0, Number.MAX_SAFE_INTEGER, "Le paramètre offset doit être un entier positif ou nul.");
      const items = await measuresRepository.findByHive(hive.id, { limit, offset });
      return { items, limit, offset };
    },

    async addMeasure(hiveId, body = {}) {
      const hive = await hivesService.getHive(hiveId);
      checkMeasure(hive, body);
      return measuresRepository.add({ ...body, hive_id: hive.id, site_id: hive.site_id });
    },
  };
}
