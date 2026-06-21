import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import Myprojects from "./pages/Myprojects";
import Preview from "./pages/Preview";
import Community from "./pages/Community";
import View from "./pages/View";
import { Navbar } from "./components/Navbar";
const App = () => {
  const { pathname } = useLocation();

  const hideNavbar =
    (pathname.startsWith("/projects/") && pathname !== "/projects") ||
    pathname.startsWith("/view/") ||
    pathname.startsWith("/preview/");

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Pricing" element={<Pricing />} />
        <Route path="/Projects/:projectId" element={<Projects />} />
        <Route path="/Projects" element={<Myprojects />} />
        <Route path="/Preview/:projectId" element={<Preview />} />
        <Route path="/Preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/Community" element={<Community />} />
        <Route path="/view/:projectId" element={<View />} />
      </Routes>
    </div>
  );
};

export default App;
