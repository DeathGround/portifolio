-- ================================================
-- CREATE TABLES
-- ================================================

-- Table for storing admin credentials
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Table for storing personal information
CREATE TABLE IF NOT EXISTS personal_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    profession TEXT NOT NULL,
    about TEXT,
    linkedin TEXT,
    github TEXT,
    profile_picture TEXT
);

-- Table for storing skills
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT NOT NULL
);

-- Table for storing projects
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT
);

-- ================================================
-- INSERT SAMPLE DATA
-- ================================================

-- Insert sample admin data (ensure to hash the password before inserting)
-- Note: Replace 'hashed_password' with the actual hashed password
INSERT INTO admin (username, password) VALUES ('admin', '$2a$10$RsiPB3gYOHqog8QQK6HBt.j5TapSlOabx.SSzXJJuFXjodGyihLEm');

-- Insert sample personal information
INSERT INTO personal_info (full_name, profession, about, linkedin, github, profile_picture) 
VALUES ('Patrick Rusimbi', 'Software Engineer', 'A passionate software engineer focused on building scalable solutions.', 'https://linkedin.com/in/patrick-rusimbi', 'https://github.com/RusimbiPatrick', 'https://avatars.githubusercontent.com/u/54870069?v=4');

-- Insert sample skills
INSERT INTO skills (skill_name) VALUES
    ('Go'),
    ('Node.js'),
    ('JavaScript'),
    ('SQL'),
    ('Web Development');

-- Insert sample projects
INSERT INTO projects (title, description, link) VALUES
    ('Eleganta', 'A rudimentry programing language', 'https://github.com/RusimbiPatrick/Eleganta');

-- ================================================
-- END OF SCRIPT
-- ================================================
