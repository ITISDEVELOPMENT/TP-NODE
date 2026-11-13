// Ruches en mémoire
export function createMemoryHivesRepository(hives = []) {
  return {
    async findAll({ siteId } = {}) {
      return siteId ? hives.filter((h) => h.site_id === siteId) : hives;
    },
    async findById(id) {
      return hives.find((h) => h.id === id) ?? null;
    },
  };
}
