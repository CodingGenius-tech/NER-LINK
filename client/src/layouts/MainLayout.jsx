import { Outlet, NavLink } from "react-router-dom";

import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="app-shell">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">
            NER
          </div>

          <div>
            <h2>Logistics</h2>
            <span>Intelligence</span>
          </div>
        </div>

        <div className="menu-title">
          PLATFORM
        </div>

        <nav className="sidebar-menu">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>◉</span>
            Command Center
          </NavLink>

          <NavLink
            to="/live-network"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>○</span>
            Live Network
          </NavLink>

          <NavLink
            to="/route-intelligence"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>⌁</span>
            Route Intelligence
          </NavLink>

          <NavLink
            to="/fleet-tracking"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>▣</span>
            Fleet Tracking
          </NavLink>

          <NavLink
            to="/supply-chain"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>◈</span>
            Supply Chain
          </NavLink>

          <NavLink
            to="/risk-intelligence"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>⚠</span>
            Risk Intelligence
          </NavLink>

          <NavLink
            to="/emergency-mode"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>◉</span>
            Emergency Mode
          </NavLink>

          <NavLink
            to="/field-reports"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>¤</span>
            Field Reports
          </NavLink>

          <NavLink
            to="/districts"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>⌖</span>
            Districts
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <span>♧</span>
            Notifications
          </NavLink>

        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>
            System Operational
          </div>
        </div>

      </aside>


      {/* ========================================
          APPLICATION AREA
      ======================================== */}

      <div className="app-main">

        <header className="main-header">

          <div className="main-brand">
            <h2>NER-LINK</h2>

            <span>
              Logistics Intelligence
            </span>
          </div>

        </header>

        <main className="main-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;