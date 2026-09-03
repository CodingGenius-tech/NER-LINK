import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getRoads } from "../services/road.service";
import { getDistricts } from "../services/district.service";
import { getVehicles } from "../services/vehicle.service";
import { getAlerts } from "../services/alert.service";
import { getDeliveries } from "../services/delivery.service";
import {
  getRoutePredictions,
} from "../services/routePrediction.service";

import {
  getIncidents,
} from "../services/incident.service";

import "./Dashboard.css";

/* =========================================================
   HELPERS
========================================================= */

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getResponseArray = (response) => {
  return safeArray(response?.data);
};

const normalize = (value) => {
  return String(value || "").trim().toUpperCase();
};

const formatPercent = (value) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  const number = Number(value);

  if (number <= 1) {
    return `${Math.round(number * 100)}%`;
  }

  return `${Math.round(number)}%`;
};

const getRiskNumber = (prediction) => {
  const raw =
    prediction?.risk_score ??
    prediction?.risk_percentage ??
    prediction?.risk_probability ??
    prediction?.probability ??
    prediction?.risk;

  if (
    raw === null ||
    raw === undefined ||
    raw === ""
  ) {
    return null;
  }

  const number = Number(raw);

  if (Number.isNaN(number)) {
    return null;
  }

  return number <= 1
    ? number * 100
    : number;
};

const getPredictionName = (prediction) => {
  return (
    prediction?.road_name ||
    prediction?.route_name ||
    prediction?.road?.name ||
    prediction?.route?.name ||
    prediction?.name ||
    `Prediction #${prediction?.id || "—"}`
  );
};

const getPredictionLocation = (prediction) => {
  return (
    prediction?.district_name ||
    prediction?.district ||
    prediction?.location ||
    prediction?.region ||
    prediction?.state ||
    "Location unavailable"
  );
};

const getPredictionReason = (prediction) => {
  return (
    prediction?.prediction_reason ||
    prediction?.reason ||
    prediction?.risk_reason ||
    prediction?.description ||
    prediction?.cause ||
    prediction?.prediction_type ||
    prediction?.risk_type ||
    "AI route risk prediction"
  );
};

