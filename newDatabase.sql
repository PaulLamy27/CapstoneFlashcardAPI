SHOW DATABASES;

SHOW TABLES;

# priority (id???, userId, cardId, priority)
CREATE TABLE IF NOT EXISTS cards (id INT NOT NULL AUTO_INCREMENT, side1 VARCHAR(2000), side2 VARCHAR(2000), pronunciation VARCHAR(2000), priority INT, deckId INT, createdOn DATETIME, PRIMARY KEY (id));
select * from cards;

CREATE TABLE IF NOT EXISTS priority (id INT NOT NULL AUTO_INCREMENT, userId INT NOT NULL, cardId INT NOT NULL, priority INT NOT NULL, lastStudied DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id));

CREATE TABLE IF NOT EXISTS deck (id INT NOT NULL AUTO_INCREMENT, title VARCHAR(500), userId INT NOT NULL, isPublic BOOLEAN, createdOn DATETIME, PRIMARY KEY (id));
ALTER TABLE deck MODIFY COLUMN createdOn DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE deck MODIFY COLUMN isPublic BOOLEAN DEFAULT TRUE;
describe deck;
select * from deck;
CREATE TABLE IF NOT EXISTS user (id INT NOT NULL AUTO_INCREMENT, firstName VARCHAR(50), lastName VARCHAR(50), email VARCHAR(50), username VARCHAR(50), password VARCHAR(50), PRIMARY KEY (id));
describe user;
ALTER TABLE user MODIFY COLUMN password VARCHAR(60);
select * from user;
select * from deck;
# get all PUBLIC decks from a user
select title from deck where isPublic and userId = (select id from user where username = "sora");