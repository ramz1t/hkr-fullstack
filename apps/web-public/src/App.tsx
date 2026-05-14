import { Suspense } from "react";
import { lazily } from "react-lazily";
import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components";
const { Login } = lazily(() => import("./pages"));

const App = () => {
  return (
    <>
      <Navbar />
      <div className="md:ml-nav max-md:mt-nav grow flex flex-col">
        <div className="grow flex flex-col">
          <Suspense>
            <Routes>
              <Route path="/" element={"go to /login to auth"} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={"change to NotFound"} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default App;
