import { registerUser, listUsers } from "../services/user.service.js";

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser({
      companyId: req.user.companyId,
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

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create employee",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await listUsers(req.user.companyId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export { createUser, getUsers };
