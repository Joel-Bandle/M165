from pymongo import MongoClient

# Verbindung zu MongoDB
client = MongoClient("mongodb://admin:MeinPasswort.99@54.174.220.226:27017/?authSource=admin")
db = client["filmeDB"]

# 1) Alle Filme ausgeben
print("=== Alle Filme ===")
for film in db.filme.find({}, {"_id": 0, "titel": 1, "bewertung": 1}):
    print(film)

# 2) Filme mit Bewertung > 8.0
print("\n=== Filme mit Bewertung > 8.0 ===")
for film in db.filme.find({"bewertung": {"$gt": 8.0}}, {"_id": 0, "titel": 1, "bewertung": 1}):
    print(film)

# 3) Neuen Film einfügen
db.filme.insert_one({
    "titel": "Python Testfilm",
    "erscheinungsjahr": 2024,
    "genre": "Drama",
    "bewertung": 7.5
})
print("\n=== Film eingefügt ===")

# 4) Film updaten
db.filme.update_one(
    {"titel": "Python Testfilm"},
    {"$set": {"bewertung": 8.0}}
)
print("=== Film updated ===")

# 5) Film löschen
db.filme.delete_one({"titel": "Python Testfilm"})
print("=== Film gelöscht ===")

client.close()
