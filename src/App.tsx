import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "./components/layout/AppLayout"
import { RecommendationPage } from "./pages/RecommendationPage"
import { AdminPlansPage } from "./pages/admin/AdminPlansPage"
import { AdminTaxGroupsPage } from "./pages/admin/AdminTaxGroupsPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RecommendationPage />} />
          <Route path="/admin/tax-groups" element={<AdminTaxGroupsPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

