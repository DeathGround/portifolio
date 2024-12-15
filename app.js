const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { error } = require('console');

// Initialize the app
const app = express();
const db = new sqlite3.Database('./database.db');

// Set up EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'js')));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Use sessions for admin login
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Helper function to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    }
    res.redirect('/login');
};

// Get personal information, skills, and projects from the database
app.get('/', (req, res) => {
    db.serialize(() => {
        // Fetch personal info
        db.get('SELECT * FROM personal_info LIMIT 1', [], (err, personal_info) => {
            if (err) {
                console.error(err.message);
                return;
            }

            // Fetch skills
            db.all('SELECT * FROM skills', [], (err, skills) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                
                // Fetch projects
                db.all('SELECT * FROM projects', [], (err, projects) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }

                    // Render the EJS template
                    res.render('index', { personal_info, skills, projects });
                });
            });
        });
    });
});

// Admin login route
app.get('/login', (req, res) => {
    res.render('login');
});

// Delete project route
app.delete('/admin/projects/:id', (req, res) => {
    const projectId = req.params.id;

    db.run('DELETE FROM projects WHERE id = ?', [projectId], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete project' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    });
});

// Admin login POST handler
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username exists
    db.get('SELECT * FROM admin WHERE username = ?', [username], (err, row) => {
        if (err || !row) {
            return res.redirect('/login');
        }

        // Compare the password with the hashed password
        bcrypt.compare(password, row.password, (err, result) => {
            console.log(result)
            if (result) {
                req.session.loggedIn = true;
                return res.redirect('/admin');
            } else {
                return res.redirect('/login');
            }
        });
    });
});

// Admin route (Protected)
app.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin');
});

// Admin logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin');
        }
        res.redirect('/');
    });
});

// Add/update personal info (admin only)
app.post('/admin/update-personal', isAuthenticated, (req, res) => {
    const { full_name, profession, about, linkedin, github, profile_picture } = req.body;

    let query = 'UPDATE personal_info SET';
    let values = [];
    let setClauses = [];

    // Check which fields are provided and append them to the query and values array
    if (full_name) {
        setClauses.push('full_name = ?');
        values.push(full_name);
    }
    if (profession) {
        setClauses.push('profession = ?');
        values.push(profession);
    }
    if (about) {
        setClauses.push('about = ?');
        values.push(about);
    }
    if (linkedin) {
        setClauses.push('linkedin = ?');
        values.push(linkedin);
    }
    if (github) {
        setClauses.push('github = ?');
        values.push(github);
    }
    if (profile_picture) {
        setClauses.push('profile_picture = ?');
        values.push(profile_picture);
    }

    // If no fields were provided to update, send an error message
    if (setClauses.length === 0) {
        return res.status(400).send('No fields to update');
    }

    // Join the setClauses with commas and add WHERE clause
    query += ' ' + setClauses.join(', ') + ' WHERE id = 1';

    // Execute the query
    db.run(query, values, (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Database update failed');
        }
        res.redirect('/admin');
    });
});

// Add/update skills (admin only)
app.post('/admin/update-skills', isAuthenticated, (req, res) => {
    const { skills } = req.body;  // skills should be a comma-separated string

    db.run('DELETE FROM skills', (err) => {
        if (err) {
            console.error(err.message);
            return;
        }

        const skillsArray = skills.split(',');
        const stmt = db.prepare('INSERT INTO skills (skill_name) VALUES (?)');
        
        skillsArray.forEach((skill) => {
            stmt.run(skill.trim());
        });

        stmt.finalize(() => {
            res.redirect('/admin');
        });
    });
});

// Update project route
app.put('/admin/projects/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, link } = req.body;

    const sql = 'UPDATE projects SET title = ?, description = ?, link = ? WHERE id = ?';
    const params = [title, description, link, id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: error });
        }

        res.json({ message: 'Project updated successfully' });
    });
});


// Fetch all projects route
app.get('/admin/projects', (req, res) => {
    db.all('SELECT * FROM projects', [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve projects' });
        }
        res.json(rows);
    });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
