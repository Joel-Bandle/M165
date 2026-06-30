from cassandra.cluster import Cluster

# Verbindung zu Cassandra (Docker lokal)
cluster = Cluster(['cassandra'], port=9042)
session = cluster.connect('filme_db')

# 1) Alle Sci-Fi Filme ausgeben
print("=== Sci-Fi Filme ===")
rows = session.execute("SELECT titel, bewertung FROM filme_nach_genre WHERE genre = 'Sci-Fi'")
for row in rows:
    print(f"{row.titel} - {row.bewertung}")

# 2) Film nach Titel suchen
print("\n=== Oppenheimer ===")
rows = session.execute("SELECT * FROM filme_nach_titel WHERE titel = 'Oppenheimer'")
for row in rows:
    print(f"{row.titel} ({row.erscheinungsjahr}) - {row.bewertung}")

# 3) Neuen Film einfügen
session.execute("""
    INSERT INTO filme_nach_genre (genre, bewertung, titel, erscheinungsjahr, typ, regisseur_name)
    VALUES ('Drama', 7.5, 'Python Testfilm', 2024, 'Kino', 'Test Regisseur')
""")
print("\n=== Testfilm eingefügt ===")

# 4) Kontrolle
rows = session.execute("SELECT titel, bewertung FROM filme_nach_genre WHERE genre = 'Drama'")
for row in rows:
    print(f"{row.titel} - {row.bewertung}")

# 5) Testfilm löschen
session.execute("""
    DELETE FROM filme_nach_genre
    WHERE genre = 'Drama' AND bewertung = 7.5 AND titel = 'Python Testfilm'
""")
print("=== Testfilm gelöscht ===")

cluster.shutdown()
