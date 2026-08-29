import "./Dashboard.css";

function Dashboard() {
  const districts = [
    {
      name: "Tawang",
      accessibility: 72,
      risk: "Moderate",
      incidents: 3,
      supply: "Healthy",
      trend: "↗",
      trendType: "up",
    },
    {
      name: "West Kameng",
      accessibility: 41,
      risk: "High",
      incidents: 8,
      supply: "At Risk",
      trend: "↘",
      trendType: "down",
    },
    {
      name: "East Siang",
      accessibility: 86,
      risk: "Low",
      incidents: 1,
      supply: "Healthy",
      trend: "↗",
      trendType: "up",
    },
    {
      name: "Dima Hasao",
      accessibility: 58,
      risk: "Moderate",
      incidents: 5,
      supply: "Stable",
      trend: "→",
      trendType: "stable",
    },
    {
      name: "Dibrugarh",
      accessibility: 81,
      risk: "Low",
      incidents: 2,
      supply: "Healthy",
      trend: "↗",
      trendType: "up",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* =========================================
          TOP HEADER
      ========================================= */}

      <div className="dashboard-top">

        <div>
          <div className="dashboard-live-label">
            <span></span>
            LIVE INTELLIGENCE
          </div>

          <h1>NER Logistics Command Center</h1>

          <p>
            Real-time visibility across transportation networks,
            essential supplies and regional accessibility.
          </p>
        </div>

        <div className="dashboard-updated">
          <span className="pulse-dot"></span>
          Last updated 2 min ago
        </div>

      </div>


      {/* =========================================
          KPI CARDS
      ========================================= */}

      <section className="kpi-grid">

        <div className="kpi-card">
          <span>Network Accessibility</span>

          <div className="kpi-value">
            72%
            <small className="positive">+4.8%</small>
          </div>

          <div className="kpi-sub">
            Regional score
          </div>
        </div>


        <div className="kpi-card">
          <span>Active Disruptions</span>

          <div className="kpi-value">
            27
            <small className="negative">8 critical</small>
          </div>

          <div className="kpi-sub">
            Current incidents
          </div>
        </div>


        <div className="kpi-card">
          <span>Vehicles In Transit</span>

          <div className="kpi-value">
            248
            <small className="warning">31 delayed</small>
          </div>

          <div className="kpi-sub">
            Active fleet
          </div>
        </div>


        <div className="kpi-card">
          <span>High-Risk Corridors</span>

          <div className="kpi-value">
            14
            <small className="negative">6 increasing</small>
          </div>

          <div className="kpi-sub">
            Requires attention
          </div>
        </div>


        <div className="kpi-card">
          <span>On-Time Deliveries</span>

          <div className="kpi-value">
            94.2%
            <small className="positive">+2.1%</small>
          </div>

          <div className="kpi-sub">
            Last 24 hours
          </div>
        </div>

      </section>


      {/* =========================================
          MAP + SITUATION INTELLIGENCE
      ========================================= */}

      <section className="command-grid">

        {/* MAP */}

        <div className="map-panel">

          <div className="panel-header">

            <div>
              <span>REGIONAL ACCESSIBILITY</span>
              <h2>North Eastern Network</h2>
            </div>

            <div className="map-actions">
              <button>Layers</button>
              <button>Recenter</button>
            </div>

          </div>


          <div className="map-body">

            {/* FILTERS */}

            <div className="map-filters">

              <button className="selected">
                Accessibility
              </button>

              <button>
                Weather
              </button>

              <button>
                Traffic
              </button>

              <button>
                Risk
              </button>

            </div>


            {/* INDIA / NER STYLE MAP */}

            <div className="ner-map">

              <div className="map-grid"></div>

              <div className="map-label arunachal">
                ARUNACHAL
              </div>

              <div className="map-label assam">
                ASSAM
              </div>

              <div className="map-label meghalaya">
                MEGHALAYA
              </div>

              <div className="map-label nagaland">
                NAGALAND
              </div>

              <div className="map-label manipur">
                MANIPUR
              </div>

              <div className="map-label mizoram">
                MIZORAM
              </div>

              <div className="map-label tripura">
                TRIPURA
              </div>


              {/* ROUTES */}

              <div className="route route-one"></div>
              <div className="route route-two"></div>
              <div className="route route-three"></div>


              {/* VEHICLE MARKERS */}

              <div className="map-marker vehicle marker-one">
                ●
              </div>

              <div className="map-marker vehicle marker-two">
                ●
              </div>

              <div className="map-marker vehicle marker-three">
                ●
              </div>


              {/* RISK MARKERS */}

              <div className="map-marker risk risk-one">
                ⚠
              </div>

              <div className="map-marker risk risk-two">
                ⚠
              </div>

              <div className="map-marker risk risk-three">
                ⚠
              </div>

            </div>


            {/* MAP LEGEND */}

            <div className="map-legend">

              <span>
                <i className="legend-green"></i>
                Accessible
              </span>

              <span>
                <i className="legend-yellow"></i>
                Moderate
              </span>

              <span>
                <i className="legend-orange"></i>
                High Risk
              </span>

              <span>
                <i className="legend-red"></i>
                Blocked
              </span>

            </div>

          </div>

        </div>


        {/* SITUATION INTELLIGENCE */}

        <div className="intelligence-panel">

          <div className="panel-header">

            <div>
              <span>AI SYSTEM</span>
              <h2>Situation Intelligence</h2>
            </div>

            <button className="more-button">•••</button>

          </div>


          <div className="intelligence-content">

            <div className="prediction-tag">
              PREDICTED DISRUPTION
            </div>

            <div className="intelligence-time">
              08:24
            </div>

            <h3>NH-13</h3>

            <p className="location-name">
              Arunachal Pradesh
            </p>

            <div className="risk-percentage">
              78%
              <span>risk</span>
            </div>

            <div className="risk-progress">
              <div></div>
            </div>

            <div className="prediction-details">

              <div>
                <span>Expected within</span>
                <strong>6 hours</strong>
              </div>

              <p>
                Heavy rainfall + unstable terrain detected.
              </p>

            </div>


            <div className="intelligence-divider"></div>


            <div className="intelligence-alert">

              <div className="alert-icon">
                !
              </div>

              <div>
                <strong>Route monitoring required</strong>
                <span>
                  Consider alternate corridors for essential
                  supply movement.
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          LOWER ANALYTICS
      ========================================= */}

      <section className="analytics-grid">

        {/* ACCESSIBILITY CHART */}

        <div className="analytics-card accessibility-card">

          <div className="analytics-header">

            <div>
              <span>NETWORK ACCESSIBILITY</span>
              <h2>Regional Score</h2>
            </div>

            <small>
              Last 24 hours
            </small>

          </div>


          <div className="chart">

            <div className="chart-y">
              <span>100</span>
              <span>80</span>
              <span>65</span>
              <span>50</span>
            </div>

            <div className="chart-area">

              <div className="chart-line"></div>

              <div className="chart-point p1"></div>
              <div className="chart-point p2"></div>
              <div className="chart-point p3"></div>
              <div className="chart-point p4"></div>
              <div className="chart-point p5"></div>
              <div className="chart-point p6"></div>

              <div className="chart-x">
                <span>00:00</span>
                <span>03:00</span>
                <span>06:00</span>
                <span>09:00</span>
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00</span>
                <span>21:00</span>
              </div>

            </div>

          </div>

        </div>


        {/* RISK FORECAST */}

        <div className="analytics-card">

          <div className="analytics-header">
            <div>
              <span>RISK FORECAST</span>
              <h2>Current exposure</h2>
            </div>
          </div>


          <div className="risk-list">

            <div className="risk-row">
              <div>
                <span>Landslide</span>
                <div className="risk-bar">
                  <i style={{ width: "78%" }}></i>
                </div>
              </div>
              <strong>78%</strong>
            </div>


            <div className="risk-row">
              <div>
                <span>Flood</span>
                <div className="risk-bar">
                  <i style={{ width: "62%" }}></i>
                </div>
              </div>
              <strong>62%</strong>
            </div>


            <div className="risk-row">
              <div>
                <span>Road Damage</span>
                <div className="risk-bar">
                  <i style={{ width: "31%" }}></i>
                </div>
              </div>
              <strong>31%</strong>
            </div>


            <div className="risk-row">
              <div>
                <span>Heavy Rain</span>
                <div className="risk-bar">
                  <i style={{ width: "24%" }}></i>
                </div>
              </div>
              <strong>24%</strong>
            </div>


            <div className="risk-row">
              <div>
                <span>Traffic</span>
                <div className="risk-bar">
                  <i style={{ width: "18%" }}></i>
                </div>
              </div>
              <strong>18%</strong>
            </div>

          </div>

        </div>


        {/* SUPPLY PRIORITY */}

        <div className="analytics-card">

          <div className="analytics-header">

            <div>
              <span>SUPPLY PRIORITY</span>
              <h2>Regional demand</h2>
            </div>

          </div>


          <div className="supply-list">

            <div className="supply-item">
              <div className="supply-icon">◇</div>

              <div>
                <strong>Medicines</strong>
                <span>Regional demand</span>
              </div>

              <b className="supply-high">High</b>
            </div>


            <div className="supply-item">
              <div className="supply-icon">◇</div>

              <div>
                <strong>Food Supplies</strong>
                <span>Regional demand</span>
              </div>

              <b className="supply-normal">Normal</b>
            </div>


            <div className="supply-item">
              <div className="supply-icon">◇</div>

              <div>
                <strong>Construction</strong>
                <span>Regional demand</span>
              </div>

              <b className="supply-medium">Medium</b>
            </div>


            <div className="supply-item">
              <div className="supply-icon">◇</div>

              <div>
                <strong>Agriculture</strong>
                <span>Regional demand</span>
              </div>

              <b className="supply-normal">Normal</b>
            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          DISTRICT INTELLIGENCE
      ========================================= */}

      <section className="district-panel">

        <div className="district-header">

          <div>
            <span>DISTRICT INTELLIGENCE</span>

            <h2>
              Regional Connectivity
            </h2>

            <p>
              Connectivity status across monitored districts
            </p>
          </div>

          <button>
            View all districts
            <span>→</span>
          </button>

        </div>


        <div className="district-table">

          <div className="district-table-head">
            <span>District</span>
            <span>Accessibility</span>
            <span>Risk</span>
            <span>Incidents</span>
            <span>Supply</span>
            <span>Trend</span>
          </div>


          {districts.map((district) => (

            <div
              className="district-row"
              key={district.name}
            >

              <strong>
                {district.name}
              </strong>


              <div className="accessibility-cell">

                <span>
                  {district.accessibility}
                </span>

                <div>
                  <i
                    style={{
                      width: `${district.accessibility}%`,
                    }}
                  ></i>
                </div>

              </div>


              <span
                className={`risk-badge ${district.risk
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {district.risk}
              </span>


              <span className="incident-count">
                {district.incidents}
              </span>


              <span
                className={`supply-status ${
                  district.supply === "At Risk"
                    ? "at-risk"
                    : district.supply === "Stable"
                    ? "stable"
                    : "healthy"
                }`}
              >
                {district.supply}
              </span>


              <span
                className={`trend ${district.trendType}`}
              >
                {district.trend}
              </span>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;