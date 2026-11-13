# Queen Bee — API

## TP 1 — Lire les mesures sans bloquer

Mesures relevées avec `tp/tp1-lecture/sonde.js` (Node.js 25, second passage, serveur déjà « chaud »).

| Fichier  | Lecture   | Durée de l'import (ms) | Pire temps de /ping (ms) |
|----------|-----------|-----------------------:|-------------------------:|
| 1 jour   | bloquante | 13                     | 7                        |
| 1 jour   | en flux   | 15                     | 3                        |
| 30 jours | bloquante | 402                    | 396                      |
| 30 jours | en flux   | 307                    | 3                        |

Au tout premier import bloquant du fichier de 30 jours, à froid, l'import a pris 1 728 ms et /ping a attendu 1 722 ms.

**Pourquoi /ping attend-il pendant l'import bloquant ?**
Node.js exécute le JavaScript sur un seul fil : `readFileSync`, `split` et la boucle de `JSON.parse` occupent la boucle d'événements du début à la fin. Le /ping reçu entre-temps reste en file et n'est traité qu'à la fin de l'import, d'où un pire temps presque égal à la durée de l'import.

**La lecture en flux est-elle plus rapide ? Sinon, qu'apporte-t-elle ?**
Elle n'est pas fondamentalement plus rapide (durées du même ordre ; légèrement plus lente sur le petit fichier). Elle découpe le travail en morceaux : entre deux morceaux la boucle d'événements reprend la main et sert les autres requêtes (/ping reste à ~3 ms). Elle évite aussi de charger tout le fichier en mémoire.

**Pourquoi l'effet est-il presque invisible avec le fichier d'une journée ?**
Le fichier ne fait que 4 800 lignes : l'import bloquant dure une dizaine de millisecondes, à peu près l'intervalle entre deux /ping de la sonde. Le blocage existe, mais il est trop court pour se voir.
