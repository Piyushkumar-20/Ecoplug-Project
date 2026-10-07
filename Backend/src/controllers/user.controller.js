import { registerUser } from "../services/user.service.js";

const createUser = async (req, res) => {
  try {
    const { companyId, name, email, password } = req.body;

    const result = await registerUser({
      companyId,
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        userId: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create employee",
    });
  }
};

export { createUser };
