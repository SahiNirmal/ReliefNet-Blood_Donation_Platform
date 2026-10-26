// Seeds the database with realistic synthetic data so the app has
// something meaningful to show instead of an empty collection.
// Run with: npm run seed
//
// WARNING: this clears the User, BloodRequest, and Donation collections
// before inserting fresh data. Don't run this against a database you
// care about keeping.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const BloodRequest = require("./models/BloodRequest");
const Donation = require("./models/Donation");

const DEMO_PASSWORD = "password123"; // plaintext for now — hashed from Experiment 6 onward

const donors = [
  { name: "Aditya Rao", email: "aditya.rao@example.com", phone: "9821000001", bloodGroup: "O-", area: "Andheri East, Mumbai" },
  { name: "Meera Iyer", email: "meera.iyer@example.com", phone: "9821000002", bloodGroup: "B+", area: "Powai, Mumbai" },
  { name: "Farhan Sheikh", email: "farhan.sheikh@example.com", phone: "9821000003", bloodGroup: "A-", area: "Bandra West, Mumbai", isAvailable: false },
  { name: "Priya Menon", email: "priya.menon@example.com", phone: "9821000004", bloodGroup: "AB+", area: "Ghatkopar, Mumbai" },
  { name: "Rohan Kulkarni", email: "rohan.kulkarni@example.com", phone: "9821000005", bloodGroup: "O+", area: "Kandivali West, Mumbai" },
  { name: "Sneha Pillai", email: "sneha.pillai@example.com", phone: "9821000006", bloodGroup: "B-", area: "Dadar, Mumbai" },
  { name: "Karan Malhotra", email: "karan.malhotra@example.com", phone: "9821000007", bloodGroup: "A+", area: "Chembur, Mumbai" },
  { name: "Ananya Desai", email: "ananya.desai@example.com", phone: "9821000008", bloodGroup: "AB-", area: "Malad West, Mumbai" },
];

const requesters = [
  { name: "Ramesh Verma", email: "ramesh.verma@example.com", phone: "9822000001", organization: "" },
  { name: "Sion Hospital Blood Bank", email: "bloodbank@sionhospital.example.com", phone: "9822000002", organization: "Sion Hospital, Mumbai" },
  { name: "KEM Hospital Blood Bank", email: "bloodbank@kem.example.com", phone: "9822000003", organization: "KEM Hospital, Mumbai" },
  { name: "Sunita Nair", email: "sunita.nair@example.com", phone: "9822000004", organization: "" },
];

const requestTemplates = [
  { patientName: "Rahul Deshmukh", bloodGroup: "O-", unitsNeeded: 3, hospital: "Sion Hospital, Mumbai", urgency: "critical", contactNumber: "9833000001" },
  { patientName: "Ayesha Khan", bloodGroup: "B+", unitsNeeded: 2, hospital: "KEM Hospital, Mumbai", urgency: "urgent", contactNumber: "9833000002" },
  { patientName: "Vikram Nair", bloodGroup: "AB+", unitsNeeded: 1, hospital: "Lilavati Hospital, Mumbai", urgency: "stable", contactNumber: "9833000003" },
  { patientName: "Sneha Kulkarni", bloodGroup: "A-", unitsNeeded: 4, hospital: "Tata Memorial Hospital, Mumbai", urgency: "critical", contactNumber: "9833000004" },
  { patientName: "Ramesh Verma (Father)", bloodGroup: "B+", unitsNeeded: 2, hospital: "Kokilaben Hospital, Mumbai", urgency: "stable", contactNumber: "9833000005" },
  { patientName: "Imran Sheikh", bloodGroup: "O+", unitsNeeded: 2, hospital: "Nair Hospital, Mumbai", urgency: "urgent", contactNumber: "9833000006" },
  { patientName: "Kavya Reddy", bloodGroup: "A+", unitsNeeded: 1, hospital: "Hinduja Hospital, Mumbai", urgency: "stable", contactNumber: "9833000007" },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env — aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.name} on ${mongoose.connection.host}`);

  console.log("Clearing existing Users, BloodRequests, and Donations...");
  await Promise.all([User.deleteMany({}), BloodRequest.deleteMany({}), Donation.deleteMany({})]);

  console.log("Creating donors...");
  const createdDonors = await User.create(
    donors.map((d) => ({ ...d, role: "donor", password: DEMO_PASSWORD }))
  );

  console.log("Creating requesters...");
  const createdRequesters = await User.create(
    requesters.map((r) => ({ ...r, role: "requester", password: DEMO_PASSWORD }))
  );

  console.log("Creating an admin account (for reference — the live Admin Panel login is separate/hardcoded)...");
  await User.create({
    name: "ReliefNet Admin",
    email: "admin@reliefnet.com",
    password: DEMO_PASSWORD,
    role: "admin",
  });

  console.log("Creating blood requests...");
  const createdRequests = await BloodRequest.create(
    requestTemplates.map((r, i) => ({
      ...r,
      requester: createdRequesters[i % createdRequesters.length]._id,
    }))
  );

  console.log("Creating donations for a couple of the requests (marks them fulfilled)...");
  const fulfilledPairs = [
    { donorIndex: 0, requestIndex: 0 },
    { donorIndex: 4, requestIndex: 4 },
  ];

  for (const { donorIndex, requestIndex } of fulfilledPairs) {
    const donor = createdDonors[donorIndex];
    const request = createdRequests[requestIndex];

    await Donation.create({
      donor: donor._id,
      request: request._id,
      hospital: request.hospital,
      units: request.unitsNeeded,
      status: "completed",
    });

    request.status = "fulfilled";
    request.fulfilledBy = donor._id;
    await request.save();
  }

  console.log("\nSeed complete:");
  console.log(`  ${createdDonors.length} donors`);
  console.log(`  ${createdRequesters.length} requesters`);
  console.log(`  1 admin (reference only)`);
  console.log(`  ${createdRequests.length} blood requests (${fulfilledPairs.length} fulfilled)`);
  console.log(`  ${fulfilledPairs.length} donations`);
  console.log(`\nAll seeded accounts use the password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
