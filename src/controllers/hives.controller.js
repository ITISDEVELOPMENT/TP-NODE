// Lit la requête, appelle le service, répond
export function createHivesController({ hivesService, measuresService, inspectionsService }) {
  return {
    async listHives(req, res) {
      res.json(await hivesService.listHives({ siteId: req.query.site_id }));
    },
    async getHive(req, res) {
      res.json(await hivesService.getHive(req.params.id));
    },
    async listMeasures(req, res) {
      res.json(await measuresService.listMeasures(req.params.id, req.query));
    },
    async addMeasure(req, res) {
      res.status(201).json(await measuresService.addMeasure(req.params.id, req.body));
    },
    async listInspections(req, res) {
      res.json(await inspectionsService.listInspections(req.params.id));
    },
    async addInspection(req, res) {
      res.status(201).json(await inspectionsService.addInspection(req.params.id, req.body));
    },
  };
}
