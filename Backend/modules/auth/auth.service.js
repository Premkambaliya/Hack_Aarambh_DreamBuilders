// Authentication Service Layer
// Business logic for authentication operations

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "./user.model.js";
import CompanyModel from "../company/company.model.js";
import "dotenv/config.js";

class AuthService {
  async signup(email, password, name, company_name) {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create Company first (Phase 1 modification)
    const companyResult = await CompanyModel.create({
      companyName: company_name,
      adminUserId: null, // Will update after user is created
    });
    
    const companyId = companyResult.insertedId;

    // Create user attached to this company as Admin
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      companyId: companyId,
      companyName: company_name,
      role: "admin", // The creator is the admin
      status: "active",
    };

    const result = await UserModel.create(userData);
    const userId = result.insertedId;

    // Update the company to link the admin user
    await CompanyModel.updateOne(companyId, { adminUserId: userId, adminName: name });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: userId,
        companyId: companyId,
        email: email.toLowerCase(),
        name,
        role: "admin",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        userId: userId,
        companyId: companyId,
        email,
        name,
        company_name, // Keeping for backward compatibility temporarily
        role: "admin",
      },
      message: "Company and Admin registered successfully",
    };
  }

  async login(email, password) {
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        companyId: user.companyId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        userId: user._id,
        companyId: user.companyId,
        email: user.email,
        name: user.name,
        role: user.role,
        company_name: user.company_name // fallback
      },
      message: "Login successful",
    };
  }

  async getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserProfile(userId, updateData) {
    const finalUpdate = {};
    if (updateData.name) finalUpdate.name = updateData.name;
    if (updateData.email) finalUpdate.email = updateData.email.toLowerCase();
    if (updateData.company_name) finalUpdate.company_name = updateData.company_name;

    if (updateData.newPassword) {
      // Verify current password first
      const user = await UserModel.findById(userId);
      if (!user) throw new Error("User not found");
      const isValid = await bcryptjs.compare(updateData.currentPassword || "", user.password);
      if (!isValid) throw new Error("Current password is incorrect");
      finalUpdate.password = await bcryptjs.hash(updateData.newPassword, 10);
    }

    await UserModel.updateOne(userId, finalUpdate);

    const user = await UserModel.findById(userId);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUserAccount(userId) {
    const { default: CallModel } = await import("../audio/audio.model.js");
    await CallModel.deleteByUserId(userId);
    await UserModel.deleteOne(userId);
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

export default new AuthService();
