import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Alerts from "./pages/Alerts";
import Jobs from "./pages/Jobs";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:skuId" element={<ProductDetail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="jobs" element={<Jobs />} />
      </Route>
    </Routes>
  );
}
