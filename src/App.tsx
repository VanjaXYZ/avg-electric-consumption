import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "next-themes"
import { RequireAdmin } from "./components/auth/RequireAdmin"
import { AppLayout } from "./components/layout/AppLayout"
import { Toaster } from "./components/ui/sonner"
import { LoginPage } from "./pages/LoginPage"
import { RecommendationPage } from "./pages/RecommendationPage"
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage"
import { AdminPlansPage } from "./pages/admin/AdminPlansPage"
import { AdminTaxGroupsPage } from "./pages/admin/AdminTaxGroupsPage"

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<RecommendationPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin/tax-groups" element={<AdminTaxGroupsPage />} />
              <Route path="/admin/plans" element={<AdminPlansPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

