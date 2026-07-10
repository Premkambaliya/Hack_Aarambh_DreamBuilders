import bcryptjs from "bcryptjs";
import UserModel from "../auth/user.model.js";

class UserService {
  async addEmployee(adminUser, employeeData) {
    // 1. Check if email already exists
    const existingUser = await UserModel.findByEmail(employeeData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // 2. Hash password
    const hashedPassword = await bcryptjs.hash(employeeData.password, 10);

    // 3. Create employee attached to the admin's company
    const newEmployeeData = {
      name: employeeData.name,
      email: employeeData.email.toLowerCase(),
      password: hashedPassword,
      companyId: adminUser.companyId,
      companyName: adminUser.companyName || adminUser.company_name,
      role: "employee", 
      status: "active",
      designation: employeeData.designation || "Sales Representative"
    };

    const result = await UserModel.create(newEmployeeData);

    return {
      userId: result.insertedId,
      name: newEmployeeData.name,
      email: newEmployeeData.email,
      role: newEmployeeData.role,
      designation: newEmployeeData.designation
    };
  }

  async getEmployeesByCompany(companyId) {
    const collection = UserModel.getCollection();
    // find all users that belong to this companyId, but exclude passwords
    const employees = await collection.find(
      { companyId: companyId, role: "employee" },
      { projection: { password: 0 } }
    ).toArray();
    
    return employees;
  }
}

export default new UserService();
