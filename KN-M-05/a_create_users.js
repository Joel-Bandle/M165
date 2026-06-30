// KN-M-05 Teil A: Benutzer erstellen
// Thema: Filme & Serien
// Datenbank: filmeDB

// =============================================
// Benutzer 1: leser_filme
// - Darf nur lesen (read)
// - Authentifizierungsdatenbank: filmeDB
// - Keine anyDatabase-Rolle
// =============================================

use filmeDB
db.createUser({
  user: "leser_filme",
  pwd: "leser123",
  roles: [
    { role: "read", db: "filmeDB" }
  ]
})

// =============================================
// Benutzer 2: schreiber_filme
// - Darf lesen und schreiben (readWrite)
// - Authentifizierungsdatenbank: admin
// - Keine anyDatabase-Rolle
// =============================================

use admin
db.createUser({
  user: "schreiber_filme",
  pwd: "schreiber123",
  roles: [
    { role: "readWrite", db: "filmeDB" }
  ]
})
