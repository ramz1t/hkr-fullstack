import { Suspense } from "react";
import { lazily } from "react-lazily";
import { Route, Routes } from "react-router-dom";
import { Navbar, ProtectedRoute } from "./components";
const { Login, Wallet, Games, CoinflipPage, Profile, Verify } = lazily(() => import("./pages"));

const App = () => {
  return (
    <>
      <Navbar />
      <div className="md:ml-nav max-md:mt-nav grow flex flex-col">
        <div className="grow flex flex-col">
          <Suspense>
            <Routes>
              <Route path="/" element={"homepage"} />
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/games" element={<Games />} />
                <Route path="/games/coinflip" element={<CoinflipPage />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={"change to NotFound"} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default App;
