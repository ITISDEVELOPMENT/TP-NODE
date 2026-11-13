import { NotFoundError } from "../errors.js";

export function createHivesService({ hivesRepository }) {
  return {
    async listHives({ siteId } = {}) {
      return hivesRepository.findAll({ siteId: siteId || undefined });
    },
    // Renvoie la ruche, ou lève NotFoundError
    async getHive(id) {
      const hive = await hivesRepository.findById(id);
      if (!hive) throw new NotFoundError(`Aucune ruche ne porte l'identifiant ${id}.`);
      return hive;
    },
  };
}
