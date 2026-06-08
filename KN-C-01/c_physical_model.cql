-- KN-C-01 Teil C: Physisches Modell fuer Cassandra
-- Thema: Filme & Serien
-- Keyspace: filme_db

-- =============================================
-- Keyspace erstellen
-- =============================================

CREATE KEYSPACE IF NOT EXISTS filme_db
  WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
  };

USE filme_db;

-- =============================================
-- Tabelle 1: filme_nach_titel
-- Screen: Filmdetail-Seite
-- Query: Zeige alle Details eines Films anhand des Titels
-- Partition Key: titel
-- Clustering Key: erscheinungsjahr (DESC, neuere zuerst)
-- =============================================

CREATE TABLE IF NOT EXISTS filme_nach_titel (
  titel              TEXT,
  erscheinungsjahr   INT,
  genre              TEXT,
  typ                TEXT,
  bewertung          FLOAT,
  regisseur_name     TEXT,
  regisseur_nat      TEXT,
  PRIMARY KEY (titel, erscheinungsjahr)
) WITH CLUSTERING ORDER BY (erscheinungsjahr DESC);

-- =============================================
-- Tabelle 2: filme_nach_genre
-- Screen: Genre-Browsing (z.B. alle Sci-Fi Filme anzeigen)
-- Query: Zeige alle Filme eines bestimmten Genres
-- Partition Key: genre
-- Clustering Key: bewertung (DESC, beste zuerst), titel (ASC)
-- =============================================

CREATE TABLE IF NOT EXISTS filme_nach_genre (
  genre              TEXT,
  bewertung          FLOAT,
  titel              TEXT,
  erscheinungsjahr   INT,
  typ                TEXT,
  regisseur_name     TEXT,
  PRIMARY KEY (genre, bewertung, titel)
) WITH CLUSTERING ORDER BY (bewertung DESC, titel ASC);

-- =============================================
-- Tabelle 3: filme_nach_schauspieler
-- Screen: Schauspieler-Profilseite (alle Filme eines Schauspielers)
-- Query: Zeige alle Filme in denen ein bestimmter Schauspieler mitgespielt hat
-- Partition Key: schauspieler_name
-- Clustering Key: erscheinungsjahr (DESC), titel (ASC)
-- =============================================

CREATE TABLE IF NOT EXISTS filme_nach_schauspieler (
  schauspieler_name  TEXT,
  erscheinungsjahr   INT,
  titel              TEXT,
  genre              TEXT,
  bewertung          FLOAT,
  rolle              TEXT,
  PRIMARY KEY (schauspieler_name, erscheinungsjahr, titel)
) WITH CLUSTERING ORDER BY (erscheinungsjahr DESC, titel ASC);

-- =============================================
-- Tabelle 4: filme_nach_plattform
-- Screen: Plattform-Uebersichtsseite (alle Filme auf einer Plattform)
-- Query: Zeige alle Filme die auf einer bestimmten Plattform verfuegbar sind
-- Partition Key: plattform_name
-- Clustering Key: genre (ASC), titel (ASC)
-- =============================================

CREATE TABLE IF NOT EXISTS filme_nach_plattform (
  plattform_name     TEXT,
  genre              TEXT,
  titel              TEXT,
  erscheinungsjahr   INT,
  bewertung          FLOAT,
  plattform_typ      TEXT,
  plattform_preis    FLOAT,
  PRIMARY KEY (plattform_name, genre, titel)
) WITH CLUSTERING ORDER BY (genre ASC, titel ASC);

-- =============================================
-- Testdaten einfuegen
-- =============================================

-- Tabelle 1: filme_nach_titel
INSERT INTO filme_nach_titel (titel, erscheinungsjahr, genre, typ, bewertung, regisseur_name, regisseur_nat)
VALUES ('Oppenheimer', 2023, 'Historisches Drama', 'Kino', 8.9, 'Christopher Nolan', 'Britisch');

INSERT INTO filme_nach_titel (titel, erscheinungsjahr, genre, typ, bewertung, regisseur_name, regisseur_nat)
VALUES ('Dune: Part Two', 2024, 'Sci-Fi', 'Kino', 8.7, 'Denis Villeneuve', 'Kanadisch');

INSERT INTO filme_nach_titel (titel, erscheinungsjahr, genre, typ, bewertung, regisseur_name, regisseur_nat)
VALUES ('Barbie', 2023, 'Satire-Komoedie', 'Kino', 7.2, 'Greta Gerwig', 'Amerikanisch');

INSERT INTO filme_nach_titel (titel, erscheinungsjahr, genre, typ, bewertung, regisseur_name, regisseur_nat)
VALUES ('The Wolf of Wall Street', 2013, 'Biografie', 'Kino', 8.2, 'Martin Scorsese', 'Amerikanisch');

