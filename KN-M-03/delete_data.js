// KN-M-03 Teil B: Einzelne Datensaetze loeschen
// WICHTIG: Zuerst separat ausfuehren: use filmeDB;
// WICHTIG: Zuerst insert_data.js ausfuehren, damit Daten vorhanden sind.

// =============================================
// Vorher: IDs der zu loeschenden Datensaetze holen
// =============================================

var blackWidow = db.filme.findOne({ titel: "Black Widow" });
var inception = db.filme.findOne({ titel: "Inception" });
var dune = db.filme.findOne({ titel: "Dune: Part Two" });

// =============================================
// 1) deleteOne: Black Widow loeschen (mit _id)
// =============================================

print("=== deleteOne: Black Widow loeschen ===");
db.filme.deleteOne({ _id: blackWidow._id });
print("Geloescht. Verbleibende Filme:");
db.filme.find({}, { titel: 1 }).forEach(printjson);

// =============================================
// 2) deleteMany: Inception und Dune loeschen (ODER-Verknuepfung auf _id)
//    Loescht Inception und Dune, aber NICHT Oppenheimer und Forrest Gump
// =============================================

print("=== deleteMany: Inception und Dune loeschen ===");
db.filme.deleteMany({
  $or: [
    { _id: inception._id },
    { _id: dune._id }
  ]
});
print("Geloescht. Verbleibende Filme:");
db.filme.find({}, { titel: 1 }).forEach(printjson);
