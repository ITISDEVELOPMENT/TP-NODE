import { Router } from "express";
import { hives, measures } from "../data/hives.js";

const router = Router();

// Liste des ruches, filtrable par site
router.get("/", (req, res) => {
  const { site_id } = req.query;
  if (!site_id) return res.json(hives);
  res.json(hives.filter((h) => h.site_id === site_id));
});

// Une ruche
router.get("/:id", (req, res) => {
  const hive = hives.find((h) => h.id === req.params.id);
  if (!hive) return res.status(404).json({ error: "Ruche introuvable" });
  res.json(hive);
});

// Nouvelle mesure
router.post("/:id/measures", (req, res) => {
  const hive = hives.find((hive) => hive.id === req.params.id);
  if (!hive) return res.status(404).json({ error: "Ruche introuvable" });

  const body = req.body ?? {};
  if (body.timestamp === undefined || body.weight_kg === undefined) {
    return res.status(400).json({ error: "timestamp et weight_kg sont obligatoires" });
  }
  if (body.hive_id !== undefined && body.hive_id !== hive.id) {
    return res.status(400).json({ error: "hive_id ne correspond pas à la ruche du chemin" });
  }

  const measure = { ...body, hive_id: hive.id, site_id: hive.site_id };
  measures.push(measure);
  res.status(201).json(measure);
});

export default router;
