import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { User, Event, Booking } from "./models";
import { UserRole, EventLocation, EventStatus } from "../common";
import { createHash } from "../utils/hash";

// Load environment variables from config/.env
dotenv.config({
  path: path.resolve("./config/.env"),
});

const DEFAULT_PASSWORD = "Password123!";

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set in environment variables");
    process.exit(1);
  }

  console.log("Connecting to database...");
  await mongoose.connect(mongoUri);
  console.log("✅ Database connected successfully");

  try {
    console.log("🧹 Cleaning up existing data...");
    await Booking.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
    console.log("✅ Existing data cleared");

    // 1. Hash default password
    const hashedPassword = await createHash(DEFAULT_PASSWORD);

    // 2. Seed Users with different roles (Admin, Organizers, Users)
    console.log("👤 Seeding users...");
    const usersToCreate = [
      {
        name: "System Admin",
        email: "admin@example.com",
        password: hashedPassword,
        phone: "01011112222",
        role: UserRole.ADMIN,
      },
      {
        name: "Sarah Organizer",
        email: "organizer1@example.com",
        password: hashedPassword,
        phone: "01122223333",
        role: UserRole.ORGANIZER,
      },
      {
        name: "Omar Planner",
        email: "organizer2@example.com",
        password: hashedPassword,
        phone: "01233334444",
        role: UserRole.ORGANIZER,
      },
      {
        name: "Layla Events",
        email: "organizer3@example.com",
        password: hashedPassword,
        phone: "01544445555",
        role: UserRole.ORGANIZER,
      },
      {
        name: "John Attendee",
        email: "user1@example.com",
        password: hashedPassword,
        phone: "01055556666",
        role: UserRole.USER,
      },
      {
        name: "Mona Hassan",
        email: "user2@example.com",
        password: hashedPassword,
        phone: "01166667777",
        role: UserRole.USER,
      },
      {
        name: "Tarek Ali",
        email: "user3@example.com",
        password: hashedPassword,
        phone: "01277778888",
        role: UserRole.USER,
      },
    ];

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✅ Created ${createdUsers.length} users with roles:`);
    createdUsers.forEach((user) => {
      console.log(
        `   - [${user.role.toUpperCase()}] ${user.name} (${user.email})`,
      );
    });

    // Extract organizers to assign events to them
    const organizers = createdUsers.filter(
      (user) => user.role === UserRole.ORGANIZER,
    );
    const org1 = organizers[0]!._id;
    const org2 = organizers[1]!._id;
    const org3 = organizers[2]!._id;

    // Helper date generator relative to now
    const now = new Date();
    const addDays = (days: number, hours = 0): Date => {
      const d = new Date(
        now.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000,
      );
      return d;
    };

    // 3. Seed 20 Events with different statuses and location types
    console.log("\n📅 Seeding 20 events with diverse statuses & locations...");
    const eventsToCreate = [
      // --- PUBLISHED & ONLINE (5) ---
      {
        title: "AI and Machine Learning Summit 2026",
        description:
          "Join leading researchers and engineers to explore the latest advancements in LLMs, computer vision, and autonomous systems.",
        category: "Technology",
        locationType: EventLocation.ONLINE,
        location: "https://zoom.us/j/summit2026",
        startDate: addDays(10),
        endDate: addDays(11),
        capacity: 500,
        price: 120,
        organizerId: org1,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "Web Dev Bootcamp Live Workshop",
        description:
          "Hands-on coding masterclass covering modern fullstack development with Node.js, TypeScript, and React frameworks.",
        category: "Technology",
        locationType: EventLocation.ONLINE,
        location: "https://meet.google.com/dev-live",
        startDate: addDays(15),
        endDate: addDays(15, 4),
        capacity: 150,
        price: 0,
        organizerId: org2,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "Modern UI and UX Design Masterclass",
        description:
          "Learn visual hierarchy, responsive layout systems, design tokens, and user research methodologies from industry leads.",
        category: "Design",
        locationType: EventLocation.ONLINE,
        location: "https://zoom.us/j/ux-design-master",
        startDate: addDays(5),
        endDate: addDays(5, 3),
        capacity: 200,
        price: 75,
        organizerId: org3,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "Digital Marketing Strategies 2026",
        description:
          "Deep dive into performance marketing, viral content distribution, conversion rate optimization, and brand positioning.",
        category: "Marketing",
        locationType: EventLocation.ONLINE,
        location: "https://webinar.eventbooking.com/marketing26",
        startDate: addDays(25),
        endDate: addDays(25, 3),
        capacity: 400,
        price: 60,
        organizerId: org1,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "Mindfulness and Mental Health",
        description:
          "Certified psychologists guide practical mindfulness exercises, stress reduction protocols, and emotional resilience skills.",
        category: "Health",
        locationType: EventLocation.ONLINE,
        location: "https://zoom.us/j/mindfulness-live",
        startDate: addDays(14),
        endDate: addDays(14, 2),
        capacity: 300,
        price: 0,
        organizerId: org2,
        status: EventStatus.PUBLISHED,
      },

      // --- PUBLISHED & OFFLINE (5) ---
      {
        title: "Cairo Tech Expo and Career Fair",
        description:
          "Egypt's premier annual gathering for technology innovators, tech startups, hiring partners, and developers.",
        category: "Technology",
        locationType: EventLocation.OFFLINE,
        location: "Cairo International Convention Centre, Hall 1",
        startDate: addDays(20),
        endDate: addDays(22),
        capacity: 1000,
        price: 250,
        organizerId: org3,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "Acoustic Indie Rock Night",
        description:
          "An intimate live music acoustic session featuring rising underground indie rock bands and singer-songwriters.",
        category: "Music",
        locationType: EventLocation.OFFLINE,
        location: "El Sawy Culturewheel, Zamalek, Cairo",
        startDate: addDays(8),
        endDate: addDays(8, 4),
        capacity: 350,
        price: 180,
        organizerId: org1,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "Classical Symphony Orchestral Gala",
        description:
          "An evening of timeless classical compositions performed by the Cairo Symphony Orchestra in the main concert hall.",
        category: "Music",
        locationType: EventLocation.OFFLINE,
        location: "Cairo Opera House Main Hall, Gezira",
        startDate: addDays(12),
        endDate: addDays(12, 3),
        capacity: 800,
        price: 400,
        organizerId: org2,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "Startup Pitch Night and Networking",
        description:
          "Ten innovative seed-stage startups pitch their breakthrough ideas to angel investors and venture capital firms.",
        category: "Business",
        locationType: EventLocation.OFFLINE,
        location: "The GrEEK Campus, Downtown Cairo",
        startDate: addDays(18),
        endDate: addDays(18, 5),
        capacity: 250,
        price: 150,
        organizerId: org3,
        status: EventStatus.PUBLISHED,
      },
      {
        title: "National 10K Marathon and Fun Run",
        description:
          "Get active, join the city marathon along the Nile promenade, and celebrate health and endurance with running enthusiasts.",
        category: "Sports",
        locationType: EventLocation.OFFLINE,
        location: "Zamalek Corniche Starting Point, Cairo",
        startDate: addDays(30),
        endDate: addDays(30, 5),
        capacity: 1500,
        price: 50,
        organizerId: org1,
        status: EventStatus.PUBLISHED,
      },

      // --- FINISHED & ONLINE (2) ---
      {
        title: "Global E-Commerce Growth Summit",
        description:
          "Keynotes and panels from global marketplace leaders on scaling supply chains, cross-border payments, and customer retention.",
        category: "Business",
        locationType: EventLocation.ONLINE,
        location: "https://live.ecommerce-summit.io",
        startDate: addDays(-15),
        endDate: addDays(-14),
        capacity: 600,
        price: 90,
        organizerId: org2,
        status: EventStatus.FINISHED,
      },
      {
        title: "Mobile App Dev with Flutter",
        description:
          "Recorded crash course on building smooth 60fps cross-platform mobile apps using Flutter and state management with Bloc.",
        category: "Technology",
        locationType: EventLocation.ONLINE,
        location: "https://meet.google.com/flutter-stream",
        startDate: addDays(-7),
        endDate: addDays(-7, 4),
        capacity: 250,
        price: 40,
        organizerId: org3,
        status: EventStatus.FINISHED,
      },

      // --- FINISHED & OFFLINE (3) ---
      {
        title: "Cybersecurity Defense Forum",
        description:
          "Exploration of zero trust architecture, threat intelligence, and cloud security frameworks against modern attack vectors.",
        category: "Technology",
        locationType: EventLocation.OFFLINE,
        location: "Smart Village Conference Center, Giza",
        startDate: addDays(-20),
        endDate: addDays(-19),
        capacity: 400,
        price: 300,
        organizerId: org1,
        status: EventStatus.FINISHED,
      },
      {
        title: "Photography and Lighting Workshop",
        description:
          "Hands-on studio lighting techniques, portrait composition, and color grading workflows for creative photographers.",
        category: "Art",
        locationType: EventLocation.OFFLINE,
        location: "Darb 1718 Contemporary Art Center, Maadi",
        startDate: addDays(-10),
        endDate: addDays(-10, 6),
        capacity: 60,
        price: 200,
        organizerId: org2,
        status: EventStatus.FINISHED,
      },
      {
        title: "Annual Jazz and Blues Festival",
        description:
          "A three-day cultural music festival gathering international and regional jazz performers and instrumental soloists.",
        category: "Music",
        locationType: EventLocation.OFFLINE,
        location: "Al-Azhar Park Amphitheatre, Cairo",
        startDate: addDays(-30),
        endDate: addDays(-27),
        capacity: 1200,
        price: 220,
        organizerId: org3,
        status: EventStatus.FINISHED,
      },

      // --- CANCELLED & ONLINE (3) ---
      {
        title: "Blockchain and DeFi Developers Day",
        description:
          "Hands-on smart contract audits, decentralized liquidity protocols, and zero-knowledge proof applications.",
        category: "Technology",
        locationType: EventLocation.ONLINE,
        location: "https://zoom.us/j/defi-dev-day",
        startDate: addDays(7),
        endDate: addDays(7, 5),
        capacity: 300,
        price: 100,
        organizerId: org1,
        status: EventStatus.CANCELLED,
      },
      {
        title: "Virtual Reality Gaming Showcase",
        description:
          "Live demos of upcoming indie VR titles, haptic feedback gear, and developer Q&A sessions. Postponed to next season.",
        category: "Gaming",
        locationType: EventLocation.ONLINE,
        location: "https://twitch.tv/vrgamingshowcase",
        startDate: addDays(16),
        endDate: addDays(16, 4),
        capacity: 500,
        price: 0,
        organizerId: org2,
        status: EventStatus.CANCELLED,
      },
      {
        title: "Cloud Native Microservices Camp",
        description:
          "Deep architectural patterns on Kubernetes, service meshes, distributed tracing, and event-driven architectures.",
        category: "Technology",
        locationType: EventLocation.ONLINE,
        location: "https://zoom.us/j/cloudnativecamp",
        startDate: addDays(28),
        endDate: addDays(28, 6),
        capacity: 350,
        price: 110,
        organizerId: org3,
        status: EventStatus.CANCELLED,
      },

      // --- CANCELLED & OFFLINE (2) ---
      {
        title: "Cairo Outdoor Food Festival",
        description:
          "Celebration of culinary arts, street food popups, and artisan desserts by top regional chefs. Cancelled due to maintenance.",
        category: "Food",
        locationType: EventLocation.OFFLINE,
        location: "Family Park, New Cairo",
        startDate: addDays(9),
        endDate: addDays(10),
        capacity: 2000,
        price: 80,
        organizerId: org1,
        status: EventStatus.CANCELLED,
      },
      {
        title: "International Graphic Design Expo",
        description:
          "Typography installations, branding case studies, and poster galleries by international design studios.",
        category: "Art",
        locationType: EventLocation.OFFLINE,
        location: "Bibliotheca Alexandrina Conference Hall",
        startDate: addDays(22),
        endDate: addDays(24),
        capacity: 700,
        price: 150,
        organizerId: org2,
        status: EventStatus.CANCELLED,
      },
    ];

    const createdEvents = await Event.insertMany(eventsToCreate);
    console.log(`✅ Created ${createdEvents.length} events successfully!\n`);

    // Summary Statistics
    const publishedCount = createdEvents.filter(
      (e) => e.status === EventStatus.PUBLISHED,
    ).length;
    const finishedCount = createdEvents.filter(
      (e) => e.status === EventStatus.FINISHED,
    ).length;
    const cancelledCount = createdEvents.filter(
      (e) => e.status === EventStatus.CANCELLED,
    ).length;
    const onlineCount = createdEvents.filter(
      (e) => e.locationType === EventLocation.ONLINE,
    ).length;
    const offlineCount = createdEvents.filter(
      (e) => e.locationType === EventLocation.OFFLINE,
    ).length;

    console.log("📊 Seeding Summary:");
    console.log(`   - Total Events: ${createdEvents.length}`);
    console.log(
      `   - Status Breakdown: ${publishedCount} Published | ${finishedCount} Finished | ${cancelledCount} Cancelled`,
    );
    console.log(
      `   - Location Breakdown: ${onlineCount} Online | ${offlineCount} Offline`,
    );
    console.log(
      `   - Default Password for all seeded users: ${DEFAULT_PASSWORD}`,
    );
    console.log("\n🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error while seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database disconnected");
  }
}

seed();
