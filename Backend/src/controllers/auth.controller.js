import { getCurrentUser, loginUser } from "../services/auth.service.js";

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 401
          ? "Invalid email or password"
          : "Login failed",
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode === 404 ? "User not found" : "Failed to fetch user",
    });
  }
};

const logout = (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
};

export { login, me, logout };
