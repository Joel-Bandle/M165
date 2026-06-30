import redis
import json

# Verbindung zu Redis (Docker lokal)
r = redis.Redis(host='localhost', port=6379, decode_responses=True)

print("=== Redis Key-Value Demo ===\n")

# =============================================
# 1) Einfache Key-Value Paare (In-Memory Store)
# =============================================
print("--- 1) Key-Value Paare ---")

r.set("film:1:titel", "Oppenheimer")
r.set("film:1:bewertung", "8.9")
r.set("film:1:genre", "Historisches Drama")

print(f"Titel:    {r.get('film:1:titel')}")
print(f"Bewertung: {r.get('film:1:bewertung')}")
print(f"Genre:    {r.get('film:1:genre')}")

# =============================================
# 2) TTL — automatisches Ablaufen (Caching)
# =============================================
print("\n--- 2) Caching mit TTL ---")

r.setex("cache:top_film", 10, "Oppenheimer")  # läuft nach 10 Sekunden ab
print(f"Gecachter Film: {r.get('cache:top_film')}")
print(f"Verbleibende Zeit: {r.ttl('cache:top_film')} Sekunden")

# =============================================
# 3) Hash — Film als Objekt speichern
# =============================================
print("\n--- 3) Film als Hash ===")

r.hset("film:2", mapping={
    "titel": "Parasite",
    "bewertung": "8.5",
    "genre": "Thriller",
    "regisseur": "Bong Joon-ho"
})

film = r.hgetall("film:2")
print(f"Film: {film}")

# =============================================
# 4) Liste — Filmtitel als Queue
# =============================================
print("\n--- 4) Liste (Watchlist) ---")

r.rpush("watchlist", "Oppenheimer", "Dune: Part Two", "Parasite")
print(f"Watchlist: {r.lrange('watchlist', 0, -1)}")
print(f"Nächster Film: {r.lpop('watchlist')}")
print(f"Watchlist danach: {r.lrange('watchlist', 0, -1)}")

# =============================================
# 5) Aufräumen
# =============================================
r.delete("film:1:titel", "film:1:bewertung", "film:1:genre")
r.delete("film:2")
r.delete("watchlist")
print("\n=== Demo abgeschlossen ===")
