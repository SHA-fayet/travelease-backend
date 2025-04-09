import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

// Resolve backend .env reliably
const envPath = path.resolve(process.cwd(), 'backend', '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    // fallback to relative path
    dotenv.config({ path: new URL('../../backend/.env', import.meta.url).pathname });
}

const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '');
    const value = argv[i + 1];
    if (key) args[key] = value;
}

const { email, password, username = 'admin', address = 'admin', phone = '0000000000' } = args;
if (!email || !password) {
    console.error('Usage: node create_admin.js --email <email> --password <password> [--username <name>]');
    process.exit(1);
}

const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://eab:eab123@motolwala.lvfupdf.mongodb.net/?appName=motolwala';

const resultFile = path.resolve(process.cwd(), 'backend', 'scripts', 'create_admin_result.json');

async function main() {
    try {
        console.log(`Connecting to DB using ${MONGO_URL.startsWith('mongodb+srv') ? 'MongoDB Atlas' : MONGO_URL}`);
        await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        const hashed = bcrypt.hashSync(password, 10);

        const existing = await User.findOne({ email });
        if (existing) {
            existing.password = hashed;
            existing.user_role = 1;
            existing.username = username;
            existing.address = address;
            existing.phone = phone;
            await existing.save();
            console.log('Updated existing user to admin:', email);
            fs.writeFileSync(resultFile, JSON.stringify({ status: 'updated', email }, null, 2));
        } else {
            const newUser = new User({ username, email, password: hashed, address, phone, user_role: 1 });
            await newUser.save();
            console.log('Created new admin user:', email);
            fs.writeFileSync(resultFile, JSON.stringify({ status: 'created', email }, null, 2));
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err?.message || err);
        try {
            fs.writeFileSync(resultFile, JSON.stringify({ status: 'error', error: (err && err.message) || String(err) }, null, 2));
        } catch (_) { }
        process.exit(1);
    }
}

main();
