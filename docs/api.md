# Contrat de l'API Queen Bee — v0 (jour 1)

## Généralités

- URL de base : `http://localhost:3000`. Les routes métier sont sous `/api`.
- Les corps de requête et de réponse sont en JSON. Un corps envoyé doit porter l'en-tête `Content-Type: application/json`.
- Les données sont gardées en mémoire : elles sont perdues à chaque redémarrage.
- Pas encore d'authentification (prévue au jour 2, JWT).

### Périmètre

Le § 10.1 du cahier des charges prévoit les API Authentification, Ruches, Inspections, Récoltes, Alertes et Analytics. La v0 couvre :

- **Ruches** : liste, détail, historique des mesures, ajout d'une mesure ;
- **Inspections** : consultation et création.

Hors périmètre de la v0 : authentification, création / modification / suppression de ruches, synchronisation différée des inspections, photos d'inspection, récoltes, alertes, analytics, rejet des mesures en double (UC-CY02).

### Format des erreurs (RFC 9457)

Toutes les erreurs ont l'en-tête `Content-Type: application/problem+json` et ce corps :

```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Le paramètre limit doit être un entier compris entre 1 et 500."
}
```

- `title` dépend uniquement du code : 400 « Requête invalide », 404 « Ressource introuvable », 409 « Conflit », 500 « Erreur interne ».
- `detail` explique ce qui s'est passé pour cette requête.
- Aucune réponse ne contient de pile d'exécution.

Erreurs communes à toutes les routes :

| Code | Cause | `detail` |
|---|---|---|
| 400 | Corps JSON mal formé | `Le corps de la requête n'est pas un JSON valide.` |
| 404 | Route inconnue | `Aucune route ne correspond à GET /nope.` |
| 500 | Erreur imprévue du serveur | `Une erreur interne est survenue.` |

Pour toutes les routes `/api/hives/:id/…`, la ruche est cherchée en premier : si elle n'existe pas, la réponse est 404, avant toute vérification des paramètres ou du corps.

```json
{
  "type": "about:blank",
  "title": "Ressource introuvable",
  "status": 404,
  "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999."
}
```

---

## GET /health

État du serveur.

**200**

```json
{ "status": "ok" }
```

---

## GET /api/hives

Liste des ruches.

**Paramètres de requête**

- `site_id` : texte, facultatif. Ne garde que les ruches de ce site. Absent ou vide : toutes les ruches. Un site inconnu donne une liste vide.

**200** : un tableau de ruches.

```json
[
  { "id": "SN-CASA-001", "site_id": "SN-CASA", "status": "active" },
  { "id": "SN-CASA-002", "site_id": "SN-CASA", "status": "active" }
]
```

Pas d'erreur propre à cette route.

---

## GET /api/hives/:id

Détail d'une ruche.

**Paramètres de chemin**

- `id` : identifiant métier de la ruche, par exemple `SN-CASA-001`.

**200**

```json
{ "id": "SN-CASA-001", "site_id": "SN-CASA", "status": "active" }
```

**404** : aucune ruche ne porte cet identifiant.

---

## GET /api/hives/:id/measures

Historique des mesures d'une ruche, de la plus récente à la plus ancienne (tri sur `timestamp`).

**Paramètres de chemin**

- `id` : identifiant de la ruche.

**Paramètres de requête**

- `limit` : entier de 1 à 500, 50 par défaut. Nombre maximum de mesures renvoyées.
- `offset` : entier positif ou nul, 0 par défaut. Nombre de mesures sautées.

Un paramètre absent ou vide prend sa valeur par défaut.

**200**

```json
{
  "items": [
    {
      "hive_id": "SN-CASA-001",
      "site_id": "SN-CASA",
      "timestamp": "2026-10-31T23:45:00Z",
      "position_lat": 12.574304,
      "position_lon": -16.287302,
      "weight_kg": 36.84,
      "temp_internal_c": 34.4,
      "temp_external_c": 23.7,
      "humidity_pct": 64,
      "acoustic_activity_score": 0.03,
      "battery_pct": 80
    }
  ],
  "limit": 50,
  "offset": 0
}
```

**400** : `limit` n'est pas un entier de 1 à 500 (`0`, `501`, `abc`, `1.5`…), ou `offset` n'est pas un entier positif ou nul.

```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Le paramètre offset doit être un entier positif ou nul."
}
```

**404** : aucune ruche ne porte cet identifiant.

---

## POST /api/hives/:id/measures

Enregistre une mesure envoyée par la passerelle d'un site (format du § 6.5 du cahier des charges).

**Paramètres de chemin**

- `id` : identifiant de la ruche.

**Corps**

