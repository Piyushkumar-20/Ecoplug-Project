import { registerCompany } from "../services/company.service.js";

const createCompany = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await registerCompany({ name });

    res.status(201).json({
      success: true,
      message: "Company registered successfully",
      data: {
        companyId: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create company error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to register company",
    });
  }
};

export { createCompany };
