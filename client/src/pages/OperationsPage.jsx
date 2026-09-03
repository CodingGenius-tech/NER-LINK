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
  getFieldReports,
  createFieldReport,
} from "../services/fieldReport.service";

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
  fieldReports: [],
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
      "Coordinate emergency access and priority movement.",
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
      reportType: "",
      description: "",
      latitude: "",
      longitude: "",
      photo: null,
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
      files,
    } = event.target;

    if (name === "photo") {
      setIncidentForm(
        (previous) => ({
          ...previous,
          photo:
            files?.[0] || null,
        })
      );

      return;
    }

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

    if (!incidentForm.reportType) {
      setIncidentError(
        "Please select a report type."
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

      await createFieldReport(
        {
          reportType: 
            incidentForm.reportType,

          description:
            incidentForm.description,

          latitude,

          longitude,

          photo:
            incidentForm.photo,
        },
        token
      );

      setIncidentSuccess(
        "Field Report reported successfully."
      );

      setIncidentForm({
        reportType: "",
        description: "",
        latitude: "",
        longitude: "",
        photo: null,
      });

      /* -----------------------------------------------
         Refresh incidents exactly once
      ------------------------------------------------ */

      const reportsResponse =
        await getFieldReports(token);

      setData(
        (previous) => ({
          ...previous,
          fieldReports:
            getResponseData(
              reportsResponse
            ),
        })
      );

    } catch (err) {
      console.error(
        "Create field report failed:",
        err
      );

      setIncidentError(
        err?.message ||
          "Failed to submit field report."
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
          const fieldReportResponse =
            await getFieldReports(token);

          result = {
            ...emptyData,

            fieldReports:
              getResponseData(
                fieldReportResponse
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

  const fieldReports = safeArray(
    data.fieldReports
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
            fieldReports.length,
          ],
          [
            "High Severity",
            fieldReports.filter(
              (report) =>
                [
                  "LANDSLIDE",
                  "FLOOD",
                  "ROAD_DAMAGE",
                  "BRIDGE_DAMAGE",
                ].includes(
                  String(
                    report?.report_type ||
                      ""
                  ).toUpperCase()
                )
            ).length,
          ],
          [
            "Synced",
            fieldReports.filter(
              (report) =>
                String(
                  report?.sync_status || ""
                ).toUpperCase() === "SYNCED"
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
    fieldReports,
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

          <small>
            {vehicles.length} vehicles tracked across Northeast India
          </small>

        </div>

        <div className="operation-list">

          {vehicles.length > 0 ? (

          vehicles.map((vehicle) => {

          const status = String(
            vehicle?.status || "UNKNOWN"
          ).toUpperCase();

          /*
           * Find the latest GPS location belonging
           * to this exact vehicle.
           */
          const vehicleLocations = locations
            .filter(
              (location) =>
                Number(location?.vehicle_id) ===
                Number(vehicle?.id)
            )
            .sort(
              (a, b) =>
                new Date(b?.recorded_at || 0) -
                new Date(a?.recorded_at || 0)
            );

            const latestLocation =
              vehicleLocations[0];

          /*
           * GeoJSON Point:
           * coordinates = [longitude, latitude]
           */
          const coordinates =
            latestLocation?.location?.coordinates;

          const longitude =
            Array.isArray(coordinates)
              ? coordinates[0]
              : null;

          const latitude =
            Array.isArray(coordinates)
              ? coordinates[1]
              : null;

          const speed =
            latestLocation?.speed !== null &&
            latestLocation?.speed !== undefined
              ? Number(latestLocation.speed)
              : null;

          const heading =
            latestLocation?.heading !== null &&
            latestLocation?.heading !== undefined
              ? Number(latestLocation.heading)
              : null;

          const recordedAt =
            latestLocation?.recorded_at ||
            vehicle?.last_location_update;

          const formattedTime =
            recordedAt
              ? new Date(recordedAt).toLocaleString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "No update";

          return (
            <div
              className="operation-row"
              key={
                vehicle?.id ||
                vehicle?.vehicle_number
              }
              style={{
                alignItems: "flex-start",
                gap: "20px",
              }}
            >

              {/* =========================
                  VEHICLE IDENTITY
              ========================= */}

              <div
                style={{
                  minWidth: "220px",
                }}
              >

                <strong>
                  {vehicle?.vehicle_number ||
                    "Unknown Vehicle"}
                </strong>

                <small>
                  {vehicle?.vehicle_type ||
                    "Vehicle"}
                </small>

                <small>
                  Driver:{" "}
                  {vehicle?.driver_name ||
                    "Not assigned"}
                </small>

              </div>


              {/* =========================
                  STATUS
              ========================= */}

              <div
                style={{
                  minWidth: "110px",
                }}
              >

                <span>
                  {status}
                </span>

                <small>
                  {vehicle?.commodity_type ||
                    "OTHER"}
                </small>

              </div>


              {/* =========================
                  GPS DATA
              ========================= */}

              <div
                style={{
                  minWidth: "230px",
                }}
              >

                <small>
                  GPS LOCATION
                </small>

                {latitude !== null &&
                longitude !== null ? (

                  <small>
                    {Number(latitude).toFixed(4)},
                    {" "}
                    {Number(longitude).toFixed(4)}
                  </small>

                ) : (

                  <small>
                    Location unavailable
                  </small>

                )}

                <small>
                  Updated: {formattedTime}
                </small>

              </div>


              {/* =========================
                  MOVEMENT
              ========================= */}

              <div
                style={{
                  minWidth: "150px",
                }}
              >

                <small>
                  SPEED
                </small>

                <strong>
                  {speed !== null
                    ? `${speed.toFixed(1)} km/h`
                    : "--"}
                </strong>

                <small>
                  Heading:{" "}
                  {heading !== null
                    ? `${heading.toFixed(0)}°`
                    : "--"}
                </small>

              </div>

            </div>
          );
        })

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
                  Essential Deliveries
                </h2>

                <small>
                  {deliveries.length} active logistics records across Northeast India
                </small>

              </div>

              <div className="operation-list">

                {deliveries.length > 0 ? (

                  deliveries.map((delivery) => {

                    const status = String(
                      delivery?.status || "UNKNOWN"
                    ).toUpperCase();

                    const priority = String(
                      delivery?.priority || "NORMAL"
                    ).toUpperCase();

                    const commodity = String(
                      delivery?.commodity_type ||
                        "OTHER"
                    ).replaceAll("_", " ");

                    const quantity =
                      delivery?.quantity !== null &&
                      delivery?.quantity !== undefined
                        ? Number(delivery.quantity)
                        : null;

                    const expectedTime =
                      delivery?.expected_delivery_at;

                    const actualTime =
                      delivery?.actual_delivery_at;

                    const formatDateTime = (value) => {

                      if (!value) {
                        return "Not available";
                      }

                      const date = new Date(value);

                      if (Number.isNaN(date.getTime())) {
                        return "Not available";
                      }

                      return date.toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );
                    };

                    return (
                      <div
                        className="operation-row"
                        key={
                          delivery?.id ||
                          `${delivery?.source}-${delivery?.destination}`
                        }
                        style={{
                          alignItems: "flex-start",
                          gap: "20px",
                        }}
                      >

                        {/* =========================
                            ROUTE
                        ========================= */}

                        <div
                          style={{
                            minWidth: "300px",
                          }}
                        >

                          <strong>
                            {delivery?.source ||
                              "Source"}
                            {" → "}
                            {delivery?.destination ||
                              "Destination"}
                          </strong>

                          <small>
                            Delivery #{delivery?.id}
                          </small>

                          <small>
                            Vehicle:{" "}
                            {delivery?.vehicle_number ||
                              "Not assigned"}
                          </small>

                        </div>


                        {/* =========================
                            CARGO
                        ========================= */}

                        <div
                          style={{
                            minWidth: "190px",
                          }}
                        >

                          <small>
                            COMMODITY
                          </small>

                          <strong>
                            {commodity}
                          </strong>

                          <small>
                            Quantity:{" "}
                            {quantity !== null
                              ? quantity.toLocaleString(
                                  "en-IN"
                                )
                              : "--"}
                          </small>

                        </div>


                        {/* =========================
                            PRIORITY
                        ========================= */}

                        <div
                          style={{
                            minWidth: "110px",
                          }}
                        >

                          <small>
                            PRIORITY
                          </small>

                          <span>
                            {priority}
                          </span>

                        </div>


                        {/* =========================
                            STATUS
                        ========================= */}

                        <div
                          style={{
                            minWidth: "140px",
                          }}
                        >

                          <small>
                            DELIVERY STATUS
                          </small>

                          <span>
                            {status}
                          </span>

                        </div>


                        {/* =========================
                            ETA
                        ========================= */}

                        <div
                          style={{
                            minWidth: "180px",
                          }}
                        >

                          <small>
                            EXPECTED DELIVERY
                          </small>

                          <strong>
                            {formatDateTime(
                              expectedTime
                            )}
                          </strong>

                          {actualTime && (
                            <small>
                              Delivered:{" "}
                              {formatDateTime(
                                actualTime
                              )}
                            </small>
                          )}

                        </div>

                      </div>
                    );
                  })

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

              {/* =================================================
                  ACTIVE ALERTS
              ================================================= */}

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    ACTIVE ALERTS
                  </span>

                  <h2>
                    Risk Events
                  </h2>

                  <small>
                    {activeAlerts.length} active alerts across the NER network
                  </small>

                </div>

                <div className="operation-list">

                  {activeAlerts.length > 0 ? (

                    activeAlerts.map((alert) => {

                      const severity = String(
                        alert?.severity || "UNKNOWN"
                      ).toUpperCase();

                      const alertType = String(
                        alert?.alert_type || "OTHER"
                      ).replaceAll("_", " ");

                      const location =
                        alert?.road_name ||
                        alert?.district_name ||
                        alert?.vehicle_number ||
                        "Location unavailable";

                      return (
                        <div
                          className="operation-row"
                          key={
                            alert?.id ||
                            alert?.title
                          }
                          style={{
                            alignItems: "flex-start",
                            gap: "20px",
                          }}
                        >

                          {/* ALERT */}

                          <div
                            style={{
                              minWidth: "300px",
                            }}
                          >

                            <strong>
                              {alert?.title ||
                                "Risk Event"}
                            </strong>

                            <small>
                              {alertType}
                            </small>

                            <small>
                              {location}
                            </small>

                          </div>


                          {/* MESSAGE */}

                          <div
                            style={{
                              minWidth: "300px",
                              flex: 1,
                            }}
                          >

                            <small>
                              ALERT MESSAGE
                            </small>

                            <span>
                              {alert?.message ||
                                "No additional information available."}
                            </span>

                          </div>


                          {/* SEVERITY */}

                          <div
                            style={{
                              minWidth: "120px",
                            }}
                          >

                            <small>
                              SEVERITY
                            </small>

                            <span>
                              {severity}
                            </span>

                          </div>


                          {/* STATUS */}

                          <div
                            style={{
                              minWidth: "120px",
                            }}
                          >

                            <small>
                              STATUS
                            </small>

                            <span>
                              {alert?.is_resolved
                                ? "RESOLVED"
                                : "ACTIVE"}
                            </span>

                          </div>

                        </div>
                      );
                    })

                  ) : (

                    <div className="empty">
                      No active risk events.
                    </div>

                  )}

                </div>

              </section>


              {/* =================================================
                  AI ROUTE PREDICTIONS
              ================================================= */}

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    AI PREDICTIONS
                  </span>

                  <h2>
                    Route Risk Predictions
                  </h2>

                  <small>
                    {predictions.length} route predictions from the risk engine
                  </small>

                </div>

                <div className="operation-list">

                  {predictions.length > 0 ? (

                    predictions.map((prediction) => {

                      const probability =
                        prediction?.disruption_probability !== null &&
                        prediction?.disruption_probability !== undefined
                          ? Number(
                              prediction.disruption_probability
                            )
                          : null;

                      const riskLevel = String(
                        prediction?.risk_level ||
                          "UNKNOWN"
                      ).toUpperCase();

                      const disruptionType = String(
                        prediction?.predicted_disruption_type ||
                          "OTHER"
                      ).replaceAll("_", " ");

                      const expectedDelay =
                        prediction?.expected_delay_minutes !== null &&
                        prediction?.expected_delay_minutes !== undefined
                          ? Number(
                              prediction.expected_delay_minutes
                            )
                          : null;

                      /*
                      * Route information can come from the
                      * backend prediction response.
                      *
                      * If source/destination are unavailable,
                      * fall back to route ID.
                      */
                      const routeName =
                        prediction?.source &&
                        prediction?.destination
                          ? `${prediction.source} → ${prediction.destination}`
                          : prediction?.route_name ||
                            `Route #${prediction?.route_id || "?"}`;

                      const probabilityText =
                        probability !== null
                          ? `${(probability * 100).toFixed(1)}%`
                          : "N/A";

                      return (
                        <div
                          className="operation-row"
                          key={
                            prediction?.id ||
                            prediction?.route_id
                          }
                          style={{
                            alignItems: "flex-start",
                            gap: "20px",
                          }}
                        >

                          {/* ROUTE */}

                          <div
                            style={{
                              minWidth: "300px",
                            }}
                          >

                            <strong>
                              {routeName}
                            </strong>

                            <small>
                              Route ID:{" "}
                              {prediction?.route_id ||
                                "N/A"}
                            </small>

                            <small>
                              Model:{" "}
                              {prediction?.model_version ||
                                "Unknown"}
                            </small>

                          </div>


                          {/* PROBABILITY */}

                          <div
                            style={{
                              minWidth: "180px",
                            }}
                          >

                            <small>
                              DISRUPTION PROBABILITY
                            </small>

                            <strong>
                              {probabilityText}
                            </strong>

                            {probability !== null && (
                              <div
                                style={{
                                  width: "140px",
                                  height: "6px",
                                  marginTop: "8px",
                                  background:
                                    "rgba(255,255,255,0.08)",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                }}
                              >

                                <div
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        probability * 100,
                                        0
                                      ),
                                      100
                                    )}%`,
                                    height: "100%",
                                    background:
                                      "currentColor",
                                    borderRadius: "10px",
                                  }}
                                />

                              </div>
                            )}

                          </div>


                          {/* RISK */}

                          <div
                            style={{
                              minWidth: "120px",
                            }}
                          >

                            <small>
                              RISK LEVEL
                            </small>

                            <span>
                              {riskLevel}
                            </span>

                          </div>


                          {/* DISRUPTION */}

                          <div
                            style={{
                              minWidth: "190px",
                            }}
                          >

                            <small>
                              PREDICTED DISRUPTION
                            </small>

                            <strong>
                              {disruptionType}
                            </strong>

                            <small>
                              Expected delay:{" "}
                              {expectedDelay !== null
                                ? `${expectedDelay} min`
                                : "N/A"}
                            </small>

                          </div>

                        </div>
                      );
                    })

                  ) : (

                    <div className="empty">
                      No route predictions available.
                    </div>

                  )}

                </div>

              </section>


              {/* =================================================
                  HIGH RISK CORRIDORS
              ================================================= */}

              <section className="operation-panel">

                <div className="operation-panel-header">

                  <span>
                    HIGH RISK CORRIDORS
                  </span>

                  <h2>
                    Risk Classified Roads
                  </h2>

                  <small>
                    {highRiskRoads.length} high-risk corridors identified
                  </small>

                </div>

                <div className="operation-list">

                  {highRiskRoads.length > 0 ? (

                    highRiskRoads.map((road) => {

                      const riskLevel = String(
                        road?.risk_level ||
                          "HIGH"
                      ).toUpperCase();

                      const status = String(
                        road?.current_status ||
                          "UNKNOWN"
                      ).toUpperCase();

                      return (
                        <div
                          className="operation-row"
                          key={
                            road?.id ||
                            road?.name
                          }
                          style={{
                            alignItems: "flex-start",
                            gap: "20px",
                          }}
                        >

                          <div
                            style={{
                              minWidth: "300px",
                            }}
                          >

                            <strong>
                              {road?.name ||
                                "High Risk Road"}
                            </strong>

                            <small>
                              Road ID:{" "}
                              {road?.id ||
                                "N/A"}
                            </small>

                          </div>


                          <div
                            style={{
                              minWidth: "160px",
                            }}
                          >

                            <small>
                              CURRENT STATUS
                            </small>

                            <span>
                              {status}
                            </span>

                          </div>


                          <div
                            style={{
                              minWidth: "130px",
                            }}
                          >

                            <small>
                              RISK LEVEL
                            </small>

                            <span>
                              {riskLevel}
                            </span>

                          </div>

                        </div>
                      );
                    })

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
              {/* DISTRICT CONNECTIVITY */}
              <section className="operation-panel">

                <div className="operation-panel-header">
                  <span>EMERGENCY CONNECTIVITY</span>
                  <h2>District Accessibility</h2>
                  <small>
                    Current accessibility status across monitored NER districts
                  </small>
                </div>

                <div className="operation-list">

                  {districts.length > 0 ? (
                    districts.map((district) => {

                      const connectivity = String(
                        district?.connectivity_status || "UNKNOWN"
                      ).toUpperCase();

                      const displayConnectivity = connectivity.replaceAll("_", " ");

                      return (
                        <div
                          className="operation-row"
                          key={district?.id || district?.name}
                          style={{
                            alignItems: "flex-start",
                            gap: "20px",
                          }}
                        >

                          <div style={{ minWidth: "320px" }}>
                            <strong>
                              {district?.name || "Unknown District"}
                            </strong>

                            <small>
                              {district?.state || "State unavailable"}
                            </small>

                            <small>
                              District ID: {district?.id || "N/A"}
                            </small>
                          </div>


                          <div style={{ minWidth: "220px" }}>
                            <small>CONNECTIVITY STATUS</small>

                            <strong>
                              {displayConnectivity}
                            </strong>
                          </div>


                          <div style={{ flex: 1 }}>
                            <small>EMERGENCY ACCESS</small>

                            <span>
                              {connectivity === "CONNECTED"
                                ? "Emergency movement available"
                                : connectivity === "PARTIALLY_CONNECTED"
                                ? "Movement possible with restrictions"
                                : connectivity === "DISCONNECTED"
                                ? "Emergency access disrupted"
                                : "Status requires verification"}
                            </span>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="empty">
                      No district connectivity data available.
                    </div>
                  )}

                </div>

              </section>


              {/* EMERGENCY ROADS */}
              <section className="operation-panel">

                <div className="operation-panel-header">
                  <span>EMERGENCY ROUTES</span>
                  <h2>Operational Road Corridors</h2>

                  <small>
                    {
                      roads.filter((road) => {
                        const status = String(
                          road?.current_status || ""
                        ).toUpperCase();

                        return (
                          status === "OPEN" ||
                          status === "PARTIALLY_BLOCKED"
                        );
                      }).length
                    } roads currently available for emergency movement
                  </small>
                </div>


                <div className="operation-list">

                  {roads.filter((road) => {

                    const status = String(
                      road?.current_status || ""
                    ).toUpperCase();

                    return (
                      status === "OPEN" ||
                      status === "PARTIALLY_BLOCKED"
                    );

                  }).length > 0 ? (

                    roads
                      .filter((road) => {

                        const status = String(
                          road?.current_status || ""
                        ).toUpperCase();

                        return (
                          status === "OPEN" ||
                          status === "PARTIALLY_BLOCKED"
                        );

                      })
                      .map((road) => {

                        const status = String(
                          road?.current_status || "UNKNOWN"
                        ).toUpperCase();

                        const risk = String(
                          road?.risk_level || "UNKNOWN"
                        ).toUpperCase();

                        return (
                          <div
                            className="operation-row"
                            key={road?.id || road?.name}
                            style={{
                              alignItems: "flex-start",
                              gap: "20px",
                            }}
                          >

                            <div style={{ minWidth: "320px" }}>
                              <strong>
                                {road?.name || "Emergency Corridor"}
                              </strong>

                              <small>
                                Road ID: {road?.id || "N/A"}
                              </small>

                              <small>
                                Type: {road?.road_type || "Road"}
                              </small>
                            </div>


                            <div style={{ minWidth: "220px" }}>
                              <small>CURRENT STATUS</small>

                              <strong>
                                {status.replaceAll("_", " ")}
                              </strong>
                            </div>


                            <div style={{ minWidth: "150px" }}>
                              <small>RISK LEVEL</small>

                              <span>
                                {risk}
                              </span>
                            </div>


                            <div style={{ flex: 1 }}>
                              <small>EMERGENCY USE</small>

                              <span>
                                {status === "OPEN"
                                  ? "Recommended for emergency movement"
                                  : "Use with caution and field verification"}
                              </span>
                            </div>

                          </div>
                        );
                      })

                  ) : (

                    <div className="empty">
                      No operational emergency corridors available.
                    </div>

                  )}

                </div>

              </section>


              {/* BLOCKED ROADS */}
              <section className="operation-panel">

                <div className="operation-panel-header">
                  <span>ROAD BLOCKAGES</span>
                  <h2>Blocked & Restricted Corridors</h2>

                  <small>
                    {
                      roads.filter((road) => {

                        const status = String(
                          road?.current_status || ""
                        ).toUpperCase();

                        return (
                          status === "BLOCKED" ||
                          status === "PARTIALLY_BLOCKED" ||
                          status === "UNDER_REPAIR"
                        );

                      }).length
                    } corridors require operational attention
                  </small>
                </div>


                <div className="operation-list">

                  {roads.filter((road) => {

                    const status = String(
                      road?.current_status || ""
                    ).toUpperCase();

                    return (
                      status === "BLOCKED" ||
                      status === "PARTIALLY_BLOCKED" ||
                      status === "UNDER_REPAIR"
                    );

                  }).length > 0 ? (

                    roads
                      .filter((road) => {

                        const status = String(
                          road?.current_status || ""
                        ).toUpperCase();

                        return (
                          status === "BLOCKED" ||
                          status === "PARTIALLY_BLOCKED" ||
                          status === "UNDER_REPAIR"
                        );

                      })
                      .map((road) => {

                        const status = String(
                          road?.current_status || "UNKNOWN"
                        ).toUpperCase();

                        const risk = String(
                          road?.risk_level || "UNKNOWN"
                        ).toUpperCase();

                        return (
                          <div
                            className="operation-row"
                            key={road?.id || road?.name}
                            style={{
                              alignItems: "flex-start",
                              gap: "20px",
                            }}
                          >

                            <div style={{ minWidth: "320px" }}>
                              <strong>
                                {road?.name || "Blocked Corridor"}
                              </strong>

                              <small>
                                Road ID: {road?.id || "N/A"}
                              </small>

                              <small>
                                Condition score:{" "}
                                {road?.condition_score ?? "N/A"}
                              </small>
                            </div>


                            <div style={{ minWidth: "220px" }}>
                              <small>ROAD STATUS</small>

                              <strong>
                                {status.replaceAll("_", " ")}
                              </strong>
                            </div>


                            <div style={{ minWidth: "150px" }}>
                              <small>RISK LEVEL</small>

                              <span>
                                {risk}
                              </span>
                            </div>


                            <div style={{ flex: 1 }}>
                              <small>RECOMMENDED ACTION</small>

                              <span>
                                {status === "BLOCKED"
                                  ? "Avoid corridor — identify alternate route"
                                  : status === "PARTIALLY_BLOCKED"
                                  ? "Proceed only after field verification"
                                  : "Use alternate route during repair"}
                              </span>
                            </div>

                          </div>
                        );
                      })

                  ) : (

                    <div className="empty">
                      No blocked or restricted roads reported.
                    </div>

                  )}

                </div>

              </section>


              {/* PRIORITY EMERGENCY CORRIDORS */}
              <section className="operation-panel">

                <div className="operation-panel-header">
                  <span>PRIORITY CORRIDORS</span>
                  <h2>Emergency Movement Priority</h2>

                  <small>
                    Open and partially blocked roads ranked by operational risk
                  </small>
                </div>


                <div className="operation-list">

                  {roads
                    .filter((road) => {

                      const status = String(
                        road?.current_status || ""
                      ).toUpperCase();

                      return (
                        status === "OPEN" ||
                        status === "PARTIALLY_BLOCKED"
                      );

                    })
                    .sort((a, b) => {

                      const riskOrder = {
                        CRITICAL: 4,
                        HIGH: 3,
                        MEDIUM: 2,
                        LOW: 1,
                      };

                      return (
                        (riskOrder[
                          String(b?.risk_level || "").toUpperCase()
                        ] || 0) -
                        (riskOrder[
                          String(a?.risk_level || "").toUpperCase()
                        ] || 0)
                      );

                    })
                    .slice(0, 5)
                    .map((road) => {

                      const status = String(
                        road?.current_status || "UNKNOWN"
                      ).toUpperCase();

                      const risk = String(
                        road?.risk_level || "UNKNOWN"
                      ).toUpperCase();

                      return (
                        <div
                          className="operation-row"
                          key={`priority-${road?.id || road?.name}`}
                          style={{
                            alignItems: "flex-start",
                            gap: "20px",
                          }}
                        >

                          <div style={{ minWidth: "360px" }}>
                            <strong>
                              {road?.name || "Priority Corridor"}
                            </strong>

                            <small>
                              Road ID: {road?.id || "N/A"}
                            </small>
                          </div>


                          <div style={{ minWidth: "180px" }}>
                            <small>RISK</small>

                            <strong>
                              {risk}
                            </strong>
                          </div>


                          <div style={{ minWidth: "220px" }}>
                            <small>ACCESS</small>

                            <span>
                              {status.replaceAll("_", " ")}
                            </span>
                          </div>


                          <div style={{ flex: 1 }}>
                            <small>OPERATIONS</small>

                            <span>
                              {status === "OPEN"
                                ? "Preferred emergency corridor"
                                : "Restricted emergency movement"}
                            </span>
                          </div>

                        </div>
                      );
                    })}

                </div>

              </section>
            </>
          )}

            {/* =================================================
                FIELD REPORTS
            ================================================= */}

            {config.type === "incident" && (
              <>
                {/* =================================================
                    REPORT INCIDENT
                ================================================= */}

                <section className="operation-panel">

                  <div
                    className="operation-panel-header"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >

                    <div>
                      <span>
                        FIELD OPERATIONS
                      </span>

                      <h2>
                        Report Incident
                      </h2>

                      <small>
                        Submit a geo-tagged field observation from the NER network.
                      </small>
                    </div>

                    <button
                      type="button"
                      className="incident-submit-btn"
                      onClick={() =>
                        setShowIncidentForm(
                          (previous) => !previous
                        )
                      }
                      disabled={incidentSubmitting}
                    >
                      {showIncidentForm
                        ? "CLOSE FORM"
                        : "REPORT INCIDENT"}
                    </button>

                  </div>


                  {/* =================================================
                      FIELD REPORT FORM
                  ================================================= */}

                  {showIncidentForm && (
                    <form
                      className="incident-form"
                      onSubmit={
                        handleIncidentSubmit
                      }
                    >

                      {/* FORM GRID */}

                      <div className="incident-form-grid">

                        {/* REPORT TYPE */}

                        <div className="incident-field">

                          <label htmlFor="reportType">
                            REPORT TYPE
                          </label>

                          <select
                            id="reportType"
                            name="reportType"
                            value={
                              incidentForm.reportType
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
                              Select report type
                            </option>

                            <option value="LANDSLIDE">
                              LANDSLIDE
                            </option>

                            <option value="FLOOD">
                              FLOOD
                            </option>

                            <option value="ROAD_DAMAGE">
                              ROAD DAMAGE
                            </option>

                            <option value="BRIDGE_DAMAGE">
                              BRIDGE DAMAGE
                            </option>

                            <option value="HEAVY_RAIN">
                              HEAVY RAIN
                            </option>

                            <option value="TRAFFIC">
                              TRAFFIC
                            </option>

                            <option value="OTHER">
                              OTHER
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


                        {/* PHOTO */}

                        <div className="incident-field">

                          <label htmlFor="photo">
                            FIELD PHOTO
                          </label>

                          <input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                              handleIncidentChange
                            }
                            disabled={
                              incidentSubmitting
                            }
                          />

                          <small>
                            JPG, PNG or WEBP • Maximum 5 MB
                          </small>

                        </div>

                      </div>


                      {/* =================================================
                          DESCRIPTION
                      ================================================= */}

                      <div className="incident-field incident-description">

                        <label htmlFor="description">
                          FIELD OBSERVATION
                        </label>

                        <textarea
                          id="description"
                          name="description"
                          rows="5"
                          placeholder="Describe what you observed at the location..."
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


                      {/* =================================================
                          SELECTED PHOTO
                      ================================================= */}

                      {incidentForm.photo && (
                        <div
                          style={{
                            marginTop: "14px",
                            padding: "12px 14px",
                            border:
                              "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "8px",
                          }}
                        >

                          <small>
                            SELECTED PHOTO
                          </small>

                          <div
                            style={{
                              marginTop: "6px",
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems: "center",
                              gap: "15px",
                              flexWrap: "wrap",
                            }}
                          >

                            <span>
                              {incidentForm.photo.name}
                            </span>

                            <span>
                              {(
                                incidentForm.photo.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </span>

                          </div>

                        </div>
                      )}


                      {/* =================================================
                          FORM ERROR
                      ================================================= */}

                      {incidentError && (
                        <div
                          className="incident-form-error"
                          style={{
                            marginTop: "15px",
                          }}
                        >
                          {incidentError}
                        </div>
                      )}


                      {/* =================================================
                          FORM SUCCESS
                      ================================================= */}

                      {incidentSuccess && (
                        <div
                          className="incident-form-success"
                          style={{
                            marginTop: "15px",
                          }}
                        >
                          {incidentSuccess}
                        </div>
                      )}


                      {/* =================================================
                          SUBMIT
                      ================================================= */}

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
                            : "SUBMIT FIELD REPORT"}
                        </button>

                      </div>

                    </form>
                  )}

                </section>


                {/* =================================================
                    SUBMITTED FIELD REPORTS
                ================================================= */}

                <section className="operation-panel">

                  <div className="operation-panel-header">

                    <span>
                      FIELD OPERATIONS
                    </span>

                    <h2>
                      Geo-tagged Field Reports
                    </h2>

                    <small>
                      Reports submitted from field operations across the NER network.
                    </small>

                  </div>


                  <div className="operation-list">

                    {fieldReports.length > 0 ? (

                      fieldReports.map((report) => {

                        const reportType =
                          String(
                            report?.report_type ||
                              "OTHER"
                          )
                            .replaceAll(
                              "_",
                              " "
                            )
                            .toUpperCase();


                        const syncStatus =
                          String(
                            report?.sync_status ||
                              "UNKNOWN"
                          ).toUpperCase();


                        const latitude =
                          report?.latitude !== null &&
                          report?.latitude !== undefined
                            ? Number(
                                report.latitude
                              ).toFixed(4)
                            : "N/A";


                        const longitude =
                          report?.longitude !== null &&
                          report?.longitude !== undefined
                            ? Number(
                                report.longitude
                              ).toFixed(4)
                            : "N/A";


                        return (

                          <div
                            className="operation-row"
                            key={report?.id}
                            style={{
                              alignItems:
                                "flex-start",
                              gap: "20px",
                            }}
                          >

                            {/* =================================
                                REPORT INFORMATION
                            ================================= */}

                            <div
                              style={{
                                minWidth: "260px",
                              }}
                            >

                              <strong>
                                {reportType}
                              </strong>

                              <small>
                                Report ID: #
                                {report?.id ||
                                  "N/A"}
                              </small>

                              <small>
                                {report?.reported_by_name ||
                                  "Unknown reporter"}
                              </small>

                            </div>


                            {/* =================================
                                FIELD OBSERVATION
                            ================================= */}

                            <div
                              style={{
                                minWidth: "300px",
                                flex: 1,
                              }}
                            >

                              <small>
                                FIELD OBSERVATION
                              </small>

                              <span>
                                {report?.description ||
                                  "No description provided."}
                              </span>

                            </div>


                            {/* =================================
                                GPS
                            ================================= */}

                            <div
                              style={{
                                minWidth: "190px",
                              }}
                            >

                              <small>
                                GPS LOCATION
                              </small>

                              <strong>
                                {latitude},{" "}
                                {longitude}
                              </strong>

                              <small>
                                Geo-tagged
                              </small>

                            </div>


                            {/* =================================
                                SYNC STATUS
                            ================================= */}

                            <div
                              style={{
                                minWidth: "120px",
                              }}
                            >

                              <small>
                                SYNC STATUS
                              </small>

                              <span>
                                {syncStatus}
                              </span>

                            </div>


                            {/* =================================
                                PHOTO
                            ================================= */}

                            <div
                              style={{
                                minWidth: "120px",
                              }}
                            >

                              <small>
                                PHOTO
                              </small>

                              {report?.photo_url ? (

                                <a
                                  href={
                                    report.photo_url.startsWith(
                                      "http"
                                    )
                                      ? report.photo_url
                                      : `http://localhost:5000${report.photo_url}`
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display:
                                      "inline-block",
                                    marginTop: "4px",
                                  }}
                                >
                                  VIEW PHOTO
                                </a>

                              ) : (

                                <span>
                                  NOT ATTACHED
                                </span>

                              )}

                            </div>

                          </div>

                        );

                      })

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