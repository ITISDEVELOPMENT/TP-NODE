import { ValidationError, ConflictError } from "../errors.js";

const COLONY_STATUSES = ["forte", "normale", "faible", "morte"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

// Vérifie une inspection, lève ValidationError si elle est invalide
function checkInspection(body) {
  if (typeof body.id !== "string" || !UUID.test(body.id)) {
    throw new ValidationError("Le champ id est obligatoire et doit être un UUID.");
  }
  if (typeof body.inspected_at !== "string" || !ISO_DATE.test(body.inspected_at) || Number.isNaN(Date.parse(body.inspected_at))) {
    throw new ValidationError("Le champ inspected_at est obligatoire et doit être une date ISO 8601 avec fuseau (ex. 2026-10-31T10:00:00Z).");
  }
  if (!COLONY_STATUSES.includes(body.colony_status)) {
    throw new ValidationError(`Le champ colony_status est obligatoire et doit valoir : ${COLONY_STATUSES.join(", ")}.`);
  }
  if (body.queen_present !== undefined && typeof body.queen_present !== "boolean") {
    throw new ValidationError("Le champ queen_present doit être un booléen.");
  }
  if (body.observations !== undefined && typeof body.observations !== "string") {
    throw new ValidationError("Le champ observations doit être un texte.");
  }
}

export function createInspectionsService({ hivesService, inspectionsRepository }) {
  return {
    async listInspections(hiveId) {
      const hive = await hivesService.getHive(hiveId);
      const items = await inspectionsRepository.findByHive(hive.id);
      return { items };
    },

    async addInspection(hiveId, body = {}) {
      const hive = await hivesService.getHive(hiveId);
      checkInspection(body);
      if (await inspectionsRepository.findById(body.id)) {
        throw new ConflictError(`Une inspection porte déjà l'identifiant ${body.id}.`);
      }
      return inspectionsRepository.add({
        id: body.id,
        hive_id: hive.id,
        inspected_at: body.inspected_at,
        queen_present: body.queen_present ?? null,
        colony_status: body.colony_status,
        observations: body.observations ?? null,
      });
    },
  };
}
