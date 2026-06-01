// KN-M-03 Teil B: Alle Collections loeschen (Aufraeum-Skript)
// WICHTIG: Zuerst separat ausfuehren: use filmeDB;

db.filme.drop();
db.schauspieler.drop();
db.plattformen.drop();

print("Alle Collections geloescht.");
db.getCollectionNames();
