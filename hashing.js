const bcrypt = require('bcryptjs');

const password = 'password'; // Use your desired password
const saltRounds = 10;
bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    console.log(hashedPassword);  // Save this hashed password in the database
});
