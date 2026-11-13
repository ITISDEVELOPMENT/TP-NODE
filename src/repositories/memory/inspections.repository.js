// Inspections en mémoire
export function createMemoryInspectionsRepository(inspections = []) {
  return {
    // La plus récente d'abord
    async findByHive(hiveId) {
      return inspections
        .filter((i) => i.hive_id === hiveId)
        .sort((a, b) => Date.parse(b.inspected_at) - Date.parse(a.inspected_at));
    },
    async findById(id) {
      return inspections.find((i) => i.id === id) ?? null;
    },
    async add(inspection) {
      inspections.push(inspection);
      return inspection;
    },
  };
}
