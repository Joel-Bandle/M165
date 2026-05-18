# KN-M-01: Installation und Verwaltung von MongoDB

## Übersicht

| Teil | Thema | Gewichtung |
|------|-------|-----------|
| A | Installation auf AWS | 30% |
| B | Erste Schritte GUI (Compass) | 30% |
| C | Erste Schritte Shell (mongosh) | 10% |
| D | Rechte und Rollen | 30% |

---

## A) Installation

### Cloud-Init Datei

Die Datei [`A/cloud-init.yaml`](./A/cloud-init.yaml) ist die angepasste Cloud-Init-Konfiguration.

**Geändertes Passwort:** `Tbz.M165.Joel!` (statt dem Original `MyPassword.45`)

### AWS-Instanz Einrichtung

1. AWS EC2 → "Launch Instance"
2. Ubuntu 22.04 LTS, t2.micro, 20 GB Storage
3. Security Group: Port **22** (SSH) und Port **27017** (MongoDB) öffnen
4. Den Inhalt von `A/cloud-init.yaml` unter "Advanced Details → User data" einfügen
5. Elastic IP zuweisen (statische IP)

### Erklärung: Was machen die beiden `sed`-Befehle?

**Befehl 1** (in `runcmd`):
```bash
sudo sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mongod.conf
```
- **Was:** Ersetzt in `/etc/mongod.conf` den Wert `127.0.0.1` (nur localhost) durch `0.0.0.0` (alle Netzwerkinterfaces)
- **Warum nötig:** Standardmässig hört MongoDB nur auf localhost – das heisst, keine externe Verbindung ist möglich. Damit Compass von einem anderen Rechner aus eine Verbindung aufbauen kann, muss MongoDB auf allen Interfaces lauschen.
- **Auswirkung in mongod.conf:** `bindIp: 0.0.0.0`

**Befehl 2** (im Skript `mongodconfupdate.sh`):
```bash
sudo sed -i 's/#security:/security:\n  authorization: enabled/g' /etc/mongod.conf
```
- **Was:** Ersetzt die auskommentierte Zeile `#security:` durch zwei Zeilen: `security:` und `  authorization: enabled`
- **Warum nötig:** Ohne diese Änderung läuft MongoDB ohne Authentifizierung – jeder, der Port 27017 erreicht, hätte vollen Zugriff. Mit `authorization: enabled` muss man sich mit Benutzername und Passwort anmelden.
- **Auswirkung:** MongoDB verlangt nun gültige Anmeldedaten für jeden Zugriff.

### Screenshot: Inhalt der MongoDB Konfigurationsdatei

> **TODO:** SSH-Verbindung zum Server → folgenden Befehl ausführen und Screenshot machen:
> ```bash
> grep -A 2 'bindIp\|security\|authorization' /etc/mongod.conf
> ```
> Oder:
> ```bash
> cat /etc/mongod.conf
> ```

### Erklärung: Was macht `authSource=admin`?

Der Parameter `authSource=admin` im Connection String gibt an, **gegen welche Datenbank** die Anmeldedaten überprüft werden.

```
mongodb://admin:Tbz.M165.Joel!@<IP>:27017/?authSource=admin&readPreference=primary&ssl=false
```

- MongoDB speichert Benutzerdaten in der Datenbank, in der sie erstellt wurden
- Der Admin-Benutzer wurde mit `use admin; db.createUser(...)` in der `admin`-Datenbank erstellt
- Deshalb muss `authSource=admin` gesetzt sein – MongoDB sucht den Benutzer in der `admin`-Datenbank
- Würde man z. B. `authSource=test` angeben, würde MongoDB den Benutzer dort suchen, ihn nicht finden, und die Verbindung verweigern

