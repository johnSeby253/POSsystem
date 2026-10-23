
import { Routes, Route, Navigate } from "react-router-dom";
import { routeConfig } from "./routeConfig";
import AdminLayout from "../layouts/AdminLayout";
import { useAuthStore } from "../store/authStore";

const AppRoutes = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = Boolean(user && token);
  const normalizedRole = user?.role?.toUpperCase();

  const publicRoutes = routeConfig.filter(
    (route) => route.permission.length === 0
  );

  const protectedRoutes = routeConfig.filter(
    (route) => route.permission.length > 0
  );

  return (
    <Routes>
      {publicRoutes.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Component />
            )
          }
        />
      ))}

      <Route
        element={
          isAuthenticated ? (
            <AdminLayout user={user} onLogout={logout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        {protectedRoutes.map(
          ({ path, component: Component, permission }) => (
            <Route
              key={path}
              path={path}
              element={
                permission.includes(normalizedRole) ? (
                  <Component />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          )
        )}
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
