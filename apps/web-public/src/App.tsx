import { Suspense } from "react";
import { lazily } from "react-lazily";
import { Route, Routes } from "react-router-dom";
import { Navbar, ProtectedRoute } from "./components";
const { Login, Wallet } = lazily(() => import("./pages"));

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
                <Route path="/wallet" element={<Wallet />} />
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
