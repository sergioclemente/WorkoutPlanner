CREATE TABLE workouts 
  ( 
     id          INT auto_increment,
     title       VARCHAR(200) NOT NULL,
     value       VARCHAR(5000) NOT NULL, 
     tags        VARCHAR(1000) NULL,
     duration_sec INT,
     tss         INT,
     sport_type  INT DEFAULT 0,
     PRIMARY KEY(id) 
  );
  CREATE TABLE url 
  ( 
     id          INT auto_increment,
     params       VARCHAR(5000) NOT NULL,
     PRIMARY KEY(id) 
  );