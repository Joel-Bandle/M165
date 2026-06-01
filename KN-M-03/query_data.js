// KN-M-03 Teil C: Daten abfragen
// WICHTIG: Zuerst separat ausfuehren: use filmeDB;
// WICHTIG: Zuerst drop_collections.js und dann insert_data.js ausfuehren.

// =============================================
// 1) Abfrage auf Collection "filme"
//    UND-Verknuepfung: Genre ist "Sci-Fi" UND Bewertung groesser als 8.0
//    Projektion: _id wird MIT ausgegeben
// =============================================

print("=== Filme: Sci-Fi mit Bewertung > 8.0 (mit _id) ===");
db.filme.find(
  {
    $and: [
      { genre: "Sci-Fi" },
      { bewertung: { $gt: 8.0 } }
    ]
  },
  {
    _id: 1,
    titel: 1,
    genre: 1,
    bewertung: 1
  }
).forEach(printjson);

// =============================================
// 2) Abfrage auf Collection "schauspieler"
//    ODER-Verknuepfung: Name ist "Tom Hanks" ODER "Zendaya"
//    Projektion: _id wird NICHT ausgegeben
// =============================================

print("=== Schauspieler: Tom Hanks oder Zendaya (ohne _id) ===");
db.schauspieler.find(
  {
    $or: [
      { name: "Tom Hanks" },
      { name: "Zendaya" }
    ]
  },
  {
    _id: 0,
    name: 1,
    nationalitaet: 1,
    geburtsdatum: 1
  }
).forEach(printjson);

// =============================================
// 3) Abfrage auf Collection "plattformen"
//    Regex: Alle Plattformen deren Name "Prime" enthaelt
//    Projektion: _id wird NICHT ausgegeben
// =============================================

print("=== Plattformen: Name enthaelt 'Prime' (Regex) ===");
db.plattformen.find(
  {
    name: { $regex: /Prime/i }
  },
  {
    _id: 0,
    name: 1,
    typ: 1,
    preis: 1
  }
).forEach(printjson);

// =============================================
// 4) Abfrage auf Collection "schauspieler"
//    DateTime-Filterung: Alle Schauspieler geboren nach 01.01.1980
// =============================================

print("=== Schauspieler: Geboren nach 01.01.1980 ===");
db.schauspieler.find(
  {
    geburtsdatum: { $gt: new Date("1980-01-01") }
  },
  {
    _id: 0,
    name: 1,
    geburtsdatum: 1
  }
).forEach(printjson);

// =============================================
// 5) Abfrage auf Collection "filme"
//    Regex: Alle Filme deren Titel "Forrest" oder "Dune" enthaelt
//    Projektion: _id wird MIT ausgegeben
// =============================================

print("=== Filme: Titel enthaelt 'Forrest' oder 'Dune' (Regex) ===");
db.filme.find(
  {
    titel: { $regex: /Forrest|Dune/i }
  },
  {
    _id: 1,
    titel: 1,
    bewertung: 1
  }
).forEach(printjson);
