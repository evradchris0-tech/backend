const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'Password@123';
    const saltRounds = 12; // IMPORTANT : 12 rounds comme le service

    const hash = await bcrypt.hash(password, saltRounds);

    console.log('===================================');
    console.log('Password:', password);
    console.log('Salt Rounds:', saltRounds);
    console.log('Hash:', hash);
    console.log('===================================');
    console.log('');
    console.log('SQL Command:');
    console.log(`UPDATE auth_users SET password_encrypted = '${hash}' WHERE email = 'chrisomgba04@gmail.com';`);
}

generateHash();