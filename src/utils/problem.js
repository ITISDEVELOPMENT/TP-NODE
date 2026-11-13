// Titre code HTTP
const TITLES = {
  400: "Requête invalide",
  404: "Ressource introuvable",
  409: "Conflit",
  500: "Erreur interne",
};

// Répond une erreur au format RFC 9457
export function sendProblem(res, status, detail) {
  res
    .status(status)
    .type("application/problem+json")
    .json({ type: "about:blank", title: TITLES[status], status, detail });
}
