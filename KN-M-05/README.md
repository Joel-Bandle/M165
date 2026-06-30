# KN-M-05: Administration von MongoDB

**Thema:** Filme & Serien  
**Datenbank:** `filmeDB`

---

## A) Rechte und Rollen (40%)

### Script: [`Dateien/a_create_users.js`](Dateien/a_create_users.js)

### 1) Falsches authSource — Fehler

Verbindungstext mit falscher Authentifizierungsdatenbank (`filmeDB` statt `admin`):

```
mongodb://admin:MeinPasswort.99@<IP>:27017/?authSource=filmeDB&readPreference=primary&ssl=false
```

Da der Admin-Benutzer in der `admin`-Datenbank gespeichert wurde, schlägt die Authentifizierung fehl — MongoDB sucht ihn in `filmeDB` und findet ihn dort nicht.


---

### 2) Zwei neue Benutzer

| Benutzer | Rolle | Authentifizierungsdatenbank | Berechtigung |
|---|---|---|---|
| `leser_filme` | `read` | `filmeDB` | Nur lesen |
| `schreiber_filme` | `readWrite` | `admin` | Lesen und schreiben |

Beide Rollen sind **built-in** und enthalten kein `Any` im Namen (keine `readAnyDatabase` o.ä.).

```javascript
// Benutzer 1: leser_filme (AuthSource: filmeDB)
use filmeDB
db.createUser({
  user: "leser_filme",
  pwd: "leser123",
  roles: [{ role: "read", db: "filmeDB" }]
})

// Benutzer 2: schreiber_filme (AuthSource: admin)
use admin
db.createUser({
  user: "schreiber_filme",
  pwd: "schreiber123",
  roles: [{ role: "readWrite", db: "filmeDB" }]
})
```

---

### Benutzer 1: leser_filme

**Verbindungstext:**
```
mongodb://leser_filme:leser123@<IP>:27017/?authSource=filmeDB
```


**Lesen — kein Fehler:**
```javascript
use filmeDB
db.filme.find().limit(2)
```

**Schreiben — Fehler:**
```javascript
db.filme.insertOne({ titel: "Test" })
```

---

### Benutzer 2: schreiber_filme

**Verbindungstext:**
```
mongodb://schreiber_filme:schreiber123@<IP>:27017/?authSource=admin
```


**Lesen — kein Fehler:**
```javascript
use filmeDB
db.filme.find().limit(2)
```

**Schreiben — kein Fehler:**
```javascript
db.filme.insertOne({ titel: "Testfilm von schreiber", erscheinungsjahr: 2024 })
```

---

## B) Backup und Restore (40%)

### Variante 1: AWS Snapshot

#### Schritt 1 — Snapshot erstellen

In der AWS Console: **EC2 → Volumes** → Volume der MongoDB-Instanz auswählen → **Actions → Create Snapshot**.


#### Schritt 2 — Collection löschen

In Compass oder mongosh eine Collection löschen:
```javascript
use filmeDB
db.schauspieler.drop()
```

#### Schritt 3 — Volume aus Snapshot wiederherstellen

In der AWS Console: **EC2 → Snapshots** → Snapshot auswählen → **Actions → Create Volume from Snapshot**.

Wichtig: Volume in **derselben Availability Zone** erstellen wie die EC2-Instanz (z.B. `us-east-1a`).

Dann: Instanz stoppen → altes Volume trennen → neues Volume anhängen → Instanz starten.

---

### Variante 2: mongodump / mongorestore

**Befehle:** [`Dateien/b_backup_restore.sh`](Dateien/b_backup_restore.sh)

#### Schritt 1 — Backup erstellen

```bash
mongodump \
  --host localhost --port 27017 \
  --username admin --password MeinPasswort.99 \
  --authenticationDatabase admin \
  --db filmeDB \
  --out /home/ubuntu/backup/
```

#### Schritt 2 — Datenbank löschen

```javascript
use filmeDB
db.dropDatabase()
```

#### Schritt 3 — Restore mit mongorestore

```bash
mongorestore \
  --host localhost --port 27017 \
  --username admin --password MeinPasswort.99 \
  --authenticationDatabase admin \
  --db filmeDB \
  /home/ubuntu/backup/filmeDB/
```

---

## C) Skalierung (20%)

### Replication vs. Sharding (Partitionierung)

#### Replication — Datenverfügbarkeit

