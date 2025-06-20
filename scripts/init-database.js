import { UserModel, PackageModel } from "../lib/database.js"

async function initializeDatabase() {
  try {
    console.log("🚀 Initializing database...")

    // Check if admin user already exists
    const existingAdmin = await UserModel.findUserByEmail("admin@example.com")

    if (!existingAdmin) {
      // Create default admin user
      const adminUser = await UserModel.createUser({
        fullName: "Admin User",
        username: "admin",
        email: "admin@example.com",
        phone: "+1987654321",
        password: "admin123",
        role: "admin",
      })
      console.log("✅ Admin user created:", adminUser.email)
    } else {
      console.log("ℹ️  Admin user already exists")
    }

    // Check if demo user already exists
    const existingUser = await UserModel.findUserByEmail("user@example.com")

    if (!existingUser) {
      // Create default demo user
      const demoUser = await UserModel.createUser({
        fullName: "John Doe",
        username: "johndoe",
        email: "user@example.com",
        phone: "+1234567890",
        password: "password123",
        role: "user",
      })
      console.log("✅ Demo user created:", demoUser.email)
    } else {
      console.log("ℹ️  Demo user already exists")
    }

    // Create sample packages
    const packages = await PackageModel.getAllPackages()

    if (packages.length === 0) {
      const samplePackages = [
        {
          name: "Starter Package",
          price: 1000,
          duration: 30,
          roi: 10,
          description: "Perfect for beginners looking to start their investment journey",
          features: ["Low risk", "Monthly returns", "24/7 support"],
          status: "active",
        },
        {
          name: "Premium Growth",
          price: 5000,
          duration: 90,
          roi: 18,
          description: "High growth potential with moderate risk",
          features: ["Medium risk", "Quarterly returns", "Priority support", "Market analysis"],
          status: "active",
        },
        {
          name: "Elite Investment",
          price: 10000,
          duration: 180,
          roi: 25,
          description: "Maximum returns for experienced investors",
          features: ["High risk", "Bi-annual returns", "VIP support", "Personal advisor"],
          status: "active",
        },
      ]

      for (const pkg of samplePackages) {
        await PackageModel.createPackage(pkg)
        console.log(`✅ Package created: ${pkg.name}`)
      }
    } else {
      console.log("ℹ️  Sample packages already exist")
    }

    console.log("🎉 Database initialization completed successfully!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
  } finally {
    process.exit(0)
  }
}

initializeDatabase()
