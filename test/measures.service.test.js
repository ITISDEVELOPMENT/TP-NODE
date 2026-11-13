import { test } from "node:test";
import assert from "node:assert/strict";
import { createMeasuresService } from "../src/services/measures.service.js";
import { ValidationError } from "../src/errors.js";

// Faux repository : garde ce qu'on lui donne
function createFakeMeasuresRepository() {
  const added = [];
  return {
    added,
    async add(measure) {
      added.push(measure);
      return measure;
    },
    async findByHive() {
      return [];
    },
  };
}

const fakeHivesService = {
  async getHive(id) {
    return { id, site_id: "SN-CASA", status: "active" };
  },
};

const validMeasure = { timestamp: "2026-10-31T10:00:00Z", weight_kg: 36.84 };

test("refuse un poids hors de sa plage physique", async () => {
  // Préparer
  const measuresRepository = createFakeMeasuresRepository();
  const service = createMeasuresService({ hivesService: fakeHivesService, measuresRepository });

  // Agir et vérifier
  await assert.rejects(service.addMeasure("SN-CASA-001", { ...validMeasure, weight_kg: 500 }), ValidationError);
  assert.equal(measuresRepository.added.length, 0);
});

test("enregistre une mesure valide", async () => {
  // Préparer
  const measuresRepository = createFakeMeasuresRepository();
  const service = createMeasuresService({ hivesService: fakeHivesService, measuresRepository });

  // Agir
  const measure = await service.addMeasure("SN-CASA-001", validMeasure);

  // Vérifier
  assert.equal(measuresRepository.added.length, 1);
  assert.equal(measure.hive_id, "SN-CASA-001");
  assert.equal(measure.site_id, "SN-CASA");
});
