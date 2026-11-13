// Configuration lue dans l'environnement
const ENVS = ["development", "production", "test"];

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error(`PORT doit être un entier entre 1 et 65535 (reçu : "${process.env.PORT}").`);
}
if (!ENVS.includes(config.env)) {
  throw new Error(`NODE_ENV doit valoir ${ENVS.join(", ")} (reçu : "${config.env}").`);
}
