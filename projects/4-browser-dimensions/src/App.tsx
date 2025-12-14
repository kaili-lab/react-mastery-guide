import { Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import PageOne from "./components/Page1";
import PageTwo from "./components/Page2";

function App() {
  return (
    <Routes>
      <Route path="app" element={<AppLayout />}>
        <Route path="page1" element={<PageOne />} />
        <Route path="page2" element={<PageTwo />} />
      </Route>
    </Routes>
  );
}

export default App;
