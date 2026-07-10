import {
  getEmployeeOverview,
  getEmployeeIntelligence,
} from "./ei.service.js";

export const overviewHandler = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const overview = await getEmployeeOverview(companyId);

    res.status(200).json({
      success: true,
      totalEmployees: overview.length,
      employees: overview,
    });
  } catch (error) {
    console.error("Employee overview error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const intelligenceHandler = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { employeeId } = req.params;

    const intelligence = await getEmployeeIntelligence(companyId, employeeId);

    res.status(200).json({
      success: true,
      ...intelligence,
    });
  } catch (error) {
    console.error("Employee intelligence error:", error);
    const status = error.message === "Employee not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};
