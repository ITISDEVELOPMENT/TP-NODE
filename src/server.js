import { config } from "./config.js";
import { createApp } from "./app.js";
import { createMemoryHivesRepository } from "./repositories/memory/hives.repository.js";
import { createMemoryMeasuresRepository } from "./repositories/memory/measures.repository.js";
import { createMemoryInspectionsRepository } from "./repositories/memory/inspections.repository.js";
import { hives, measures, inspections } from "./repositories/memory/seed.js";

// Stockage en mémoire (PostgreSQL au jour 2)
const app = createApp({
  hivesRepository: createMemoryHivesRepository(hives),
  measuresRepository: createMemoryMeasuresRepository(measures),
  inspectionsRepository: createMemoryInspectionsRepository(inspections),
});

app.listen(config.port, () => {
  console.log(`Serveur démarré sur le port ${config.port} (${config.env})`);
});
