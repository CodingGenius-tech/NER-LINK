import { useEffect, useMemo, useState } from "react";

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
  createIncident,
} from "../services/incident.service";

import {
  getNotifications,
} from "../services/notification.service";

import "./OperationsPage.css";

const API_URL = "http://localhost:5000/api";

/* =========================================================
   SAFE HELPERS
========================================================= */

const emptyData = {
  districts: [],
  roads: [],
  locations: [],
  vehicles: [],
  deliveries: [],
  alerts: [],
  predictions: [],
  incidents: [],
  notifications: [],
};

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const getResponseData = (response) => {
  if (!response) {
    return [];
  }

  return safeArray(response.data);
};

/* =========================================================
   DIRECT API GET
========================================================= */

const apiGet = async (endpoint, token) => {
  if (!token) {
    throw new Error(
      "Authentication token is missing"
    );
  }

  const url = `${API_URL}/${endpoint}`;

  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        return data;
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          data?.message ||
            `Authentication failed while fetching ${endpoint}`
        );
      }

      lastError = new Error(
        data?.message ||
          `Failed to fetch ${endpoint} (${response.status})`
      );
    } catch (err) {
      lastError = err;

      const message =
        err?.message?.toLowerCase() || "";

      if (
        message.includes("authentication") ||
        message.includes("token")
      ) {
        throw err;
      }

      if (attempt < 3) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            500 * attempt
          )
        );
      }
    }
  }

  throw (
    lastError ||
    new Error(
      `Failed to fetch ${endpoint}`
    )
  );
};

/* =========================================================
   MODULE CONFIGURATION
========================================================= */

