from neo4j import GraphDatabase

# Verbindung zu Neo4j AuraDB
URI = "neo4j+s://daba8fba.databases.neo4j.io"
AUTH = ("daba8fba", "_42H3WWWRXvSLa8tdu7wS2yQfo4bulmlALFROxwSBYM")

driver = GraphDatabase.driver(URI, auth=AUTH)

def run_query(query, parameters=None):
    with driver.session() as session:
        result = session.run(query, parameters or {})
        return [record.data() for record in result]

# 1) Alle Filme ausgeben
print("=== Alle Filme ===")
results = run_query("MATCH (f:Film) RETURN f.titel AS titel, f.bewertung AS bewertung")
for r in results:
    print(r)

# 2) Filme mit Bewertung > 8.0
print("\n=== Filme mit Bewertung > 8.0 ===")
results = run_query("""
    MATCH (f:Film)
    WHERE f.bewertung > 8.0
    RETURN f.titel AS titel, f.bewertung AS bewertung
    ORDER BY f.bewertung DESC
""")
for r in results:
    print(r)

# 3) Multi-Hop: Regisseur -> Film -> Plattform
print("\n=== Regisseur und Plattformen ===")
results = run_query("""
    MATCH (r:Regisseur)-[:INSZENIERT]->(f:Film)-[:VERFUEGBAR_AUF]->(p:Plattform)
    RETURN r.name AS regisseur, f.titel AS film, p.name AS plattform
""")
for r in results:
    print(r)

# 4) Neuen Knoten erstellen und löschen
run_query("CREATE (f:Film {titel: 'Python Testfilm', bewertung: 7.0})")
print("\n=== Testfilm erstellt ===")

run_query("MATCH (f:Film {titel: 'Python Testfilm'}) DETACH DELETE f")
print("=== Testfilm gelöscht ===")

driver.close()
