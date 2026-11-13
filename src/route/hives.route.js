import { Router } from "express";
import { hives, measures, inspections } from "../data/hives.js";
import { sendProblem } from "../utils/problem.js";

const router = Router();

const COLONY_STATUSES = ["forte", "normale", "faible", "morte"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// Cherche la ruche, ou répond 404
function findHive(req, res) {
  const hive = hives.find((h) => h.id === req.params.id);
  if (!hive) sendProblem(res, 404, `Aucune ruche ne porte l'identifiant ${req.params.id}.`);
  return hive;
}

// Lit un entier de la query, ou null si invalide
function readInt(value, defaut, min, max) {
  if (value === undefined || value === "") return defaut;
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n >= min && n <= max ? n : null;
}

// Liste des ruches, filtrable par site
router.get("/", (req, res) => {
  const { site_id } = req.query;
  if (!site_id) return res.json(hives);
  res.json(hives.filter((h) => h.site_id === site_id));
});

// Une ruche
router.get("/:id", (req, res) => {
  const hive = findHive(req, res);
  if (hive) res.json(hive);
});

// Historique des mesures, la plus récente d'abord
router.get("/:id/measures", (req, res) => {
  const hive = findHive(req, res);
  if (!hive) return;

  const limit = readInt(req.query.limit, 50, 1, 500);
  if (limit === null) {
    return sendProblem(res, 400, "Le paramètre limit doit être un entier compris entre 1 et 500.");
  }
  const offset = readInt(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);
  if (offset === null) {
    return sendProblem(res, 400, "Le paramètre offset doit être un entier positif ou nul.");
  }

  const items = measures
    .filter((m) => m.hive_id === hive.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(offset, offset + limit);
  res.json({ items, limit, offset });
});

// Nouvelle mesure
router.post("/:id/measures", (req, res) => {
  const hive = findHive(req, res);
  if (!hive) return;

  const body = req.body ?? {};
  if (body.timestamp === undefined || body.weight_kg === undefined) {
    return sendProblem(res, 400, "Les champs timestamp et weight_kg sont obligatoires.");
  }
  if (body.hive_id !== undefined && body.hive_id !== hive.id) {
    return sendProblem(res, 400, `Le champ hive_id doit valoir ${hive.id}, comme dans le chemin.`);
  }

  const measure = { ...body, hive_id: hive.id, site_id: hive.site_id };
  measures.push(measure);
  res.status(201).json(measure);
});

// Inspections d'une ruche, la plus récente d'abord
router.get("/:id/inspections", (req, res) => {
  const hive = findHive(req, res);
  if (!hive) return;

  const items = inspections
    .filter((i) => i.hive_id === hive.id)
    .sort((a, b) => Date.parse(b.inspected_at) - Date.parse(a.inspected_at));
  res.json({ items });
});

// Vérifie le corps d'une inspection, renvoie le message d'erreur ou null
function checkInspection(body) {
  if (typeof body.id !== "string" || !UUID.test(body.id)) {
    return "Le champ id est obligatoire et doit être un UUID.";
  }
  if (
    typeof body.inspected_at !== "string" ||
    !ISO_DATE.test(body.inspected_at) ||
    Number.isNaN(Date.parse(body.inspected_at))
  ) {
    return "Le champ inspected_at est obligatoire et doit être une date ISO 8601 avec fuseau (ex. 2026-10-31T10:00:00Z).";
  }
  if (!COLONY_STATUSES.includes(body.colony_status)) {
    return `Le champ colony_status est obligatoire et doit valoir : ${COLONY_STATUSES.join(", ")}.`;
  }
  if (body.queen_present !== undefined && typeof body.queen_present !== "boolean") {
    return "Le champ queen_present doit être un booléen.";
  }
  if (body.observations !== undefined && typeof body.observations !== "string") {
    return "Le champ observations doit être un texte.";
  }
  return null;
}

// Nouvelle inspection
router.post("/:id/inspections", (req, res) => {
  const hive = findHive(req, res);
  if (!hive) return;

  const body = req.body ?? {};
  const erreur = checkInspection(body);
  if (erreur) return sendProblem(res, 400, erreur);

  if (inspections.some((i) => i.id === body.id)) {
    return sendProblem(res, 409, `Une inspection porte déjà l'identifiant ${body.id}.`);
  }

  const inspection = {
    id: body.id,
    hive_id: hive.id,
    inspected_at: body.inspected_at,
    queen_present: body.queen_present ?? null,
    colony_status: body.colony_status,
    observations: body.observations ?? null,
  };
  inspections.push(inspection);
  res.status(201).json(inspection);
});

export default router;