**Quelle:** [MongoDB Connection String – authSource](https://www.mongodb.com/docs/manual/reference/connection-string/#mongodb-urioption-urioption.authSource)

### Screenshot: Compass Verbindung

> **TODO:** Compass öffnen, mit folgendem Connection String verbinden und Screenshot der Datenbankübersicht machen:
> ```
> mongodb://admin:Tbz.M165.Joel!@<IhreElasticIP>:27017/?authSource=admin&readPreference=primary&ssl=false
> ```

---

## B) Erste Schritte GUI (Compass)

### Datenbank und Collection

- **Datenbankname:** `Bandle` (Nachname)
- **Collection-Name:** `Joel` (Vorname)

### Dokument

Das Dokument [`B/document.json`](./B/document.json) wurde in die Collection `Joel` eingefügt.

```json
{
  "_id": { "$oid": "6650f1a2c3d4e5f6a7b8c9d0" },
  "vorname": "Joel",
  "nachname": "Bandle",
  "adresse": "Musterstrasse 12, 8000 Zürich",
  "groesse": 178,
  "geburtsdatum": { "$date": "2007-03-15T00:00:00.000Z" }
}
```

**Datentypen im Dokument:**

| Feld | Datentyp | Beispielwert |
|------|----------|-------------|
| `vorname` | String | `"Joel"` |
| `nachname` | String | `"Bandle"` |
| `adresse` | String | `"Musterstrasse 12, 8000 Zürich"` |
| `groesse` | Int32 / Double | `178` |
| `geburtsdatum` | Date | `2007-03-15` |

### Screenshot-Anleitung

> **TODO 1:** Bevor du das Dokument einfügst, Screenshot des "Add Data"-Dialogs machen.
> **TODO 2:** Nach dem Einfügen den Datentyp des Datums anpassen (Edit → Typ auf "Date" setzen) und Screenshot machen.

### Erklärung: Datum-Datentyp und Export

**Problem:** Wenn man einfach `"2007-03-15"` als Text eingibt, speichert MongoDB das als `String`, nicht als `Date`.

**Export-Datei:** Nach dem Export (Collection → Export → JSON) sieht ein korrekt gespeichertes Datum so aus:
```json
{ "geburtsdatum": { "$date": "2007-03-15T00:00:00.000Z" } }
```

**Was hätte man direkt tun müssen:**
Um direkt beim Einfügen ein echtes Datum zu definieren, hätte man die **Extended JSON**-Syntax verwenden müssen:
```json
{ "geburtsdatum": { "$date": "2007-03-15T00:00:00.000Z" } }
```
Diese Notation signalisiert MongoDB explizit, dass es sich um einen `Date`-Typ handelt – nicht um einen String.

**Warum ist das kompliziert?**
- JSON kennt von sich aus **keinen Datums-Datentyp** (nur String, Number, Boolean, Array, Object, null)
- MongoDB verwendet deshalb **BSON** (Binary JSON) intern, das mehr Typen unterstützt (Date, ObjectId, Int32, etc.)
- In normalem JSON gibt es keinen Standard für Datumsangaben – jedes System macht es anders (ISO 8601, Unix Timestamp, etc.)
- MongoDB löst das mit der Extended-JSON-Notation `{ "$date": "..." }`, die aber nicht-standard ist und von normalen JSON-Tools nicht verstanden wird
- Das gleiche Problem gilt für andere BSON-Typen wie `ObjectId` (`$oid`), `Int32` (`$numberInt`), `Decimal128` (`$numberDecimal`) etc.

---

## C) Erste Schritte Shell (mongosh)

### Befehle und Erklärungen

Folgende Befehle wurden in der MONGOSH-Shell in Compass **und** direkt auf dem Linux-Server eingegeben:

```javascript
show dbs;
show databases;
use Bandle;
show collections;
show tables;
var test = "hallo";
test;
```

**SSH-Verbindung zum Server:**
```bash
ssh -i <dein-key.pem> ubuntu@<IhreElasticIP>
```

**mongosh auf dem Server starten:**
```bash
sudo mongosh --authenticationDatabase "admin" -u "admin" -p "Tbz.M165.Joel!"
```

### Erklärungen der Befehle 1–5

| Befehl | Beschreibung |
|--------|-------------|
| `show dbs` | Zeigt alle Datenbanken an (Kurzform) |
| `show databases` | Zeigt alle Datenbanken an (Langform) – identisches Ergebnis wie `show dbs` |
| `use Bandle` | Wechselt in die Datenbank `Bandle`. Falls sie nicht existiert, wird sie beim ersten Schreiben erstellt. |
| `show collections` | Zeigt alle Collections in der aktuellen Datenbank an |
| `show tables` | Alias für `show collections` – historische Bezeichnung aus SQL, hat die gleiche Funktion |

**Unterschied Collections vs. Tables:**

| Merkmal | Collection (MongoDB / NoSQL) | Table (SQL / Relational) |
|---------|------------------------------|--------------------------|
| Schema | Flexibel – jedes Dokument kann andere Felder haben | Fest – alle Zeilen haben die gleichen Spalten |
| Datenformat | BSON-Dokumente (JSON-ähnlich) | Zeilen und Spalten |
| Beziehungen | Eingebettete Dokumente oder Referenzen | Fremdschlüssel, JOINs |
| Skalierung | Horizontal (sharding) | Vertikal (klassisch) |

**Befehle 6–7 (JavaScript):**
- `var test = "hallo"` → Deklariert eine JavaScript-Variable `test` mit dem Wert `"hallo"`
- `test` → Gibt den Wert der Variable aus: `hallo`
- Das zeigt, dass die mongosh-Shell vollständiges **JavaScript** ausführen kann, da MongoDB intern auf JavaScript basiert und JSON (JavaScript Object Notation) das Dokumentformat ist.

### Screenshots

> **TODO 1:** Screenshot der MONGOSH-Shell in Compass mit allen 7 Befehlen.
> **TODO 2:** Screenshot der SSH-Verbindung zum Server mit mongosh und denselben Befehlen.

---

## D) Rechte und Rollen

### Skript zum Erstellen der Benutzer

Siehe [`D/create-users.js`](./D/create-users.js)

Das Skript auf dem Server ausführen:
```bash
sudo mongosh --authenticationDatabase "admin" -u "admin" -p "Tbz.M165.Joel!" < /path/to/create-users.js
```

Oder direkt in der mongosh-Shell die Befehle nacheinander eingeben.

### Benutzer 1: Leser (read-only)

- **Benutzername:** `leser`
- **Passwort:** `Leser.M165!`
- **Rolle:** `read` auf Datenbank `Bandle`
- **authSource:** `Bandle`
- **Connection String:**
  ```
  mongodb://leser:Leser.M165!@<IhreIP>:27017/?authSource=Bandle&readPreference=primary&ssl=false
  ```

**Nachweis Rechte:**
- Lesen: `db.Joel.find()` → funktioniert ohne Fehler
- Schreiben: `db.Joel.insertOne({test: 1})` → Fehler: `not authorized on Bandle to execute command`

### Benutzer 2: Schreiber (read + write)

- **Benutzername:** `schreiber`
- **Passwort:** `Schreiber.M165!`
- **Rolle:** `readWrite` auf Datenbank `Bandle`
- **authSource:** `admin`
- **Connection String:**
  ```
  mongodb://schreiber:Schreiber.M165!@<IhreIP>:27017/?authSource=admin&readPreference=primary&ssl=false
  ```

**Nachweis Rechte:**
- Lesen: `db.Joel.find()` → funktioniert ohne Fehler
- Schreiben: `db.Joel.insertOne({test: "schreiber-test"})` → funktioniert ohne Fehler

### Teil D.1: Falsche authSource

> **TODO:** Connection String mit falscher `authSource` ausprobieren, z. B.:
> ```
> mongodb://admin:Tbz.M165.Joel!@<IP>:27017/?authSource=Bandle&readPreference=primary&ssl=false
> ```
> Screenshot des Fehlers machen (Compass zeigt: "Authentication failed").

**Erklärung:** Der `admin`-Benutzer wurde in der `admin`-Datenbank erstellt. Wenn man `authSource=Bandle` angibt, sucht MongoDB den Benutzer in der `Bandle`-Datenbank – er existiert dort nicht → Verbindung schlägt fehl.

### Warum keine `*Any*`-Rollen?

Die Aufgabe verlangt Rollen **ohne** `Any` im Namen (z.B. `readAnyDatabase`, `readWriteAnyDatabase`). Der Unterschied:
- `readAnyDatabase` / `readWriteAnyDatabase` → Zugriff auf **alle** Datenbanken des Servers
- `read` / `readWrite` → Zugriff nur auf die **eine** angegebene Datenbank

Für produktive Systeme gilt das **Prinzip der minimalen Rechte** (Principle of Least Privilege): Jeder Benutzer soll nur die Rechte haben, die er wirklich braucht.

### Screenshots

> **TODO:**
> - Screenshot: Fehlermeldung mit falscher authSource
> - Screenshot: Benutzer 1 – Login (Connection String sichtbar)
> - Screenshot: Benutzer 1 – `db.Joel.find()` ohne Fehler
> - Screenshot: Benutzer 1 – `db.Joel.insertOne({test:1})` mit Fehler
> - Screenshot: Benutzer 2 – Login (Connection String sichtbar)
> - Screenshot: Benutzer 2 – `db.Joel.find()` ohne Fehler
> - Screenshot: Benutzer 2 – `db.Joel.insertOne({test:"ok"})` ohne Fehler

---

## Dateien in diesem Verzeichnis

```
KN-M-01/
├── README.md           ← Diese Datei (alle Erklärungen)
├── A/
│   └── cloud-init.yaml ← Cloud-Init Konfiguration für AWS (Passwort geändert)
├── B/
│   └── document.json   ← Exportiertes MongoDB-Dokument mit korrektem Datumsformat
└── D/
    └── create-users.js ← Skript zum Erstellen der zwei Benutzer
```

---

*Screenshots müssen manuell ergänzt werden – sie sind als TODO markiert.*
