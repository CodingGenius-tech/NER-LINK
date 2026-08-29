import { createBrowserRouter } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RouteIntelligence from "./pages/RouteIntelligence";
import LiveNetwork from "./pages/LiveNetwork";
import OperationsPage from "./pages/OperationsPage";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  // =====================================================
  // LOGIN
  // =====================================================

  {
    path: "/",
    element: <Login />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  // =====================================================
  // PROTECTED APPLICATION
  // =====================================================

  {
    element: <ProtectedRoute />,

    children: [
      {
        element: <MainLayout />,

        children: [
          // ===============================================
          // DASHBOARD
          // ===============================================

          {
            path: "/dashboard",
            element: <Dashboard />,
          },

          // ===============================================
          // ROUTE INTELLIGENCE
          // ===============================================

          {
            path: "/route-intelligence",
            element: <RouteIntelligence />,
          },

          // ===============================================
          // LIVE NETWORK
          // ===============================================

          {
            path: "/live-network",
            element: <LiveNetwork />,
          },

          // ===============================================
          // OTHER OPERATIONS MODULES
          // ===============================================

          {
            path: "/fleet-tracking",
            element: (
              <OperationsPage module="fleet-tracking" />
            ),
          },

          {
            path: "/supply-chain",
            element: (
              <OperationsPage module="supply-chain" />
            ),
          },

          {
            path: "/risk-intelligence",
            element: (
              <OperationsPage module="risk-intelligence" />
            ),
          },

          {
            path: "/emergency-mode",
            element: (
              <OperationsPage module="emergency-mode" />
            ),
          },

          {
            path: "/field-reports",
            element: (
              <OperationsPage module="field-reports" />
            ),
          },

          {
            path: "/districts",
            element: (
              <OperationsPage module="districts" />
            ),
          },

          {
            path: "/notifications",
            element: (
              <OperationsPage module="notifications" />
            ),
          },
        ],
      },
    ],
  },

  // =====================================================
  // 404
  // =====================================================

  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;