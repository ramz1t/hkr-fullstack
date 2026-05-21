import { Suspense } from "react";
import { lazily } from "react-lazily";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar, ProtectedRoute } from "./components";
const { Home, Login, Wallet, Games, GamePage, Profile, Verify } = lazily(
  () => import("./pages")
);

const App = () => {
  return (
    <>
      <Navbar />
      <main className="md:ml-nav max-md:mt-nav grow flex flex-col">
        <Suspense>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/games" element={<Games />} />
              <Route path="/games/:slug" element={<GamePage />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile/*" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
};

export default App;
