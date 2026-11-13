// Une ligne de log par requête
export function requestLogger(req, res, next) {
  const debut = performance.now();
  res.on("finish", () => {
    const duree = (performance.now() - debut).toFixed(1);
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duree} ms`);
  });
  next();
}
