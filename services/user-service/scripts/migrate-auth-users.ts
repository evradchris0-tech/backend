// scripts/migrate-auth-users.ts

import { Client } from 'pg';

const authDb = new Client({
    host: 'localhost',
    port: 5432,
    user: 'immo360_user',
    password: 'immo360MSAuth',
    database: 'immo360_auth',
});

const userDb = new Client({
    host: 'localhost',
    port: 5432,
    user: 'immo360_user',
    password: 'immo360MSAuth',
    database: 'immoUser',
});

async function migrate() {
    try {
        await authDb.connect();
        await userDb.connect();

        console.log('🔄 Récupération des utilisateurs de auth-service...');

        const result = await authDb.query(`
      SELECT id, email, status, email_verified, created_at, updated_at
      FROM auth_users
      WHERE status = 'ACTIVE'
    `);

        console.log(`📊 ${result.rows.length} utilisateurs trouvés`);

        for (const authUser of result.rows) {
            const firstName = authUser.email.includes('superadmin') ? 'Super' :
                authUser.email.includes('admin') ? 'Admin' :
                    authUser.email.split('@')[0];

            const lastName = authUser.email.includes('superadmin') ? 'Admin' :
                authUser.email.includes('admin') ? 'Principal' :
                    'User';

            const role = authUser.email.includes('superadmin') ? 'SUPERADMIN' :
                authUser.email.includes('admin') ? 'ADMINISTRATOR' :
                    authUser.email.includes('supervisor') ? 'SUPERVISOR' :
                        authUser.email.includes('agent') ? 'AGENT_TERRAIN' :
                            'OCCUPANT';

            const userStatus = authUser.status === 'ACTIVE' ? 'ACTIVE' :
                authUser.status === 'INACTIVE' ? 'INACTIVE' :
                    authUser.status === 'LOCKED' ? 'LOCKED' :
                        'PENDING_EMAIL_VERIFICATION';

            try {
                await userDb.query(`
          INSERT INTO users (
            id, email, first_name, last_name, role, status,
            email_verified, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            status = EXCLUDED.status,
            email_verified = EXCLUDED.email_verified,
            updated_at = EXCLUDED.updated_at
        `, [
                    authUser.id,
                    authUser.email,
                    firstName,
                    lastName,
                    role,
                    userStatus,
                    authUser.email_verified,
                    authUser.created_at,
                    authUser.updated_at
                ]);

                console.log(`✅ ${authUser.email} synchronisé`);
            } catch (err) {
                console.error(`❌ Erreur pour ${authUser.email}:`, err.message);
            }
        }

        console.log('🎉 Migration terminée !');

        const count = await userDb.query('SELECT COUNT(*) FROM users');
        console.log(`📊 Total utilisateurs dans user-service: ${count.rows[0].count}`);

    } finally {
        await authDb.end();
        await userDb.end();
    }
}

migrate().catch(console.error);