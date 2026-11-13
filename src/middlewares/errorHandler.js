import { sendProblem } from "../utils/problem.js";
import { ValidationError, NotFoundError, ConflictError } from "../errors.js";

// Route inconnue
export function notFoundHandler(req, res) {
  sendProblem(res, 404, `Aucune route ne correspond à ${req.method} ${req.originalUrl}.`);
}

// Toute erreur non traitée
export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return sendProblem(res, 400, "Le corps de la requête n'est pas un JSON valide.");
  }
  // Erreurs métier
  if (err instanceof ValidationError || err instanceof NotFoundError || err instanceof ConflictError) {
    return sendProblem(res, err.status, err.message);
  }
  console.error(err);
  sendProblem(res, 500, "Une erreur interne est survenue.");
}