Bei der **Replikation** werden dieselben Daten auf mehrere Server (Nodes) kopiert. Fällt ein Server aus, übernimmt ein anderer automatisch. Dies erhöht die **Verfügbarkeit** und **Ausfallsicherheit**, aber nicht die Kapazität — alle Nodes haben dieselben Daten.

```
         ┌─────────────┐
         │   PRIMARY   │  ← schreiben + lesen
         │  (Node 1)   │
         └──────┬──────┘
                │ repliziert
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  SECONDARY  │   │  SECONDARY  │  ← nur lesen (Backup)
│  (Node 2)   │   │  (Node 3)   │
└─────────────┘   └─────────────┘
```

**Anwendungsfall:** Eine Applikation braucht hohe Verfügbarkeit. Wenn der Primary-Server ausfällt, wird automatisch ein Secondary zum Primary gewählt (Failover).

#### Sharding (Partitionierung) — Horizontale Skalierung

Beim **Sharding** werden die Daten auf mehrere Server aufgeteilt — jeder Server (Shard) enthält nur einen Teil der Daten. Dies erhöht die **Kapazität und Schreibgeschwindigkeit**, weil die Last verteilt wird.

```
         ┌─────────────────┐
         │   MONGOS         │  ← Query Router
         │  (Einstiegspunkt)│
         └────────┬─────────┘
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ SHARD 1  │ │ SHARD 2  │ │ SHARD 3  │
│ Film A–F │ │ Film G–N │ │ Film O–Z │
└──────────┘ └──────────┘ └──────────┘
```

**Anwendungsfall:** Eine Streaming-Plattform mit Millionen von Filmdatensätzen — kein einzelner Server hat genug Speicher oder Rechenleistung, also werden die Daten nach einem Shard-Key (z.B. Titelanfangsbuchstabe) aufgeteilt.

#### Vergleich

| | Replication | Sharding |
|---|---|---|
| **Ziel** | Verfügbarkeit & Ausfallsicherheit | Kapazität & Performance |
| **Daten** | Gleiche Daten auf allen Nodes | Verschiedene Daten pro Shard |
| **Skalierung** | Vertikal (bessere Hardware) | Horizontal (mehr Server) |
| **Komplexität** | Niedrig | Hoch |
| **Einsatz** | Immer empfohlen | Erst bei sehr grossen Datenmengen |

---

### Empfehlung für unsere Firma

**Situation:** Unsere Firma betreibt eine Film- und Serien-Datenbank (`filmeDB`) mit Collections für Filme, Schauspieler und Plattformen. Aktuell läuft MongoDB auf einer einzelnen AWS EC2-Instanz (t2.micro). Die Datenbank enthält derzeit rund 5–10 Dokumente pro Collection und wird von einem kleinen Entwicklerteam genutzt.

**Empfehlung: Replication einführen, Sharding zurückstellen**

Für die aktuelle Grösse der Datenbank empfehle ich die Einführung eines **MongoDB Replica Sets** mit 3 Nodes (1 Primary + 2 Secondaries). Sharding ist aktuell nicht notwendig, da die Datenmenge klein ist und die Performance einer einzelnen Instanz ausreicht.

**Begründung:**
- Die grösste aktuelle Gefahr ist ein **Serverausfall** — ein Replica Set sichert automatisches Failover
- 3 Nodes sind das Minimum für ein funktionierendes Replica Set (Mehrheitsvotum)
- Sharding würde die Komplexität erheblich erhöhen ohne messbaren Vorteil bei dieser Datenmenge
- Wenn die Datenbank auf Millionen von Filmen wächst (z.B. durch Integration mit externen APIs), kann Sharding nachträglich eingeführt werden

**Umsetzung in AWS:** Drei EC2-Instanzen mit MongoDB, konfiguriert als Replica Set. Die Instanzen sollten in verschiedenen Availability Zones liegen für maximale Ausfallsicherheit.

---

### Quellen

- MongoDB Scaling Guide: https://www.mongodb.com/basics/scaling
- MongoDB Replication: https://www.mongodb.com/docs/manual/replication/
- MongoDB Sharding: https://www.mongodb.com/docs/manual/sharding/

---

## Abgabe-Dateien

| Datei | Teil | Beschreibung |
|---|---|---|
| [`Dateien/a_create_users.js`](Dateien/a_create_users.js) | A | Script zum Erstellen der zwei Benutzer |
| [`Dateien/b_backup_restore.sh`](Dateien/b_backup_restore.sh) | B | Befehle für mongodump und mongorestore |