const configs = {
  "live-network": {
    title: "Live Network",
    subtitle:
      "Real-time visibility across the NER transportation network.",
    type: "network",
  },

  "fleet-tracking": {
    title: "Fleet Tracking",
    subtitle:
      "Monitor vehicles carrying essential supplies.",
    type: "fleet",
  },

  "supply-chain": {
    title: "Supply Chain",
    subtitle:
      "Monitor essential deliveries and logistics movement.",
    type: "delivery",
  },

  "risk-intelligence": {
    title: "Risk Intelligence",
    subtitle:
      "Identify active disruptions and high-risk corridors.",
    type: "risk",
  },

  "emergency-mode": {
    title: "Emergency Mode",
    subtitle:
      "Prioritize accessible routes for emergency logistics.",
    type: "emergency",
  },

  "field-reports": {
    title: "Field Reports",
    subtitle:
      "Geo-tagged incident reports from field operations.",
    type: "incident",
  },

  districts: {
    title: "Districts",
    subtitle:
      "Regional connectivity and accessibility status.",
    type: "district",
  },

  notifications: {
    title: "Notifications",
    subtitle:
      "System alerts and operational notifications.",
    type: "notification",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

function OperationsPage({ module }) {
  const { token } = useAuth();

  const config = configs[module];

  const [data, setData] = useState(
    emptyData
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     INCIDENT FORM STATE
  ======================================================= */

  const [
    showIncidentForm,
    setShowIncidentForm,
  ] = useState(false);

  const [incidentForm, setIncidentForm] =
    useState({
      roadId: "",
      incidentType: "",
      severity: "MEDIUM",
      description: "",
      latitude: "",
      longitude: "",
    });

  const [
    incidentSubmitting,
    setIncidentSubmitting,
  ] = useState(false);

  const [
    incidentError,
    setIncidentError,
  ] = useState("");

  const [
    incidentSuccess,
    setIncidentSuccess,
  ] = useState("");

  /* =======================================================
     INCIDENT FORM CHANGE
  ======================================================= */

  const handleIncidentChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setIncidentForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  /* =======================================================
     CREATE INCIDENT
  ======================================================= */

  const handleIncidentSubmit = async (
    event
  ) => {
    event.preventDefault();

    setIncidentError("");
    setIncidentSuccess("");

    if (!token) {
      setIncidentError(
        "Authentication token is missing."
      );
      return;
    }

    if (!incidentForm.roadId) {
      setIncidentError(
        "Please select a road."
      );
      return;
    }

    if (
      !incidentForm.incidentType.trim()
    ) {
      setIncidentError(
        "Please enter the incident type."
      );
      return;
    }

    if (
      incidentForm.latitude === "" ||
      incidentForm.longitude === ""
    ) {
      setIncidentError(
        "Latitude and longitude are required."
      );
      return;
    }

    const latitude = Number(
      incidentForm.latitude
    );

    const longitude = Number(
      incidentForm.longitude
    );

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      setIncidentError(
        "Latitude and longitude must be valid numbers."
      );
      return;
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      setIncidentError(
        "Latitude must be between -90 and 90."
      );
      return;
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      setIncidentError(
        "Longitude must be between -180 and 180."
      );
      return;
    }

    try {
      setIncidentSubmitting(true);

      await createIncident(
        {
          roadId: Number(
            incidentForm.roadId
          ),

          incidentType:
            incidentForm.incidentType.trim(),

          severity:
            incidentForm.severity,

          description:
            incidentForm.description.trim(),

          latitude,

          longitude,
        },
        token
      );

      setIncidentSuccess(
        "Incident reported successfully."
      );

      setIncidentForm({
        roadId: "",
        incidentType: "",
        severity: "MEDIUM",
        description: "",
        latitude: "",
        longitude: "",
      });

      /* -----------------------------------------------
         Refresh incidents exactly once
      ------------------------------------------------ */

      const incidentsResponse =
        await getIncidents(token);

      setData(
        (previous) => ({
          ...previous,
          incidents:
            getResponseData(
              incidentsResponse
            ),
        })
      );

    } catch (err) {
      console.error(
        "Create incident failed:",
        err
      );

      setIncidentError(
        err?.message ||
          "Failed to report incident."
      );
    } finally {
      setIncidentSubmitting(false);
    }
  };

  /* =======================================================
     LOAD MODULE DATA
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!token) {
        if (!cancelled) {
          setLoading(false);
          setData(emptyData);
          setError(
            "Authentication token is missing."
          );
        }

        return;
      }

      if (!config) {
        if (!cancelled) {
          setLoading(false);
          setData(emptyData);
          setError(
            `Unknown module: ${module}`
          );
        }

        return;
      }

      setLoading(true);
      setError("");

      /*
        Reset data whenever module changes.
      */

      setData(emptyData);

      try {
        let result = emptyData;

        /* =================================================
           LIVE NETWORK
        ================================================= */

        if (
          config.type === "network"
        ) {
          const [
            districtsResponse,
            roadsResponse,
            locationsResponse,
          ] = await Promise.all([
            getDistricts(token),
            getRoads(token),
            apiGet(
              "vehicle-locations",
              token
            ),
          ]);

          result = {
            ...emptyData,

            districts:
              getResponseData(
                districtsResponse
              ),

            roads:
              getResponseData(
                roadsResponse
              ),

            locations:
              getResponseData(
                locationsResponse
              ),
          };
        }

        /* =================================================
           FLEET TRACKING
        ================================================= */

        else if (
          config.type === "fleet"
        ) {
          const [
            vehiclesResponse,
            locationsResponse,
          ] = await Promise.all([
            getVehicles(token),
            apiGet(
              "vehicle-locations",
              token
            ),
          ]);

          result = {
            ...emptyData,

            vehicles:
              getResponseData(
                vehiclesResponse
              ),

            locations:
              getResponseData(
                locationsResponse
              ),
          };
        }

        /* =================================================
           SUPPLY CHAIN
        ================================================= */

        else if (
          config.type === "delivery"
        ) {
          const deliveriesResponse =
            await getDeliveries(token);

          result = {
            ...emptyData,

            deliveries:
              getResponseData(
                deliveriesResponse
              ),
          };
        }

        /* =================================================
           RISK INTELLIGENCE
        ================================================= */

        else if (
          config.type === "risk"
        ) {
          const [
            alertsResponse,
            predictionsResponse,
            roadsResponse,
          ] = await Promise.all([
            getAlerts(token),
            getRoutePredictions(token),
            getRoads(token),
          ]);

          result = {
            ...emptyData,

            alerts:
              getResponseData(
                alertsResponse
              ),

            predictions:
              getResponseData(
                predictionsResponse
              ),

            roads:
              getResponseData(
                roadsResponse
              ),
          };
        }

        /* =================================================
           EMERGENCY MODE
        ================================================= */

        else if (
          config.type === "emergency"
        ) {
          const [
            districtsResponse,
            roadsResponse,
          ] = await Promise.all([
            getDistricts(token),
            getRoads(token),
          ]);

          result = {
            ...emptyData,

            districts:
              getResponseData(
                districtsResponse
              ),

            roads:
              getResponseData(
                roadsResponse
              ),
          };
        }

        /* =================================================
           FIELD REPORTS
        ================================================= */

        else if (
          config.type === "incident"
        ) {
          const incidentsResponse =
            await getIncidents(token);

          result = {
            ...emptyData,

            incidents:
              getResponseData(
                incidentsResponse
              ),
          };
        }

        /* =================================================
           DISTRICTS
        ================================================= */

        else if (
          config.type === "district"
        ) {
          const districtsResponse =
            await getDistricts(token);

          result = {
            ...emptyData,

            districts:
              getResponseData(
                districtsResponse
              ),
          };
        }

        /* =================================================
           NOTIFICATIONS
        ================================================= */

        else if (
          config.type === "notification"
        ) {
          const notificationsResponse =
            await getNotifications(token);

          result = {
            ...emptyData,

            notifications:
              getResponseData(
                notificationsResponse
              ),
          };
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        console.error(
          "Module loading failed:",
          err
        );

        if (!cancelled) {
          setData(emptyData);

          setError(
            err?.message ||
              "Failed to load module data"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [token, module]);

  /* =======================================================
     SAFE DATA REFERENCES
  ======================================================= */

  const districts = safeArray(
    data.districts
  );

  const roads = safeArray(
    data.roads
  );

  const locations = safeArray(
    data.locations
  );

  const vehicles = safeArray(
    data.vehicles
  );

  const deliveries = safeArray(
    data.deliveries
  );

  const alerts = safeArray(
    data.alerts
  );

  const predictions = safeArray(
    data.predictions
  );

  const incidents = safeArray(
    data.incidents
  );

  const notifications = safeArray(
    data.notifications
  );

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activeAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        !alert?.is_resolved
    );
  }, [alerts]);

  const highRiskRoads = useMemo(() => {
    return roads.filter(
      (road) => {
        const risk = String(
          road?.risk_level || ""
        ).toUpperCase();

        return (
          risk === "HIGH" ||
          risk === "CRITICAL"
        );
      }
    );
  }, [roads]);

  const delayedVehicles =
    useMemo(() => {
      return vehicles.filter(
        (vehicle) => {
          const status =
            String(
              vehicle?.status || ""
            ).toUpperCase();

          return status.includes(
            "DELAY"
          );
        }
      );
    }, [vehicles]);

  const accessibleDistricts =
    useMemo(() => {
      return districts.filter(
        (district) => {
          const status =
            String(
              district?.connectivity_status ||
                ""
            ).toUpperCase();

          return [
            "ACCESSIBLE",
            "CONNECTED",
            "GOOD",
            "OPEN",
            "EXCELLENT",
          ].includes(status);
        }
      );
    }, [districts]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    if (!config) {
      return [];
    }

    switch (config.type) {
      case "network":
        return [
          [
            "Districts",
            districts.length,
          ],
          [
            "Roads",
            roads.length,
          ],
          [
            "Vehicle Locations",
            locations.length,
          ],
        ];

      case "fleet":
        return [
          [
            "Vehicles",
            vehicles.length,
          ],
          [
            "Locations",
            locations.length,
          ],
          [
            "Delayed",
            delayedVehicles.length,
          ],
        ];

      case "delivery":
        return [
          [
            "Deliveries",
            deliveries.length,
          ],
          [
            "In Transit",
            deliveries.filter(
              (delivery) =>
                String(
                  delivery?.status || ""
                ).toUpperCase() ===
                "IN_TRANSIT"
            ).length,
          ],
          [
            "Delayed",
            deliveries.filter(
              (delivery) =>
                String(
                  delivery?.status || ""
                ).toUpperCase() ===
                "DELAYED"
            ).length,
          ],
        ];

      case "risk":
        return [
          [
            "Alerts",
            alerts.length,
          ],
          [
            "Predictions",
            predictions.length,
          ],
          [
            "High Risk Roads",
            highRiskRoads.length,
          ],
        ];

      case "emergency":
        return [
          [
            "Districts",
            districts.length,
          ],
          [
            "Roads",
            roads.length,
          ],
          [
            "Accessible",
            accessibleDistricts.length,
          ],
        ];

      case "incident":
        return [
          [
            "Field Reports",
            incidents.length,
          ],
          [
            "High Severity",
            incidents.filter(
              (incident) =>
                [
                  "HIGH",
                  "CRITICAL",
                ].includes(
                  String(
                    incident?.severity ||
                      ""
                  ).toUpperCase()
                )
            ).length,
          ],
        ];

      case "district":
        return [
          [
            "Total Districts",
            districts.length,
          ],
          [
            "Accessible",
            accessibleDistricts.length,
          ],
        ];

      case "notification":
        return [
          [
            "Notifications",
            notifications.length,
          ],
          [
            "Unread",
            notifications.filter(
              (notification) =>
                !notification?.is_read
            ).length,
          ],
        ];

      default:
        return [];
    }
  }, [
    config,
    districts,
    roads,
    locations,
    vehicles,
    deliveries,
    alerts,
    predictions,
    incidents,
    notifications,
    delayedVehicles,
    highRiskRoads,
    accessibleDistricts,
  ]);

  /* =======================================================
     UNKNOWN MODULE
  ======================================================= */

  if (!config) {
    return (
      <div className="operations-page">
        <main className="operation-main">
          <section className="operation-content">

            <div className="operation-panel">

              <div className="operation-panel-header">

                <span>
                  MODULE ERROR
                </span>

                <h2>
                  Unknown Module
                </h2>

              </div>

              <div className="empty">

                No configuration found for:
                {" "}
                {module || "unknown"}

              </div>

            </div>

          </section>
        </main>
      </div>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="operations-page">

        <main className="operation-main">

          <section className="operation-content">

            <div className="operation-heading">

              <div>

                <div className="live-label">
                  <span></span>
                  LIVE MODULE
                </div>

                <h1>
                  {config.title}
                </h1>

                <p>
                  {config.subtitle}
                </p>

              </div>

              <div className="database-status">
                Loading...
              </div>

            </div>

            <div className="operation-panel">

              <div className="operation-panel-header">

                <span>
                  SYSTEM
                </span>

                <h2>
                  Loading module data
                </h2>

              </div>

              <div className="empty">
                Connecting to database...
              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="operations-page">

        <main className="operation-main">

          <section className="operation-content">

            <div className="operation-heading">

              <div>

                <div className="live-label">
                  <span></span>
                  LIVE MODULE
                </div>

                <h1>
                  {config.title}
                </h1>

                <p>
                  {config.subtitle}
                </p>

              </div>

            </div>

            <div className="operation-panel">

              <div className="operation-panel-header">

                <span>
                  DATABASE ERROR
                </span>

                <h2>
                  Unable to load module
                </h2>

              </div>

              <div
                style={{
                  padding: "25px",
                }}
              >

                <p
                  style={{
                    color: "#e45858",
                    fontSize: "12px",
                  }}
                >
                  {error}
                </p>

                <button
                  className="view-btn"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Retry
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="operations-page">

      <main className="operation-main">

        <section className="operation-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="operation-heading">

            <div>

              <div className="live-label">
                <span></span>
                LIVE MODULE
              </div>

              <h1>
                {config.title}
              </h1>

              <p>
                {config.subtitle}
              </p>

            </div>

            <div className="database-status">
              Database connected
            </div>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          {stats.length > 0 && (
            <div className="operation-stats">

              {stats.map(
                ([label, value]) => (
                  <div
                    className="operation-stat"
                    key={label}
                  >

                    <span>
                      {label}
                    </span>

                    <strong>
                      {value}
                    </strong>

                  </div>
                )
              )}

            </div>
          )}

          {/* =================================================
              LIVE NETWORK
          ================================================= */}

          {config.type === "network" && (
            <>

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    NETWORK STATUS
                  </span>

                  <h2>
                    Regional Network
                  </h2>

                </div>

                <div className="operation-list">

                  {districts.length > 0 ? (
                    districts.map(
                      (district) => {

                        const status =
                          String(
                            district?.connectivity_status ||
                              "UNKNOWN"
                          ).toUpperCase();

                        return (
                          <div
                            className="operation-row"
                            key={
                              district?.id ||
                              district?.name
                            }
                          >

                            <div>

                              <strong>
                                {district?.name ||
                                  "Unknown District"}
                              </strong>

                              <small>
                                Regional connectivity
                              </small>

                            </div>

                            <span>
                              {status}
                            </span>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="empty">
                      No district data available.
                    </div>
                  )}

                </div>

              </section>

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    ROAD NETWORK
                  </span>

                  <h2>
                    Transportation Corridors
                  </h2>

                </div>

                <div className="operation-list">

                  {roads.length > 0 ? (
                    roads.map(
                      (road) => (
                        <div
                          className="operation-row"
                          key={
                            road?.id ||
                            road?.name
                          }
                        >

                          <div>

                            <strong>
                              {road?.name ||
                                "Unknown Road"}
                            </strong>

                            <small>
                              {road?.current_status ||
                                "Status unavailable"}
                            </small>

                          </div>

                          <span>
                            {road?.risk_level ||
                              "UNKNOWN"}
                          </span>

                        </div>
                      )
                    )
                  ) : (
                    <div className="empty">
                      No roads available.
                    </div>
                  )}

                </div>

              </section>

            </>
          )}

          {/* =================================================
              FLEET TRACKING
          ================================================= */}

          {config.type === "fleet" && (
            <section className="operation-panel">

              <div className="operation-panel-header">

                <span>
                  LIVE FLEET
                </span>

                <h2>
                  Vehicle Movement
                </h2>

              </div>

              <div className="operation-list">

                {vehicles.length > 0 ? (
                  vehicles.map(
                    (vehicle) => {

                      const status =
                        String(
                          vehicle?.status ||
                            "UNKNOWN"
                        ).toUpperCase();

                      return (
                        <div
                          className="operation-row"
                          key={
                            vehicle?.id ||
                            vehicle?.vehicle_number
                          }
                        >

                          <div>

                            <strong>
                              {vehicle?.vehicle_number ||
                                "Unknown Vehicle"}
                            </strong>

                            <small>
                              {vehicle?.vehicle_type ||
                                "Vehicle"}
                            </small>

                          </div>

                          <span>
                            {status}
                          </span>

                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="empty">
                    No vehicles available.
                  </div>
                )}

              </div>

            </section>
          )}

          {/* =================================================
              SUPPLY CHAIN
          ================================================= */}

          {config.type === "delivery" && (
            <section className="operation-panel">

              <div className="operation-panel-header">

                <span>
                  SUPPLY MOVEMENT
                </span>

                <h2>
                  Deliveries
                </h2>

              </div>

              <div className="operation-list">

                {deliveries.length > 0 ? (
                  deliveries.map(
                    (delivery) => {

                      const status =
                        String(
                          delivery?.status ||
                            "UNKNOWN"
                        ).toUpperCase();

                      return (
                        <div
                          className="operation-row"
                          key={
                            delivery?.id ||
                            `${delivery?.source}-${delivery?.destination}`
                          }
                        >

                          <div>

                            <strong>

                              {delivery?.source ||
                                "Source"}

                              {" → "}

                              {delivery?.destination ||
                                "Destination"}

                            </strong>

                            <small>

                              {delivery?.commodity_type ||
                                "Essential supply"}

                              {" • "}

                              {delivery?.vehicle_number ||
                                "Vehicle unavailable"}

                            </small>

                          </div>

                          <span>
                            {status}
                          </span>

                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="empty">
                    No deliveries available.
                  </div>
                )}

              </div>

            </section>
          )}

          {/* =================================================
              RISK INTELLIGENCE
          ================================================= */}

          {config.type === "risk" && (
            <>

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    ACTIVE ALERTS
                  </span>

                  <h2>
                    Risk Events
                  </h2>

                </div>

                <div className="operation-list">

                  {activeAlerts.length > 0 ? (
                    activeAlerts.map(
                      (alert) => {

                        const severity =
                          String(
                            alert?.severity ||
                              "UNKNOWN"
                          ).toUpperCase();

                        return (
                          <div
                            className="operation-row"
                            key={
                              alert?.id ||
                              alert?.title
                            }
                          >

                            <div>

                              <strong>
                                {alert?.title ||
                                  "Risk Event"}
                              </strong>

                              <small>
                                {alert?.road_name ||
                                  alert?.district_name ||
                                  "Location unavailable"}
                              </small>

                            </div>

                            <span>
                              {severity}
                            </span>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="empty">
                      No active risk events.
                    </div>
                  )}

                </div>

              </section>

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    AI PREDICTIONS
                  </span>

                  <h2>
                    Route Risk Predictions
                  </h2>

                </div>

                <div className="operation-list">

                  {predictions.length > 0 ? (
                    predictions.map(
                      (prediction) => {

                        const risk =
                          prediction?.risk_score ??
                          prediction?.risk_percentage ??
                          prediction?.risk ??
                          "UNKNOWN";

                        return (
                          <div
                            className="operation-row"
                            key={
                              prediction?.id ||
                              prediction?.route_name ||
                              prediction?.road_name
                            }
                          >

                            <div>

                              <strong>
                                {prediction?.road_name ||
                                  prediction?.route_name ||
                                  prediction?.name ||
                                  `Prediction #${
                                    prediction?.id ||
                                    "?"
                                  }`}
                              </strong>

                              <small>
                                {prediction?.prediction_type ||
                                  prediction?.risk_type ||
                                  "Route prediction"}
                              </small>

                            </div>

                            <span>
                              {risk}
                            </span>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="empty">
                      No route predictions available.
                    </div>
                  )}

                </div>

              </section>

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    HIGH RISK CORRIDORS
                  </span>

                  <h2>
                    Risk Classified Roads
                  </h2>

                </div>

                <div className="operation-list">

                  {highRiskRoads.length > 0 ? (
                    highRiskRoads.map(
                      (road) => (
                        <div
                          className="operation-row"
                          key={
                            road?.id ||
                            road?.name
                          }
                        >

                          <div>

                            <strong>
                              {road?.name ||
                                "High Risk Road"}
                            </strong>

                            <small>
                              {road?.current_status ||
                                "Risk classified"}
                            </small>

                          </div>

                          <span>
                            {road?.risk_level ||
                              "HIGH"}
                          </span>

                        </div>
                      )
                    )
                  ) : (
                    <div className="empty">
                      No high-risk roads found.
                    </div>
                  )}

                </div>

              </section>

            </>
          )}

          {/* =================================================
              EMERGENCY MODE
          ================================================= */}

          {config.type === "emergency" && (
            <>

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    EMERGENCY ACCESS
                  </span>

                  <h2>
                    Accessible Districts
                  </h2>

                </div>

                <div className="operation-list">

                  {districts.length > 0 ? (
                    districts.map(
                      (district) => {

                        const status =
                          String(
                            district?.connectivity_status ||
                              "UNKNOWN"
                          ).toUpperCase();

                        const accessible =
                          [
                            "ACCESSIBLE",
                            "CONNECTED",
                            "GOOD",
                            "OPEN",
                            "EXCELLENT",
                          ].includes(
                            status
                          );

                        return (
                          <div
                            className="operation-row"
                            key={
                              district?.id ||
                              district?.name
                            }
                          >

                            <div>

                              <strong>
                                {district?.name ||
                                  "Unknown District"}
                              </strong>

                              <small>
                                Emergency accessibility
                              </small>

                            </div>

                            <span>
                              {accessible
                                ? "ACCESSIBLE"
                                : status}
                            </span>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="empty">
                      No district data available.
                    </div>
                  )}

                </div>

              </section>

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    EMERGENCY ROUTES
                  </span>

                  <h2>
                    Available Roads
                  </h2>

                </div>

                <div className="operation-list">

                  {roads.length > 0 ? (
                    roads.map(
                      (road) => (
                        <div
                          className="operation-row"
                          key={
                            road?.id ||
                            road?.name
                          }
                        >

                          <div>

                            <strong>
                              {road?.name ||
                                "Unknown Road"}
                            </strong>

                            <small>
                              {road?.current_status ||
                                "Road status unavailable"}
                            </small>

                          </div>

                          <span>
                            {road?.risk_level ||
                              "UNKNOWN"}
                          </span>

                        </div>
                      )
                    )
                  ) : (
                    <div className="empty">
                      No emergency routes available.
                    </div>
                  )}

                </div>

              </section>

            </>
          )}

          {/* =================================================
              FIELD REPORTS
          ================================================= */}

          {config.type === "incident" && (
            <>

              {/* =============================================
                  REPORT INCIDENT
              ============================================= */}

              <section className="operation-panel">

                <div className="operation-panel-header field-report-header">

                  <div>

                    <span>
                      FIELD OPERATIONS
                    </span>

                    <h2>
                      Report Incident
                    </h2>

                  </div>

                  <button
                    type="button"
                    className="incident-toggle-btn"
                    onClick={() => {
                      setShowIncidentForm(
                        (previous) =>
                          !previous
                      );

                      setIncidentError("");
                      setIncidentSuccess("");
                    }}
                  >
                    {showIncidentForm
                      ? "CLOSE FORM"
                      : "REPORT INCIDENT"}
                  </button>

                </div>

                {/* =========================================
                    INCIDENT FORM
                ========================================= */}

                {showIncidentForm && (
                  <form
                    className="incident-form"
                    onSubmit={
                      handleIncidentSubmit
                    }
                  >

                    <div className="incident-form-grid">

                      {/* ROAD */}

                      <div className="incident-field">

                        <label htmlFor="roadId">
                          ROAD
                        </label>

                        <select
                          id="roadId"
                          name="roadId"
                          value={
                            incidentForm.roadId
                          }
                          onChange={
                            handleIncidentChange
                          }
                          disabled={
                            incidentSubmitting
                          }
                          required
                        >

                          <option value="">
                            Select road
                          </option>

                          {roads.map(
                            (road) => (
                              <option
                                key={
                                  road?.id
                                }
                                value={
                                  road?.id
                                }
                              >
                                {road?.name ||
                                  `Road #${road?.id}`}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      {/* INCIDENT TYPE */}

                      <div className="incident-field">

                        <label htmlFor="incidentType">
                          INCIDENT TYPE
                        </label>

                        <input
                          id="incidentType"
                          name="incidentType"
                          type="text"
                          placeholder="e.g. Landslide"
                          value={
                            incidentForm.incidentType
                          }
                          onChange={
                            handleIncidentChange
                          }
                          disabled={
                            incidentSubmitting
                          }
                          required
                        />

                      </div>

                      {/* SEVERITY */}

                      <div className="incident-field">

                        <label htmlFor="severity">
                          SEVERITY
                        </label>

                        <select
                          id="severity"
                          name="severity"
                          value={
                            incidentForm.severity
                          }
                          onChange={
                            handleIncidentChange
                          }
                          disabled={
                            incidentSubmitting
                          }
                        >

                          <option value="LOW">
                            LOW
                          </option>

                          <option value="MEDIUM">
                            MEDIUM
                          </option>

                          <option value="HIGH">
                            HIGH
                          </option>

                          <option value="CRITICAL">
                            CRITICAL
                          </option>

                        </select>

                      </div>

                      {/* LATITUDE */}

                      <div className="incident-field">

                        <label htmlFor="latitude">
                          LATITUDE
                        </label>

                        <input
                          id="latitude"
                          name="latitude"
                          type="number"
                          step="any"
                          placeholder="e.g. 26.1445"
                          value={
                            incidentForm.latitude
                          }
                          onChange={
                            handleIncidentChange
                          }
                          disabled={
                            incidentSubmitting
                          }
                          required
                        />

                      </div>

                      {/* LONGITUDE */}

                      <div className="incident-field">

                        <label htmlFor="longitude">
                          LONGITUDE
                        </label>

                        <input
                          id="longitude"
                          name="longitude"
                          type="number"
                          step="any"
                          placeholder="e.g. 91.7362"
                          value={
                            incidentForm.longitude
                          }
                          onChange={
                            handleIncidentChange
                          }
                          disabled={
                            incidentSubmitting
                          }
                          required
                        />

                      </div>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="incident-field incident-description">

                      <label htmlFor="description">
                        DESCRIPTION
                      </label>

                      <textarea
                        id="description"
                        name="description"
                        rows="4"
                        placeholder="Describe the incident..."
                        value={
                          incidentForm.description
                        }
                        onChange={
                          handleIncidentChange
                        }
                        disabled={
                          incidentSubmitting
                        }
                      />

                    </div>

                    {/* ERROR */}

                    {incidentError && (
                      <div className="incident-form-error">
                        {incidentError}
                      </div>
                    )}

                    {/* SUCCESS */}

                    {incidentSuccess && (
                      <div className="incident-form-success">
                        {incidentSuccess}
                      </div>
                    )}

                    {/* SUBMIT */}

                    <div className="incident-form-actions">

                      <button
                        type="submit"
                        className="incident-submit-btn"
                        disabled={
                          incidentSubmitting
                        }
                      >
                        {incidentSubmitting
                          ? "SUBMITTING..."
                          : "SUBMIT INCIDENT"}
                      </button>

                    </div>

                  </form>
                )}

              </section>

              {/* =============================================
                  EXISTING FIELD REPORTS
              ============================================= */}

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    FIELD OPERATIONS
                  </span>

                  <h2>
                    Field Reports
                  </h2>

                </div>

                <div className="operation-list">

                  {incidents.length > 0 ? (
                    incidents.map(
                      (incident) => {

                        const severity =
                          String(
                            incident?.severity ||
                              "UNKNOWN"
                          ).toUpperCase();

                        return (
                          <div
                            className="operation-row"
                            key={
                              incident?.id
                            }
                          >

                            <div>

                              <strong>
                                {incident?.incident_type ||
                                  incident?.description ||
                                  "Field Report"}
                              </strong>

                              <small>

                                {incident?.road_name ||
                                  "Road unavailable"}

                                {" • "}

                                {incident?.status ||
                                  "Status unavailable"}

                                {" • "}

                                {incident?.reported_by_name ||
                                  "Unknown reporter"}

                              </small>

                            </div>

                            <span>
                              {severity}
                            </span>

                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="empty">
                      No field reports available.
                    </div>
                  )}

                </div>

              </section>

            </>
          )}

          {/* =================================================
              DISTRICTS
          ================================================= */}

          {config.type === "district" && (
            <section className="operation-panel">

              <div className="operation-panel-header">

                <span>
                  REGIONAL STATUS
                </span>

                <h2>
                  District Connectivity
                </h2>

              </div>

              <div className="operation-list">

                {districts.length > 0 ? (
                  districts.map(
                    (district) => {

                      const status =
                        String(
                          district?.connectivity_status ||
                            "UNKNOWN"
                        ).toUpperCase();

                      return (
                        <div
                          className="operation-row"
                          key={
                            district?.id ||
                            district?.name
                          }
                        >

                          <div>

                            <strong>
                              {district?.name ||
                                "Unknown District"}
                            </strong>

                            <small>
                              Regional connectivity
                            </small>

                          </div>

                          <span>
                            {status}
                          </span>

                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="empty">
                    No districts available.
                  </div>
                )}

              </div>

            </section>
          )}

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {config.type === "notification" && (
            <section className="operation-panel">

              <div className="operation-panel-header">

                <span>
                  SYSTEM ALERTS
                </span>

                <h2>
                  Notifications
                </h2>

              </div>

              <div className="operation-list">

                {notifications.length > 0 ? (
                  notifications.map(
                    (notification) => {

                      const isRead =
                        Boolean(
                          notification?.is_read
                        );

                      return (
                        <div
                          className="operation-row"
                          key={
                            notification?.id
                          }
                        >

                          <div>

                            <strong>
                              {notification?.title ||
                                notification?.message ||
                                "Notification"}
                            </strong>

                            <small>

                              {notification?.message &&
                                notification?.title
                                ? notification.message
                                : notification?.created_at ||
                                  "System notification"}

                            </small>

                          </div>

                          <span>
                            {isRead
                              ? "READ"
                              : "UNREAD"}
                          </span>

                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="empty">
                    No notifications available.
                  </div>
                )}

              </div>

            </section>
          )}

        </section>

      </main>

    </div>
  );
}

export default OperationsPage;