// KN-M-04: Datenmanipulation und Abfragen II
// WICHTIG: Zuerst separat ausfuehren: use filmeDB;
// WICHTIG: Zuerst drop_collections.js und insert_data.js aus KN-M-03 ausfuehren.

// =============================================
// A) Aggregationen (50%)
// =============================================

// A1) KN-M-03 AND-Abfrage als Aggregation mit zwei $match-Stages
//     Genre "Sci-Fi" UND Bewertung > 8.0

print("=== A1: Zwei $match-Stages (Sci-Fi, Bewertung > 8.0) ===");
db.filme.aggregate([
  { $match: { genre: "Sci-Fi" } },
  { $match: { bewertung: { $gt: 8.0 } } },
  { $project: { _id: 1, titel: 1, genre: 1, bewertung: 1 } }
]).forEach(printjson);


// A2) $match + $project + $sort: Filme ab 2020, sortiert nach Bewertung absteigend

print("=== A2: Filme ab 2020, sortiert nach Bewertung (absteigend) ===");
db.filme.aggregate([
  { $match: { erscheinungsjahr: { $gte: 2020 } } },
  { $project: { _id: 0, titel: 1, bewertung: 1, erscheinungsjahr: 1 } },
  { $sort: { bewertung: -1 } }
]).forEach(printjson);


// A3) $group + $sum: Anzahl Filme pro Genre

print("=== A3: Anzahl Filme pro Genre ===");
db.filme.aggregate([
  { $group: { _id: "$genre", anzahl: { $sum: 1 } } },
  { $sort: { anzahl: -1 } }
]).forEach(printjson);


// A4) $group + $avg + $sum: Durchschnittliche Bewertung pro Genre

print("=== A4: Durchschnittliche Bewertung pro Genre ===");
db.filme.aggregate([
  {
    $group: {
      _id: "$genre",
      durchschnittsBewertung: { $avg: "$bewertung" },
      anzahlFilme: { $sum: 1 }
    }
  },
  { $sort: { durchschnittsBewertung: -1 } }
]).forEach(printjson);


// =============================================
// B) Join-Aggregation (30%)
// =============================================

// B1) $lookup: filme -> plattformen ueber plattform_ids

print("=== B1: Filme mit Plattform-Details ($lookup) ===");
db.filme.aggregate([
  {
    $lookup: {
      from: "plattformen",
      localField: "plattform_ids",
      foreignField: "_id",
      as: "plattformen_details"
    }
  },
  {
    $project: {
      _id: 0,
      titel: 1,
      genre: 1,
      "plattformen_details.name": 1,
      "plattformen_details.typ": 1
    }
  }
]).forEach(printjson);


// B2) $lookup: filme -> schauspieler ueber schauspieler_ids,
//     dann $match fuer Filme mit mindestens 1 Schauspieler, sortiert nach Bewertung

print("=== B2: Filme mit Schauspieler-Details, sortiert nach Bewertung ===");
db.filme.aggregate([
  {
    $lookup: {
      from: "schauspieler",
      localField: "schauspieler_ids",
      foreignField: "_id",
      as: "schauspieler_details"
    }
  },
  {
    $addFields: {
      schauspielerAnzahl: { $size: "$schauspieler_details" }
    }
  },
  { $match: { schauspielerAnzahl: { $gte: 1 } } },
  { $sort: { bewertung: -1 } },
  {
    $project: {
      _id: 0,
      titel: 1,
      bewertung: 1,
      schauspielerAnzahl: 1,
      "schauspieler_details.name": 1
    }
  }
]).forEach(printjson);


// =============================================
// C) Unter-Dokumente / Arrays (20%)
// =============================================

// C1) Projektion auf eingebettetes Unter-Dokument "regisseur"

print("=== C1: Regisseur-Details (Unter-Dokument Projektion) ===");
db.filme.find(
  {},
  {
    _id: 0,
    titel: 1,
    "regisseur.name": 1,
    "regisseur.nationalitaet": 1
  }
).forEach(printjson);


// C2) Filterung nach Unter-Dokument-Feld: regisseur.nationalitaet = "Grossbritannien"

print("=== C2: Filme von britischen Regisseuren ===");
db.filme.find(
  { "regisseur.nationalitaet": "Grossbritannien" },
  {
    _id: 0,
    titel: 1,
    "regisseur.name": 1,
    "regisseur.nationalitaet": 1
  }
).forEach(printjson);


// C3) $unwind auf plattform_ids + $lookup: Jedes Film-Plattform-Paar als eigene Zeile

print("=== C3: Film-Plattform-Paare ($unwind + $lookup) ===");
db.filme.aggregate([
  { $unwind: "$plattform_ids" },
  {
    $lookup: {
      from: "plattformen",
      localField: "plattform_ids",
      foreignField: "_id",
      as: "plattform"
    }
  },
  { $unwind: "$plattform" },
  {
    $project: {
      _id: 0,
      titel: 1,
      plattform_name: "$plattform.name",
      plattform_typ: "$plattform.typ"
    }
  }
]).forEach(printjson);
