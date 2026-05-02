import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../src/Models/Usermodel.js';

// Recreate directory path for ES Modules so dotenv can find the .env file in the Backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Checking for existing Admin...');
        
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (adminExists) {
            console.log('An Admin already exists. Seeding cancelled.');
            process.exit(0);
        }

        console.log('Creating Admin account...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const newAdmin = await User.create({
            name: 'Somesh',
            email: 'somesh.2428it420@kiet.edu',
            password: hashedPassword,
            role: 'admin'
        });

        console.log(`✅ Admin created successfully!`);
        console.log(`Email: ${newAdmin.email}`);
        console.log(`ID: ${newAdmin._id}`);
        console.log(`Temporary Password: adminPassword123`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();