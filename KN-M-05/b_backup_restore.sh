# KN-M-05 Teil B Variante 2: Backup und Restore mit mongodump / mongorestore
# Thema: Filme & Serien
# Datenbank: filmeDB
# Ausfuehren direkt auf dem Linux-Server (SSH-Verbindung)

# =============================================
# SCHRITT 1: Backup erstellen mit mongodump
# =============================================

mongodump \
  --host localhost \
  --port 27017 \
  --username admin \
  --password MeinPasswort.99 \
  --authenticationDatabase admin \
  --db filmeDB \
  --out /home/ubuntu/backup/

# Erklaerung:
# --host / --port   : Verbindung zum lokalen MongoDB-Server
# --username / --password : Admin-Zugangsdaten
# --authenticationDatabase : Wo der Admin-User gespeichert ist
# --db filmeDB      : Nur die filmeDB sichern
# --out             : Zielordner fuer das Backup

# Kontrolle: Backup-Dateien anzeigen
ls -la /home/ubuntu/backup/filmeDB/

# =============================================
# SCHRITT 2: Collection / Datenbank loeschen
# =============================================

# In mongosh einloggen:
mongosh "mongodb://admin:MeinPasswort.99@localhost:27017/?authSource=admin"

# Dann in mongosh:
# use filmeDB
# db.filme.drop()        -- einzelne Collection loeschen
# db.dropDatabase()      -- ganze Datenbank loeschen (fuer den Test)

# Kontrolle: Datenbank ist weg
# show dbs

# =============================================
# SCHRITT 3: Restore mit mongorestore
# =============================================

mongorestore \
  --host localhost \
  --port 27017 \
  --username admin \
  --password MeinPasswort.99 \
  --authenticationDatabase admin \
  --db filmeDB \
  /home/ubuntu/backup/filmeDB/

# Erklaerung:
# --db filmeDB      : Ziel-Datenbank fuer den Restore
# letztes Argument  : Pfad zum Backup-Ordner der spezifischen DB

# Kontrolle: Daten sind wieder da
# mongosh -> use filmeDB -> show collections -> db.filme.find().limit(1)
