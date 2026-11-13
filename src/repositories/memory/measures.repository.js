// Mesures en mémoire
export function createMemoryMeasuresRepository(measures = []) {
  return {
    // La plus récente d'abord
    async findByHive(hiveId, { limit, offset }) {
      return measures
        .filter((m) => m.hive_id === hiveId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(offset, offset + limit);
    },
    async add(measure) {
      measures.push(measure);
      return measure;
    },
  };
}