| Champ | Type | Obligatoire |
|---|---|---|
| `timestamp` | date et heure ISO 8601 avec fuseau, par exemple `2026-10-31T10:00:00Z` : l'instant de la mesure par le capteur, conservé tel quel | oui |
| `weight_kg` | nombre | oui |
| `hive_id` | texte : s'il est présent, il doit être égal à `:id` | non |
| `site_id` | texte, remplacé par le site de la ruche | non |
| `position_lat`, `position_lon`, `temp_internal_c`, `temp_external_c`, `humidity_pct`, `acoustic_activity_score`, `battery_pct` | nombres | non |

`hive_id` et `site_id` de la mesure enregistrée sont toujours ceux de la ruche du chemin.

**Plages physiques** (UC-CY02) : chaque champ numérique présent doit être un nombre compris dans sa plage, bornes incluses.

| Champ | Minimum | Maximum |
|---|---|---|
| `position_lat` | -90 | 90 |
| `position_lon` | -180 | 180 |
| `weight_kg` | 0 | 150 |
| `temp_internal_c` | -10 | 60 |
| `temp_external_c` | -20 | 60 |
| `humidity_pct` | 0 | 100 |
| `acoustic_activity_score` | 0 | 1 |
| `battery_pct` | 0 | 100 |

```json
{
  "hive_id": "SN-CASA-001",
  "timestamp": "2026-10-31T10:00:00Z",
  "weight_kg": 36.84,
  "temp_internal_c": 34.4,
  "battery_pct": 88
}
```

**201** : la mesure enregistrée.

```json
{
  "hive_id": "SN-CASA-001",
  "site_id": "SN-CASA",
  "timestamp": "2026-10-31T10:00:00Z",
  "weight_kg": 36.84,
  "temp_internal_c": 34.4,
  "battery_pct": 88
}
```

**400** : `timestamp` ou `weight_kg` manque, `timestamp` n'est pas une date ISO 8601, `hive_id` ne correspond pas à `:id`, ou un champ numérique n'est pas un nombre dans sa plage physique. Rien n'est enregistré.

```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Le champ weight_kg doit être un nombre compris entre 0 et 150."
}
```

**404** : aucune ruche ne porte cet identifiant.

---

## GET /api/hives/:id/inspections

Inspections d'une ruche, de la plus récente à la plus ancienne (tri sur `inspected_at`).

**Paramètres de chemin**

- `id` : identifiant de la ruche.

**200** : `items` est vide si la ruche n'a aucune inspection.

```json
{
  "items": [
    {
      "id": "7a9e4d2c-1b3f-4e5a-8c6d-0f2a4b6c8d02",
      "hive_id": "SN-CASA-001",
      "inspected_at": "2026-10-29T10:00:00Z",
      "queen_present": true,
      "colony_status": "normale",
      "observations": null
    }
  ]
}
```

**404** : aucune ruche ne porte cet identifiant.

---

## POST /api/hives/:id/inspections

Enregistre une inspection saisie sur le terrain (UC-A01). L'identifiant est un UUID choisi par l'application mobile, pour pouvoir créer l'inspection hors connexion.

**Paramètres de chemin**

- `id` : identifiant de la ruche.

**Corps**

| Champ | Type | Obligatoire |
|---|---|---|
| `id` | UUID | oui |
| `inspected_at` | date et heure ISO 8601 avec fuseau, par exemple `2026-10-31T10:00:00Z` | oui |
| `colony_status` | `forte`, `normale`, `faible` ou `morte` | oui |
| `queen_present` | booléen | non (`null` si absent) |
| `observations` | texte | non (`null` si absent) |

Les autres champs sont ignorés. `hive_id` est celui du chemin.

```json
{
  "id": "0b6c4a0e-6f1f-4d8e-9a2b-3c4d5e6f7a8b",
  "inspected_at": "2026-11-13T09:00:00Z",
  "colony_status": "forte",
  "queen_present": true,
  "observations": "Bonne activité."
}
```

**201** : l'inspection enregistrée.

```json
{
  "id": "0b6c4a0e-6f1f-4d8e-9a2b-3c4d5e6f7a8b",
  "hive_id": "SN-CASA-001",
  "inspected_at": "2026-11-13T09:00:00Z",
  "queen_present": true,
  "colony_status": "forte",
  "observations": "Bonne activité."
}
```

**400** : un champ obligatoire manque ou est invalide, ou un champ facultatif n'a pas le bon type.

```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Le champ colony_status est obligatoire et doit valoir : forte, normale, faible, morte."
}
```

**404** : aucune ruche ne porte cet identifiant.

**409** : une inspection porte déjà cet `id` (double saisie, ou renvoi après une coupure).

```json
{
  "type": "about:blank",
  "title": "Conflit",
  "status": 409,
  "detail": "Une inspection porte déjà l'identifiant 0b6c4a0e-6f1f-4d8e-9a2b-3c4d5e6f7a8b."
}
```