const getPredictionTime = (prediction) => {
  return (
    prediction?.predicted_at ||
    prediction?.prediction_time ||
    prediction?.created_at ||
    prediction?.updated_at ||
    null
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return "Time unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
};

const getStatusClass = (status) => {
  const value = normalize(status);

  if (
    [
      "ACCESSIBLE",
      "CONNECTED",
      "GOOD",
      "OPEN",
      "EXCELLENT",
      "DELIVERED",
      "ON_TIME",
      "ACTIVE",
      "LOW",
    ].includes(value)
  ) {
    return "status-good";
  }

  if (
    [
      "MODERATE",
      "MEDIUM",
      "PLANNED",
      "IN_TRANSIT",
      "NORMAL",
    ].includes(value)
  ) {
    return "status-medium";
  }

  if (
    [
      "HIGH",
      "CRITICAL",
      "BLOCKED",
      "DELAYED",
      "AT_RISK",
    ].includes(value)
  ) {
    return "status-danger";
  }

  return "status-neutral";
};

/* =========================================================
   COMPONENT
========================================================= */

function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [roads, setRoads] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [activeLayer, setActiveLayer] =
    useState("accessibility");

  const [showLayers, setShowLayers] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [dataError, setDataError] =
    useState("");

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  const loadDashboardData = async (
    showRefresh = false
  ) => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setDataError("");

    try {
      const results =
        await Promise.allSettled([
          getRoads(token),
          getDistricts(token),
          getVehicles(token),
          getAlerts(token),
          getDeliveries(token),
          getRoutePredictions(token),
          getIncidents(token),
        ]);

      const [
        roadsResult,
        districtsResult,
        vehiclesResult,
        alertsResult,
        deliveriesResult,
        predictionsResult,
        incidentsResult,
      ] = results;

      if (
        roadsResult.status ===
        "fulfilled"
      ) {
        setRoads(
          getResponseArray(
            roadsResult.value
          )
        );
      } else {
        setRoads([]);
      }

      if (
        districtsResult.status ===
        "fulfilled"
      ) {
        setDistricts(
          getResponseArray(
            districtsResult.value
          )
        );
      } else {
        setDistricts([]);
      }

      if (
        vehiclesResult.status ===
        "fulfilled"
      ) {
        setVehicles(
          getResponseArray(
            vehiclesResult.value
          )
        );
      } else {
        setVehicles([]);
      }

      if (
        alertsResult.status ===
        "fulfilled"
      ) {
        setAlerts(
          getResponseArray(
            alertsResult.value
          )
        );
      } else {
        setAlerts([]);
      }

      if (
        deliveriesResult.status ===
        "fulfilled"
      ) {
        setDeliveries(
          getResponseArray(
            deliveriesResult.value
          )
        );
      } else {
        setDeliveries([]);
      }

      if (
        predictionsResult.status ===
        "fulfilled"
      ) {
        setPredictions(
          getResponseArray(
            predictionsResult.value
          )
        );
      } else {
        setPredictions([]);
      }

      if (
        incidentsResult.status ===
        "fulfilled"
      ) {
        setIncidents(
          getResponseArray(
            incidentsResult.value
          )
        );
      } else {
        setIncidents([]);
      }

      const failedSources =
        results.filter(
          (result) =>
            result.status ===
            "rejected"
        ).length;

      if (failedSources > 0) {
        setDataError(
          `${failedSources} data source${
            failedSources > 1
              ? "s"
              : ""
          } unavailable`
        );
      }
    } catch (error) {
      console.error(
        "Dashboard loading failed:",
        error
      );

      setDataError(
        error?.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (cancelled) {
        return;
      }

      await loadDashboardData(false);
    };

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* =========================================================
     AUTO REFRESH
  ========================================================= */

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [token]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const activeAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        !Boolean(
          alert?.is_resolved
        )
    );
  }, [alerts]);

  const criticalAlerts = useMemo(() => {
    return activeAlerts.filter(
      (alert) => {
        const severity =
          normalize(
            alert?.severity
          );

        return (
          severity === "CRITICAL"
        );
      }
    );
  }, [activeAlerts]);

  const highRiskRoads = useMemo(() => {
    return roads.filter(
      (road) => {
        const risk =
          normalize(
            road?.risk_level
          );

        return (
          risk === "HIGH" ||
          risk === "CRITICAL"
        );
      }
    );
  }, [roads]);

  const blockedRoads = useMemo(() => {
    return roads.filter(
      (road) => {
        const status =
          normalize(
            road?.current_status ||
              road?.status
          );

        return (
          status === "BLOCKED" ||
          status === "CLOSED" ||
          status === "INACCESSIBLE"
        );
      }
    );
  }, [roads]);

  const accessibleDistricts = useMemo(() => {
    const accessibleStatuses = [
      "ACCESSIBLE",
      "CONNECTED",
      "GOOD",
      "OPEN",
      "EXCELLENT",
    ];

    return districts.filter(
      (district) =>
        accessibleStatuses.includes(
          normalize(
            district?.connectivity_status
          )
        )
    );
  }, [districts]);

  const inTransitVehicles = useMemo(() => {
    const transitStatuses = [
      "IN_TRANSIT",
      "ACTIVE",
      "MOVING",
      "ON_ROUTE",
    ];

    return vehicles.filter(
      (vehicle) =>
        transitStatuses.includes(
          normalize(
            vehicle?.status
          )
        )
    );
  }, [vehicles]);

  const delayedVehicles = useMemo(() => {
    return vehicles.filter(
      (vehicle) =>
        normalize(
          vehicle?.status
        ).includes("DELAY")
    );
  }, [vehicles]);

  /* =========================================================
     KPI: NETWORK ACCESSIBILITY
  ========================================================= */

  const networkAccessibility = useMemo(() => {
    if (!districts.length) {
      return null;
    }

    return Math.round(
      (accessibleDistricts.length /
        districts.length) *
        100
    );
  }, [
    districts,
    accessibleDistricts,
  ]);

  /* =========================================================
     KPI: ON-TIME DELIVERY
  ========================================================= */

  const onTimeDeliveryRate = useMemo(() => {
    if (!deliveries.length) {
      return null;
    }

    const evaluated =
      deliveries.filter(
        (delivery) => {
          if (
            typeof delivery?.is_on_time ===
            "boolean"
          ) {
            return true;
          }

          const status =
            normalize(
              delivery?.status
            );

          if (
            status === "ON_TIME"
          ) {
            return true;
          }

          const expected =
            delivery?.expected_delivery_at;

          const actual =
            delivery?.delivered_at ||
            delivery?.actual_delivery_at ||
            delivery?.completed_at;

          if (!expected || !actual) {
            return false;
          }

          const expectedDate =
            new Date(expected);

          const actualDate =
            new Date(actual);

          return (
            !Number.isNaN(
              expectedDate.getTime()
            ) &&
            !Number.isNaN(
              actualDate.getTime()
            )
          );
        }
      );

    if (!evaluated.length) {
      return null;
    }

    const onTime =
      evaluated.filter(
        (delivery) => {
          if (
            typeof delivery?.is_on_time ===
            "boolean"
          ) {
            return delivery.is_on_time;
          }

          if (
            normalize(
              delivery?.status
            ) === "ON_TIME"
          ) {
            return true;
          }

          const expected =
            new Date(
              delivery.expected_delivery_at
            ).getTime();

          const actual =
            new Date(
              delivery.delivered_at ||
                delivery.actual_delivery_at ||
                delivery.completed_at
            ).getTime();

          return actual <= expected;
        }
      ).length;

    return Math.round(
      (onTime /
        evaluated.length) *
        100
    );
  }, [deliveries]);

  /* =========================================================
     SITUATION INTELLIGENCE
  ========================================================= */

  const topPrediction = useMemo(() => {
    if (!predictions.length) {
      return null;
    }

    const sorted = [
      ...predictions,
    ].sort((a, b) => {
      const riskA =
        getRiskNumber(a) ?? -1;

      const riskB =
        getRiskNumber(b) ?? -1;

      return riskB - riskA;
    });

    return sorted[0];
  }, [predictions]);

  const topPredictionRisk = useMemo(() => {
    return getRiskNumber(
      topPrediction
    );
  }, [topPrediction]);

  const latestAlert = useMemo(() => {
    if (!activeAlerts.length) {
      return null;
    }

    const sorted = [
      ...activeAlerts,
    ].sort((a, b) => {
      const aTime = new Date(
        a?.created_at ||
          a?.updated_at ||
          0
      ).getTime();

      const bTime = new Date(
        b?.created_at ||
          b?.updated_at ||
          0
      ).getTime();

      return bTime - aTime;
    });

    return sorted[0];
  }, [activeAlerts]);

  /* =========================================================
     RISK FORECAST
  ========================================================= */

  const riskForecast = useMemo(() => {
    const categories = [
      {
        label: "Predicted Route Risk",
        key: "prediction",
      },
      {
        label: "Critical Alerts",
        key: "critical",
      },
      {
        label: "High-Risk Roads",
        key: "roads",
      },
      {
        label: "Blocked Roads",
        key: "blocked",
      },
    ];

    return categories.map(
      (category) => {
        let percentage = 0;

        if (
          category.key ===
          "prediction"
        ) {
          percentage =
            topPredictionRisk || 0;
        }

        if (
          category.key ===
          "critical"
        ) {
          percentage =
            alerts.length
              ? Math.min(
                  100,
                  Math.round(
                    (criticalAlerts.length /
                      alerts.length) *
                      100
                  )
                )
              : 0;
        }

        if (
          category.key ===
          "roads"
        ) {
          percentage =
            roads.length
              ? Math.min(
                  100,
                  Math.round(
                    (highRiskRoads.length /
                      roads.length) *
                      100
                  )
                )
              : 0;
        }

        if (
          category.key ===
          "blocked"
        ) {
          percentage =
            roads.length
              ? Math.min(
                  100,
                  Math.round(
                    (blockedRoads.length /
                      roads.length) *
                      100
                  )
                )
              : 0;
        }

        return {
          ...category,
          percentage,
        };
      }
    );
  }, [
    alerts,
    criticalAlerts,
    roads,
    highRiskRoads,
    blockedRoads,
    topPredictionRisk,
  ]);

  /* =========================================================
     SUPPLY PRIORITY
  ========================================================= */

  const supplyPriority = useMemo(() => {
    if (!deliveries.length) {
      return [];
    }

    const groups = {};

    deliveries.forEach(
      (delivery) => {
        const commodity =
          delivery?.commodity_type ||
          delivery?.commodity ||
          "Other Supplies";

        const key =
          String(commodity);

        if (!groups[key]) {
          groups[key] = {
            name: key,
            total: 0,
            high: 0,
            delayed: 0,
            inTransit: 0,
          };
        }

        groups[key].total += 1;

        if (
          [
            "HIGH",
            "CRITICAL",
            "URGENT",
          ].includes(
            normalize(
              delivery?.priority
            )
          )
        ) {
          groups[key].high += 1;
        }

        const status =
          normalize(
            delivery?.status
          );

        if (
          status === "DELAYED"
        ) {
          groups[key].delayed += 1;
        }

        if (
          status === "IN_TRANSIT"
        ) {
          groups[key].inTransit += 1;
        }
      }
    );

    return Object.values(groups)
      .sort((a, b) => {
        if (b.high !== a.high) {
          return b.high - a.high;
        }

        return b.total - a.total;
      })
      .slice(0, 4)
      .map((item) => {
        let priority = "Normal";

        if (
          item.high > 0 ||
          item.delayed > 0
        ) {
          priority = "High";
        } else if (
          item.inTransit > 0
        ) {
          priority = "Medium";
        }

        return {
          ...item,
          priority,
        };
      });
  }, [deliveries]);

  /* =========================================================
     DISTRICT INTELLIGENCE
  ========================================================= */

  const districtRows = useMemo(() => {
    if (!districts.length) {
      return [];
    }

    return districts
      .map((district) => {
        const districtName =
          district?.name ||
          district?.district_name ||
          `District #${district?.id || "—"}`;

        const status =
          normalize(
            district?.connectivity_status
          ) || "UNKNOWN";

        const accessibility =
          [
            "ACCESSIBLE",
            "CONNECTED",
            "GOOD",
            "OPEN",
            "EXCELLENT",
          ].includes(status)
            ? 100
            : [
                "MODERATE",
                "PARTIAL",
              ].includes(status)
            ? 60
            : [
                "HIGH_RISK",
                "RESTRICTED",
              ].includes(status)
            ? 35
            : [
                "BLOCKED",
                "INACCESSIBLE",
              ].includes(status)
            ? 0
            : null;

        const districtAlerts =
          activeAlerts.filter(
            (alert) => {
              const alertDistrict =
                String(
                  alert?.district_name ||
                    alert?.district ||
                    ""
                ).toLowerCase();

              return (
                alertDistrict &&
                alertDistrict ===
                  String(
                    districtName
                  ).toLowerCase()
              );
            }
          );

        const districtIncidents =
          incidents.filter(
            (incident) => {
              const incidentDistrict =
                String(
                  incident?.district_name ||
                    incident?.district ||
                    ""
                ).toLowerCase();

              return (
                incidentDistrict &&
                incidentDistrict ===
                  String(
                    districtName
                  ).toLowerCase()
              );
            }
          );

        let risk = "Low";

        if (
          districtAlerts.some(
            (alert) =>
              normalize(
                alert?.severity
              ) === "CRITICAL"
          )
        ) {
          risk = "Critical";
        } else if (
          districtAlerts.length >
            0 ||
          districtIncidents.some(
            (incident) =>
              [
                "HIGH",
                "CRITICAL",
              ].includes(
                normalize(
                  incident?.severity
                )
              )
          )
        ) {
          risk = "High";
        } else if (
          status === "MODERATE" ||
          status === "PARTIAL"
        ) {
          risk = "Moderate";
        }

        const supply =
          deliveries.filter(
            (delivery) => {
              const destination =
                String(
                  delivery?.destination ||
                    ""
                ).toLowerCase();

              return (
                destination.includes(
                  String(
                    districtName
                  ).toLowerCase()
                )
              );
            }
          );

        const delayedSupply =
          supply.filter(
            (delivery) =>
              normalize(
                delivery?.status
              ) === "DELAYED"
          ).length;

        let supplyStatus =
          "Healthy";

        if (
          delayedSupply > 0
        ) {
          supplyStatus =
            "At Risk";
        } else if (
          supply.length === 0
        ) {
          supplyStatus =
            "No Data";
        }

        return {
          id:
            district?.id ||
            districtName,
          name: districtName,
          accessibility,
          status,
          risk,
          incidents:
            districtIncidents.length +
            districtAlerts.length,
          supply:
            supplyStatus,
        };
      })
      .sort((a, b) => {
        const riskOrder = {
          Critical: 4,
          High: 3,
          Moderate: 2,
          Low: 1,
        };

        return (
          (riskOrder[b.risk] || 0) -
          (riskOrder[a.risk] || 0)
        );
      })
      .slice(0, 6);
  }, [
    districts,
    activeAlerts,
    incidents,
    deliveries,
  ]);

  /* =========================================================
     MAP
  ========================================================= */

  const handleLayerChange = (
    layer
  ) => {
    setActiveLayer(layer);
    setShowLayers(false);
  };

  const handleRecenter = () => {
    const map =
      document.querySelector(
        ".ner-map"
      );

    if (!map) {
      return;
    }

    map.classList.remove(
      "map-recenter-animation"
    );

    void map.offsetWidth;

    map.classList.add(
      "map-recenter-animation"
    );
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const goTo = (path) => {
    navigate(path);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dashboard-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dashboard-top">

        <div>
          <div className="dashboard-live-label">
            <span></span>
            LIVE INTELLIGENCE
          </div>

          <h1>
            NER Logistics Command Center
          </h1>

          <p>
            Real-time visibility across
            transportation networks,
            essential supplies and regional
            accessibility.
          </p>
        </div>

        <div className="dashboard-updated">

          <span className="pulse-dot"></span>

          {loading
            ? "Loading live data..."
            : refreshing
            ? "Refreshing live data..."
            : dataError
            ? dataError
            : "Live database data"}

          <button
            type="button"
            className="dashboard-refresh"
            onClick={() =>
              loadDashboardData(true)
            }
            disabled={
              refreshing
            }
          >
            {refreshing
              ? "↻"
              : "Refresh"}
          </button>

        </div>

      </div>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="kpi-grid">

        <button
          type="button"
          className="kpi-card kpi-clickable"
          onClick={() =>
            goTo("/districts")
          }
        >
          <span>
            Network Accessibility
          </span>

          <div className="kpi-value">
            {loading
              ? "—"
              : formatPercent(
                  networkAccessibility
                )}
          </div>

          <div className="kpi-sub">
            {districts.length} monitored
            districts
          </div>
        </button>

        <button
          type="button"
          className="kpi-card kpi-clickable"
          onClick={() =>
            goTo(
              "/risk-intelligence"
            )
          }
        >
          <span>
            Active Disruptions
          </span>

          <div className="kpi-value">
            {loading
              ? "—"
              : activeAlerts.length}
          </div>

          <div className="kpi-sub negative">
            {criticalAlerts.length} critical
          </div>
        </button>

        <button
          type="button"
          className="kpi-card kpi-clickable"
          onClick={() =>
            goTo("/fleet-tracking")
          }
        >
          <span>
            Vehicles In Transit
          </span>

          <div className="kpi-value">
            {loading
              ? "—"
              : inTransitVehicles.length}
          </div>

          <div className="kpi-sub warning">
            {delayedVehicles.length} delayed
          </div>
        </button>

        <button
          type="button"
          className="kpi-card kpi-clickable"
          onClick={() =>
            goTo(
              "/risk-intelligence"
            )
          }
        >
          <span>
            High-Risk Corridors
          </span>

          <div className="kpi-value">
            {loading
              ? "—"
              : highRiskRoads.length}
          </div>

          <div className="kpi-sub negative">
            {blockedRoads.length} blocked
          </div>
        </button>

        <button
          type="button"
          className="kpi-card kpi-clickable"
          onClick={() =>
            goTo("/supply-chain")
          }
        >
          <span>
            On-Time Deliveries
          </span>

          <div className="kpi-value">
            {loading
              ? "—"
              : formatPercent(
                  onTimeDeliveryRate
                )}
          </div>

          <div className="kpi-sub positive">
            {deliveries.length
              ? `${deliveries.length} delivery records`
              : "No timing data"}
          </div>
        </button>

      </section>

      {/* =====================================================
          COMMAND GRID
      ===================================================== */}

      <section className="command-grid">

        {/* ===================================================
            REGIONAL MAP
        =================================================== */}

        <div className="map-panel">

          <div className="panel-header">

            <div>
              <span>
                REGIONAL ACCESSIBILITY
              </span>

              <h2>
                North Eastern Network
              </h2>
            </div>

            <div className="map-actions">

              <button
                type="button"
                className={
                  showLayers
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setShowLayers(
                    (previous) =>
                      !previous
                  )
                }
              >
                Layers
              </button>

              <button
                type="button"
                onClick={
                  handleRecenter
                }
              >
                Recenter
              </button>

            </div>

          </div>

          <div className="map-body">

            <div className="map-filters">

              {[
                [
                  "accessibility",
                  "Accessibility",
                ],
                [
                  "weather",
                  "Weather",
                ],
                [
                  "traffic",
                  "Traffic",
                ],
                [
                  "risk",
                  "Risk",
                ],
              ].map(
                ([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    className={
                      activeLayer ===
                      key
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      handleLayerChange(
                        key
                      )
                    }
                  >
                    <span className="filter-dot"></span>
                    {label}
                  </button>
                )
              )}

            </div>

            {showLayers && (
              <div className="dashboard-layers-popup">

                <div className="dashboard-layers-title">
                  MAP LAYERS
                </div>

                {[
                  [
                    "accessibility",
                    "Accessibility",
                  ],
                  [
                    "weather",
                    "Weather",
                  ],
                  [
                    "traffic",
                    "Traffic",
                  ],
                  [
                    "risk",
                    "Risk",
                  ],
                ].map(
                  ([key, label]) => (
                    <button
                      type="button"
                      key={key}
                      className={
                        activeLayer ===
                        key
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        handleLayerChange(
                          key
                        )
                      }
                    >
                      <span className="layer-check">
                        {activeLayer ===
                        key
                          ? "✓"
                          : ""}
                      </span>

                      {label}
                    </button>
                  )
                )}

              </div>
            )}

            <div
              className={`ner-map active-${activeLayer}`}
            >

              <div className="map-grid"></div>

              <div className="ner-region-shape"></div>

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

              {activeLayer ===
                "accessibility" && (
                <>
                  <div className="route route-one"></div>
                  <div className="route route-two"></div>
                  <div className="route route-three"></div>

                  <div className="map-marker vehicle marker-one">
                    ●
                  </div>

                  <div className="map-marker vehicle marker-two">
                    ●
                  </div>

                  <div className="map-marker vehicle marker-three">
                    ●
                  </div>
                </>
              )}

              {activeLayer ===
                "weather" && (
                <>
                  <div className="weather-zone weather-one">
                    <span>
                      WEATHER RISK
                    </span>
                  </div>

                  <div className="weather-zone weather-two">
                    <span>
                      RAIN
                    </span>
                  </div>

                  <div className="weather-zone weather-three">
                    <span>
                      CLOUD
                    </span>
                  </div>
                </>
              )}

              {activeLayer ===
                "traffic" && (
                <>
                  <div className="traffic-route traffic-one"></div>
                  <div className="traffic-route traffic-two"></div>
                  <div className="traffic-route traffic-three"></div>

                  <div className="traffic-point traffic-point-one">
                    HIGH
                  </div>

                  <div className="traffic-point traffic-point-two">
                    MED
                  </div>

                  <div className="traffic-point traffic-point-three">
                    HIGH
                  </div>
                </>
              )}

              {activeLayer ===
                "risk" && (
                <>
                  <div className="risk-zone risk-zone-one">
                    <span>
                      HIGH RISK
                    </span>
                  </div>

                  <div className="risk-zone risk-zone-two">
                    <span>
                      DISRUPTION
                    </span>
                  </div>

                  <div className="risk-zone risk-zone-three">
                    <span>
                      ROAD RISK
                    </span>
                  </div>

                  <div className="map-marker risk risk-one">
                    ⚠
                  </div>

                  <div className="map-marker risk risk-two">
                    ⚠
                  </div>

                  <div className="map-marker risk risk-three">
                    ⚠
                  </div>
                </>
              )}

            </div>

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

        {/* ===================================================
            SITUATION INTELLIGENCE
        =================================================== */}

        <div
          className="intelligence-panel intelligence-clickable"
          onClick={() =>
            goTo(
              "/route-intelligence"
            )
          }
        >

          <div className="panel-header">

            <div>
              <span>
                AI SYSTEM
              </span>

              <h2>
                Situation Intelligence
              </h2>
            </div>

            <button
              type="button"
              className="more-button"
              onClick={(event) => {
                event.stopPropagation();

                goTo(
                  "/route-intelligence"
                );
              }}
            >
              •••
            </button>

          </div>

          <div className="intelligence-content">

            {topPrediction ? (
              <>
                <div className="prediction-tag">
                  PREDICTED DISRUPTION
                </div>

                <div className="intelligence-time">
                  {formatDateTime(
                    getPredictionTime(
                      topPrediction
                    )
                  )}
                </div>

                <h3>
                  {getPredictionName(
                    topPrediction
                  )}
                </h3>

                <p className="location-name">
                  {getPredictionLocation(
                    topPrediction
                  )}
                </p>

                <div className="risk-percentage">
                  {formatPercent(
                    topPredictionRisk
                  )}

                  <span>
                    risk
                  </span>
                </div>

                <div className="risk-progress">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          topPredictionRisk ||
                            0
                        )
                      )}%`,
                    }}
                  ></div>
                </div>

                <div className="prediction-details">

                  <div>
                    <span>
                      Prediction type
                    </span>

                    <strong>
                      {topPrediction?.prediction_type ||
                        topPrediction?.risk_type ||
                        "Route risk"}
                    </strong>
                  </div>

                  <p>
                    {getPredictionReason(
                      topPrediction
                    )}
                  </p>

                </div>

                <div className="intelligence-divider"></div>

                <div className="intelligence-alert">

                  <div className="alert-icon">
                    !
                  </div>

                  <div>

                    <strong>
                      Route monitoring required
                    </strong>

                    <span>
                      {latestAlert
                        ? latestAlert?.title ||
                          latestAlert?.message ||
                          "Active operational alert detected."
                        : "Review route intelligence for alternate corridor planning."}
                    </span>

                  </div>

                </div>
              </>
            ) : latestAlert ? (
              <>
                <div className="prediction-tag">
                  ACTIVE OPERATIONAL ALERT
                </div>

                <div className="intelligence-time">
                  {formatDateTime(
                    latestAlert?.created_at ||
                      latestAlert?.updated_at
                  )}
                </div>

                <h3>
                  {latestAlert?.title ||
                    "Active Alert"}
                </h3>

                <p className="location-name">
                  {latestAlert?.road_name ||
                    latestAlert?.district_name ||
                    "Location unavailable"}
                </p>

                <div className="risk-percentage">
                  {normalize(
                    latestAlert?.severity
                  ) || "ALERT"}

                  <span>
                    severity
                  </span>
                </div>

                <div className="prediction-details">
                  <p>
                    {latestAlert?.message ||
                      latestAlert?.description ||
                      "Active disruption requires operational review."}
                  </p>
                </div>

                <div className="intelligence-divider"></div>

                <div className="intelligence-alert">

                  <div className="alert-icon">
                    !
                  </div>

                  <div>

                    <strong>
                      Route monitoring required
                    </strong>

                    <span>
                      Open Risk Intelligence
                      for active disruption
                      details.
                    </span>

                  </div>

                </div>
              </>
            ) : (
              <div className="dashboard-empty-intelligence">

                <div className="prediction-tag">
                  AI SYSTEM
                </div>

                <h3>
                  No active prediction
                </h3>

                <p>
                  No route risk prediction or
                  active alert is currently
                  available from the database.
                </p>

              </div>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <section className="analytics-grid">

        {/* REGIONAL SCORE */}

        <div className="analytics-card accessibility-card">

          <div className="analytics-header">

            <div>
              <span>
                NETWORK ACCESSIBILITY
              </span>

              <h2>
                Regional Score
              </h2>
            </div>

            <small>
              {districts.length
                ? `${accessibleDistricts.length}/${districts.length} accessible`
                : "No data"}
            </small>

          </div>

          <div className="district-score-list">

            {districts
              .slice(0, 6)
              .map((district) => {
                const status =
                  normalize(
                    district?.connectivity_status
                  );

                const accessible =
                  [
                    "ACCESSIBLE",
                    "CONNECTED",
                    "GOOD",
                    "OPEN",
                    "EXCELLENT",
                  ].includes(status);

                const score =
                  accessible
                    ? 100
                    : [
                        "MODERATE",
                        "PARTIAL",
                      ].includes(status)
                    ? 60
                    : [
                        "BLOCKED",
                        "INACCESSIBLE",
                      ].includes(status)
                    ? 0
                    : 40;

                return (
                  <div
                    className="district-score-row"
                    key={
                      district?.id ||
                      district?.name
                    }
                  >
                    <div>
                      <span>
                        {district?.name ||
                          "District"}
                      </span>

                      <small>
                        {status ||
                          "UNKNOWN"}
                      </small>
                    </div>

                    <div className="district-score-bar">
                      <i
                        style={{
                          width: `${score}%`,
                        }}
                      ></i>
                    </div>

                    <strong>
                      {score}%
                    </strong>
                  </div>
                );
              })}

            {!districts.length && (
              <div className="dashboard-empty">
                No district accessibility
                data available.
              </div>
            )}

          </div>

        </div>

        {/* RISK FORECAST */}

        <div
          className="analytics-card analytics-clickable"
          onClick={() =>
            goTo(
              "/risk-intelligence"
            )
          }
        >

          <div className="analytics-header">

            <div>
              <span>
                RISK FORECAST
              </span>

              <h2>
                Current exposure
              </h2>
            </div>

            <small>
              Live risk sources
            </small>

          </div>

          <div className="risk-list">

            {riskForecast.map(
              (risk) => (
                <div
                  className="risk-row"
                  key={risk.label}
                >

                  <div>
                    <span>
                      {risk.label}
                    </span>

                    <div className="risk-bar">
                      <i
                        style={{
                          width: `${risk.percentage}%`,
                        }}
                      ></i>
                    </div>
                  </div>

                  <strong>
                    {Math.round(
                      risk.percentage
                    )}
                    %
                  </strong>

                </div>
              )
            )}

          </div>

        </div>

        {/* SUPPLY PRIORITY */}

        <div
          className="analytics-card analytics-clickable"
          onClick={() =>
            goTo("/supply-chain")
          }
        >

          <div className="analytics-header">

            <div>
              <span>
                SUPPLY PRIORITY
              </span>

              <h2>
                Regional demand
              </h2>
            </div>

            <small>
              Delivery data
            </small>

          </div>

          <div className="supply-list">

            {supplyPriority.map(
              (item) => (
                <div
                  className="supply-item"
                  key={item.name}
                >

                  <div className="supply-icon">
                    ◇
                  </div>

                  <div>
                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.total} deliveries
                      {item.delayed
                        ? ` • ${item.delayed} delayed`
                        : ""}
                    </span>
                  </div>

                  <b
                    className={
                      item.priority ===
                      "High"
                        ? "supply-high"
                        : item.priority ===
                          "Medium"
                        ? "supply-medium"
                        : "supply-normal"
                    }
                  >
                    {item.priority}
                  </b>

                </div>
              )
            )}

            {!supplyPriority.length && (
              <div className="dashboard-empty">
                No delivery records
                available.
              </div>
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          DISTRICT INTELLIGENCE
      ===================================================== */}

      <section className="district-panel">

        <div className="district-header">

          <div>

            <span>
              DISTRICT INTELLIGENCE
            </span>

            <h2>
              Regional Connectivity
            </h2>

            <p>
              Connectivity status across
              monitored districts
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              goTo("/districts")
            }
          >
            View all districts
            <span>→</span>
          </button>

        </div>

        <div className="district-table">

          <div className="district-table-head">

            <span>
              District
            </span>

            <span>
              Accessibility
            </span>

            <span>
              Risk
            </span>

            <span>
              Incidents
            </span>

            <span>
              Supply
            </span>

            <span>
              Status
            </span>

          </div>

          {districtRows.map(
            (district) => (
              <button
                type="button"
                className="district-row district-row-button"
                key={district.id}
                onClick={() =>
                  goTo(
                    "/districts"
                  )
                }
              >

                <strong>
                  {district.name}
                </strong>

                <div className="accessibility-cell">

                  <span>
                    {district.accessibility ===
                    null
                      ? "—"
                      : `${district.accessibility}%`}
                  </span>

                  <div>
                    <i
                      style={{
                        width: `${Math.max(
                          0,
                          district.accessibility ||
                            0
                        )}%`,
                      }}
                    ></i>
                  </div>

                </div>

                <span
                  className={`risk-badge ${district.risk
                    .toLowerCase()
                    .replace(
                      " ",
                      "-"
                    )}`}
                >
                  {district.risk}
                </span>

                <span className="incident-count">
                  {district.incidents}
                </span>

                <span
                  className={`supply-status ${
                    district.supply ===
                    "At Risk"
                      ? "at-risk"
                      : district.supply ===
                        "No Data"
                      ? "stable"
                      : "healthy"
                  }`}
                >
                  {district.supply}
                </span>

                <span
                  className={`trend ${getStatusClass(
                    district.status
                  )}`}
                >
                  {district.status ||
                    "UNKNOWN"}
                </span>

              </button>
            )
          )}

          {!districtRows.length && (
            <div className="dashboard-empty district-empty">
              No district intelligence
              data available.
            </div>
          )}

        </div>

      </section>

    </div>
  );
}

export default Dashboard;