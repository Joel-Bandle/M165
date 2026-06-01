// KN-M-03 Teil D: Daten veraendern
// WICHTIG: Zuerst separat ausfuehren: use filmeDB;
// WICHTIG: Zuerst drop_collections.js und dann insert_data.js ausfuehren.

// =============================================
// 1) updateOne auf Collection "filme"
//    Bewertung von Forrest Gump auf 9.0 aendern (mit _id)
// =============================================

var forrestGump = db.filme.findOne({ titel: "Forrest Gump" });

print("=== updateOne: Forrest Gump Bewertung aendern ===");
print("Vorher:");
printjson(db.filme.findOne({ _id: forrestGump._id }, { titel: 1, bewertung: 1 }));

db.filme.updateOne(
  { _id: forrestGump._id },
  { $set: { bewertung: 9.0, preis: 9.90 } }
);

print("Nachher:");
printjson(db.filme.findOne({ _id: forrestGump._id }, { titel: 1, bewertung: 1 }));

// =============================================
// 2) updateMany auf Collection "schauspieler"
//    Alle Schauspieler mit Nationalitaet "USA" ODER "Irland"
//    bekommen ein neues Feld "verifiziert: true"
//    (ODER-Verknuepfung, ohne _id, aendert mehr als 1 Datensatz)
// =============================================

print("=== updateMany: US- und irische Schauspieler auf verifiziert setzen ===");

db.schauspieler.updateMany(
  {
    $or: [
      { nationalitaet: "USA" },
      { nationalitaet: "Irland" }
    ]
  },
  { $set: { verifiziert: true } }
);

print("Ergebnis:");
db.schauspieler.find(
  { verifiziert: true },
  { _id: 0, name: 1, nationalitaet: 1, verifiziert: 1 }
).forEach(printjson);

// =============================================
// 3) replaceOne auf Collection "plattformen"
//    Disney+ komplett ersetzen (neues Angebot)
// =============================================

var disneyPlus = db.plattformen.findOne({ name: "Disney+" });

print("=== replaceOne: Disney+ durch Disney+ Premium ersetzen ===");
print("Vorher:");
printjson(db.plattformen.findOne({ _id: disneyPlus._id }));

db.plattformen.replaceOne(
  { _id: disneyPlus._id },
  {
    _id: disneyPlus._id,
    name: "Disney+ Premium",
    typ: "Streaming",
    preis: 13.90,
    film_ids: disneyPlus.film_ids
  }
);

print("Nachher:");
printjson(db.plattformen.findOne({ _id: disneyPlus._id }));
