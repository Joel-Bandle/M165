// Verbindung zu MongoDB herstellen (als admin):
// mongosh "mongodb://admin:Tbz.M165.Joel!@<IhreIP>:27017/?authSource=admin"

// ─── Benutzer 1: Nur-Lesen, authSource = Bandle ───────────────────────────────
// Dieser Benutzer kann sich nur gegenüber der Datenbank "Bandle" authentifizieren
// und darf dort ausschliesslich Daten lesen (keine Schreibrechte).

use Bandle;
db.createUser({
  user: "leser",
  pwd: "Leser.M165!",
  roles: [
    { role: "read", db: "Bandle" }
  ]
});

// Verbindungstext für Benutzer 1:
// mongodb://leser:Leser.M165!@<IhreIP>:27017/?authSource=Bandle&readPreference=primary&ssl=false


// ─── Benutzer 2: Lesen + Schreiben, authSource = admin ────────────────────────
// Dieser Benutzer authentifiziert sich gegen die "admin"-Datenbank und hat
// Lese- und Schreibrechte auf der Datenbank "Bandle".

use admin;
db.createUser({
  user: "schreiber",
  pwd: "Schreiber.M165!",
  roles: [
    { role: "readWrite", db: "Bandle" }
  ]
});

// Verbindungstext für Benutzer 2:
// mongodb://schreiber:Schreiber.M165!@<IhreIP>:27017/?authSource=admin&readPreference=primary&ssl=false
