import clientPromise from "./mongodb.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

// Database and collection names
const DB_NAME = "mern_auth_app";
const USERS_COLLECTION = "users";
const PACKAGES_COLLECTION = "packages";
const GIFT_CODES_COLLECTION = "gift_codes";

// Gift Code Generation Function
const generateUniqueGiftCode = async () => {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const giftCodes = db.collection(GIFT_CODES_COLLECTION);

  const prefixes = [
    "GIFT",
    "SAVE",
    "BONUS",
    "CASH",
    "FREE",
    "WIN",
    "LUCK",
    "GOLD",
  ];
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Generate random code
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const numbers = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}${numbers}`;

    // Check if code already exists
    const existingCode = await giftCodes.findOne({ code: code });
    if (!existingCode) {
      return code;
    }

    attempts++;
  }

  // Fallback: use timestamp if all attempts fail
  const timestamp = Date.now().toString().slice(-6);
  return `GIFT${timestamp}`;
};

// Gift Code Model
export const GiftCodeModel = {
  async createGiftCode(codeData) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const giftCodes = db.collection(GIFT_CODES_COLLECTION);

    // Generate unique code
    const generatedCode = await generateUniqueGiftCode();

    const giftCode = {
      code: generatedCode,
      amount: codeData.amount,
      description: codeData.description || "",
      isActive: true,
      isRedeemed: false,
      redeemedBy: null,
      redeemedAt: null,
      expiresAt: codeData.expiresAt || null,
      createdBy: codeData.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await giftCodes.insertOne(giftCode);
    return { ...giftCode, _id: result.insertedId };
  },

  async findGiftCodeByCode(code) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const giftCodes = db.collection(GIFT_CODES_COLLECTION);

    return await giftCodes.findOne({ code: code.toUpperCase() });
  },

  async getAllGiftCodes(page = 1, limit = 10, query = {}) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const giftCodes = db.collection(GIFT_CODES_COLLECTION);

    const skip = (page - 1) * limit;

    const [codesList, total] = await Promise.all([
      giftCodes
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      giftCodes.countDocuments(query),
    ]);

    return {
      codes: codesList,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async redeemGiftCode(code, userId) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const giftCodes = db.collection(GIFT_CODES_COLLECTION);

    const result = await giftCodes.updateOne(
      {
        code: code.toUpperCase(),
        isActive: true,
        isRedeemed: false,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      },
      {
        $set: {
          isRedeemed: true,
          redeemedBy: new ObjectId(userId),
          redeemedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return result;
  },

  async updateGiftCode(id, updateData) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const giftCodes = db.collection(GIFT_CODES_COLLECTION);

    const result = await giftCodes.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    return result;
  },

  async deleteGiftCode(id) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const giftCodes = db.collection(GIFT_CODES_COLLECTION);

    return await giftCodes.deleteOne({ _id: new ObjectId(id) });
  },

  async getGiftCodeStats() {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const giftCodes = db.collection(GIFT_CODES_COLLECTION);

    const [totalCodes, activeCodes, redeemedCodes, totalValue, redeemedValue] =
      await Promise.all([
        giftCodes.countDocuments({}),
        giftCodes.countDocuments({ isActive: true, isRedeemed: false }),
        giftCodes.countDocuments({ isRedeemed: true }),
        giftCodes
          .aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
          .toArray(),
        giftCodes
          .aggregate([
            { $match: { isRedeemed: true } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray(),
      ]);

    return {
      totalCodes,
      activeCodes,
      redeemedCodes,
      totalValue: totalValue[0]?.total || 0,
      redeemedValue: redeemedValue[0]?.total || 0,
    };
  },
};

// User Model (updated to include wallet history)
export const UserModel = {
  async createUser(userData) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const user = {
      ...userData,
      password: hashedPassword,
      isActive: true,
      emailVerified: false,
      wallet: {
        balance: userData.walletBalance || 0,
        totalInvested: 0,
        totalReturns: 0,
        availableBalance: userData.walletBalance || 0,
      },
      profile: {
        avatar: null,
        bio: "",
        location: "",
        dateOfBirth: null,
      },
      stats: {
        totalPackages: 0,
        activeInvestments: 0,
        completedInvestments: 0,
        lastLogin: null,
      },
      walletHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  async findUserByEmail(email) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    return await users.findOne({ email: email.toLowerCase() });
  },

  async findUserByUsername(username) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    return await users.findOne({ username: username.toLowerCase() });
  },

  async findUserByEmailOrUsername(emailOrUsername) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    return await users.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async findUserById(id) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    return await users.findOne({ _id: new ObjectId(id) });
  },

  async updateUser(id, updateData) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    return result;
  },

  async updateUserWallet(userId, amount, type, description) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    const walletTransaction = {
      id: new ObjectId(),
      type: type, // 'credit', 'debit', 'gift_code'
      amount: amount,
      description: description,
      timestamp: new Date(),
    };

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: {
          "wallet.balance": amount,
          "wallet.availableBalance": amount,
        },
        $push: {
          walletHistory: walletTransaction,
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    return result;
  },

  async getAllUsers(page = 1, limit = 10, query = {}) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
  
    const users = db.collection(USERS_COLLECTION);
    const purchases = db.collection("purchaseRequests");
  
    const skip = (page - 1) * limit;
  
    // Fetch paginated users
    const [usersList, total] = await Promise.all([
      users
        .find(query)
        .project({ password: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      users.countDocuments(query),
    ]);
  
    // === Fetch referrer data ===
    const referrerIds = usersList
      .map((user) => user.referrerId)
      .filter((id) => id)
      .map((id) => new ObjectId(id));
  
    const referrers = await users
      .find({ _id: { $in: referrerIds } })
      .project({ fullName: 1, email: 1, username: 1 })
      .toArray();
  
    const referrerMap = {};
    referrers.forEach((ref) => {
      referrerMap[ref._id.toString()] = ref;
    });
  
    // === Fetch packages for all users ===
    const userIds = usersList.map((u) => u._id);
  
    const allPackages = await purchases
      .find({
        userId: { $in: userIds },
        status: { $in: ["active", "completed"] },
      })
      .project({ userId: 1, packageName: 1, amount: 1, startDate: 1, endDate: 1 })
      .toArray();
  
    const packageMap = {};
    allPackages.forEach((pkg) => {
      const key = pkg.userId.toString();
      if (!packageMap[key]) packageMap[key] = [];
      packageMap[key].push(pkg);
    });
  
    // === Fetch referrals for each user ===
    const allReferrals = await users
      .find({ referrerId: { $in: userIds } })
      .project({ _id: 1, fullName: 1, email: 1, username: 1, referrerId: 1 })
      .toArray();
  
    const referralMap = {};
    allReferrals.forEach((ref) => {
      const key = ref.referrerId.toString();
      if (!referralMap[key]) referralMap[key] = [];
      referralMap[key].push(ref);
    });
  
    // === Combine data for each user ===
    const enrichedUsers = usersList.map((user) => {
      const userIdStr = user._id.toString();
      const referrerData = user.referrerId
        ? referrerMap[user.referrerId.toString()] || null
        : null;
  
      return {
        ...user,
        referrer: referrerData,
        packagesSubscribed: packageMap[userIdStr] || [],
        referrals: referralMap[userIdStr] || [],
      };
    });
  
    return {
      users: enrichedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },
  
  
  async deleteUser(id) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    return await users.deleteOne({ _id: new ObjectId(id) });
  },

  async generateUniqueReferralCode(length = 6) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";
    let unique = false;

    while (!unique) {
      code = Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");

      const existing = await users.findOne({ referralCode: code });
      if (!existing) unique = true;
    }

    return code;
  },

  async getReferrerIdByCode(referralCode) {
    if (!referralCode) return null;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection(USERS_COLLECTION);

    const referrer = await users.findOne({ referralCode });

    return referrer ? referrer._id : null;
  },
};

// Package Model
export const PackageModel = {
  async createPackage(packageData) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const packages = db.collection(PACKAGES_COLLECTION);

    const packageDoc = {
      ...packageData,
      subscribers: 0,
      totalRevenue: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await packages.insertOne(packageDoc);
    return { ...packageDoc, _id: result.insertedId };
  },

  async getAllPackages() {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const packages = db.collection(PACKAGES_COLLECTION);

    return await packages.find({}).sort({ createdAt: -1 }).toArray();
  },

  async getPackageById(id) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const packages = db.collection(PACKAGES_COLLECTION);

    return await packages.findOne({ _id: new ObjectId(id) });
  },

  async updatePackage(id, updateData) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const packages = db.collection(PACKAGES_COLLECTION);

    const result = await packages.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    return result;
  },

  async deletePackage(id) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const packages = db.collection(PACKAGES_COLLECTION);

    return await packages.deleteOne({ _id: new ObjectId(id) });
  },
};