INSERT INTO filme_nach_titel (titel, erscheinungsjahr, genre, typ, bewertung, regisseur_name, regisseur_nat)
VALUES ('Parasite', 2019, 'Thriller', 'Kino', 8.5, 'Bong Joon-ho', 'Suedkoreanisch');

-- Tabelle 2: filme_nach_genre
INSERT INTO filme_nach_genre (genre, bewertung, titel, erscheinungsjahr, typ, regisseur_name)
VALUES ('Historisches Drama', 8.9, 'Oppenheimer', 2023, 'Kino', 'Christopher Nolan');

INSERT INTO filme_nach_genre (genre, bewertung, titel, erscheinungsjahr, typ, regisseur_name)
VALUES ('Sci-Fi', 8.7, 'Dune: Part Two', 2024, 'Kino', 'Denis Villeneuve');

INSERT INTO filme_nach_genre (genre, bewertung, titel, erscheinungsjahr, typ, regisseur_name)
VALUES ('Satire-Komoedie', 7.2, 'Barbie', 2023, 'Kino', 'Greta Gerwig');

INSERT INTO filme_nach_genre (genre, bewertung, titel, erscheinungsjahr, typ, regisseur_name)
VALUES ('Biografie', 8.2, 'The Wolf of Wall Street', 2013, 'Kino', 'Martin Scorsese');

INSERT INTO filme_nach_genre (genre, bewertung, titel, erscheinungsjahr, typ, regisseur_name)
VALUES ('Thriller', 8.5, 'Parasite', 2019, 'Kino', 'Bong Joon-ho');

-- Tabelle 3: filme_nach_schauspieler
INSERT INTO filme_nach_schauspieler (schauspieler_name, erscheinungsjahr, titel, genre, bewertung, rolle)
VALUES ('Cillian Murphy', 2023, 'Oppenheimer', 'Historisches Drama', 8.9, 'J. Robert Oppenheimer');

INSERT INTO filme_nach_schauspieler (schauspieler_name, erscheinungsjahr, titel, genre, bewertung, rolle)
VALUES ('Timothee Chalamet', 2024, 'Dune: Part Two', 'Sci-Fi', 8.7, 'Paul Atreides');

INSERT INTO filme_nach_schauspieler (schauspieler_name, erscheinungsjahr, titel, genre, bewertung, rolle)
VALUES ('Margot Robbie', 2023, 'Barbie', 'Satire-Komoedie', 7.2, 'Barbie');

INSERT INTO filme_nach_schauspieler (schauspieler_name, erscheinungsjahr, titel, genre, bewertung, rolle)
VALUES ('Leonardo DiCaprio', 2013, 'The Wolf of Wall Street', 'Biografie', 8.2, 'Jordan Belfort');

INSERT INTO filme_nach_schauspieler (schauspieler_name, erscheinungsjahr, titel, genre, bewertung, rolle)
VALUES ('Margot Robbie', 2013, 'The Wolf of Wall Street', 'Biografie', 8.2, 'Naomi Lapaglia');

INSERT INTO filme_nach_schauspieler (schauspieler_name, erscheinungsjahr, titel, genre, bewertung, rolle)
VALUES ('Song Kang-ho', 2019, 'Parasite', 'Thriller', 8.5, 'Ki-taek');

-- Tabelle 4: filme_nach_plattform
INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Netflix', 'Historisches Drama', 'Oppenheimer', 2023, 8.9, 'Streaming', 19.90);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Netflix', 'Satire-Komoedie', 'Barbie', 2023, 7.2, 'Streaming', 19.90);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Netflix', 'Biografie', 'The Wolf of Wall Street', 2013, 8.2, 'Streaming', 19.90);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Netflix', 'Thriller', 'Parasite', 2019, 8.5, 'Streaming', 19.90);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Amazon Prime Video', 'Historisches Drama', 'Oppenheimer', 2023, 8.9, 'Streaming', 8.99);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Amazon Prime Video', 'Biografie', 'The Wolf of Wall Street', 2013, 8.2, 'Streaming', 8.99);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Amazon Prime Video', 'Thriller', 'Parasite', 2019, 8.5, 'Streaming', 8.99);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Apple TV+', 'Sci-Fi', 'Dune: Part Two', 2024, 8.7, 'Streaming', 9.99);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Apple TV+', 'Thriller', 'Parasite', 2019, 8.5, 'Streaming', 9.99);

INSERT INTO filme_nach_plattform (plattform_name, genre, titel, erscheinungsjahr, bewertung, plattform_typ, plattform_preis)
VALUES ('Disney+', 'Satire-Komoedie', 'Barbie', 2023, 7.2, 'Streaming', 11.99);
