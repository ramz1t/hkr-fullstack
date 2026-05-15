import { Suspense } from "react";
import { lazily } from "react-lazily";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "@repo/hooks/use-auth";
import { Navbar } from "./components";

const { Login, Users } = lazily(() => import("./pages"));

const ProtectedAdminRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
          <span className="text-2xl font-bold">⚠️</span>
        </div>
        <h2 className="text-xl font-bold font-heading mb-2">
          Unauthorized Access
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Your account does not possess the required Administrator permissions
          to view this resource. Please sign in with an authorized admin
          profile.
        </p>
        <Navigate to="/login" replace />
      </div>
    );
  }

  return <Outlet />;
};

const App = () => {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Navbar />
      <main className="grow flex flex-col overflow-y-auto">
        <Suspense
          fallback={
            <div className="grow flex items-center justify-center">
              <span className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            </div>
          }
        >
          <Routes>
            <Route
              path="/"
              element={
                <div className="grow flex flex-col items-center justify-center p-8 text-center">
                  <h2 className="text-2xl font-bold font-heading">
                    Select Page
                  </h2>
                </div>
              }
            />
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/users" element={<Users />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <div className="grow flex flex-col items-center justify-center p-8 text-center">
                  <h2 className="text-2xl font-bold font-heading">
                    Page Not Found
                  </h2>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
