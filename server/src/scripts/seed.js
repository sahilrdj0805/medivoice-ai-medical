import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Seed / Update Admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("\n⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Skipping admin setup.");
      process.exit(0);
    }

    console.log(`\n🔐 Setting up admin: ${adminEmail}`);

    const demoted = await User.updateMany({ role: "admin" }, { role: "user" });
    if (demoted.modifiedCount > 0) {
      console.log(`   ↳ Removed admin from ${demoted.modifiedCount} previous admin(s).`);
    }

    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      adminUser.password = adminPassword;
      adminUser.role = "admin";
      await adminUser.save();
      console.log(`✅ Updated existing user "${adminUser.name}" to admin.`);
    } else {
      adminUser = await User.create({
        name: "Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        credits: 9999,
      });
      console.log(`✅ Created new admin account: ${adminEmail}`);
    }

    console.log("\n🎉 Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error(" Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
