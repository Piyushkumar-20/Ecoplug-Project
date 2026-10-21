import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiRequest, restoreSession } from "../services/api";
import { socket } from "../services/socket";

const ProtectedRoute = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const restored = await restoreSession();
      if (!restored) {
        if (active) setStatus("signed-out");
        return;
      }

      try {
        const response = await apiRequest("/api/auth/me");
        if (response?.data) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        socket.connect();
        if (active) setStatus("signed-in");
      } catch {
        if (active) setStatus("signed-out");
      }
    };

    checkSession();
    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="h-full min-h-40 flex items-center justify-center text-sm text-slate-500">
        Restoring session...
      </div>
    );
  }

  if (status === "signed-out") {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
