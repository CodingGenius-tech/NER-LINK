import { useEffect, useMemo, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import { useAuth } from "../context/AuthContext";
import { getVehicleLocations } from "../services/vehicleLocation.service";

import "leaflet/dist/leaflet.css";
import "./LiveNetwork.css";


// =====================================================
// NORTHEAST INDIA MAP CENTER
// =====================================================

const NORTHEAST_CENTER = [26.2, 92.9];


// =====================================================
// CREATE VEHICLE MARKER
// =====================================================

const createVehicleIcon = (status) => {

  const normalizedStatus =
    String(status || "").toUpperCase();

  let className = "vehicle-marker";

  if (normalizedStatus.includes("DELAY")) {

    className += " vehicle-marker-delayed";

  } else if (
    normalizedStatus.includes("MOV") ||
    normalizedStatus === "ACTIVE" ||
    normalizedStatus === "IN_TRANSIT"
  ) {

    className += " vehicle-marker-moving";

  }

  return L.divIcon({

    className: "",

    html: `
      <div class="${className}">
        <span></span>
      </div>
    `,

    iconSize: [20, 20],

    iconAnchor: [10, 10],

    popupAnchor: [0, -10],

  });

};


// =====================================================
// MAP CONTROLLER
// Automatically adjusts map to vehicle locations
// =====================================================

function MapController({ locations }) {

  const map = useMap();

  useEffect(() => {

    const validLocations =
      locations.filter((location) => {

        const latitude =
          location.latitude ??
          location.lat;

        const longitude =
          location.longitude ??
          location.lng ??
          location.lon;

        return (
          Number.isFinite(Number(latitude)) &&
          Number.isFinite(Number(longitude))
        );

      });


    if (!validLocations.length) {
      return;
    }


    const bounds =
      validLocations.map((location) => {

        const latitude =
          Number(
            location.latitude ??
            location.lat
          );

        const longitude =
          Number(
            location.longitude ??
            location.lng ??
            location.lon
          );

        return [
          latitude,
          longitude,
        ];

      });


    map.fitBounds(bounds, {

      padding: [40, 40],

      maxZoom: 10,

    });

  }, [locations, map]);


  return null;

}


// =====================================================
// LIVE NETWORK PAGE
// =====================================================

function LiveNetwork() {

  const { token } = useAuth();


  // ===================================================
  // STATE
  // ===================================================

  const [locations, setLocations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);


  // ===================================================
  // LOAD VEHICLE GPS DATA
  // ===================================================

  const loadLocations = async () => {

    if (!token) {
      return;
    }


    try {

      setError("");

      const response =
        await getVehicleLocations(token);

      const data =
        response.data || [];

      setLocations(data);

      setLastUpdated(
        new Date()
      );

    } catch (error) {

      console.error(
        "Vehicle locations loading failed:",
        error
      );

      setError(
        error.message ||
        "Failed to load vehicle locations"
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // INITIAL GPS DATA LOAD
  // ===================================================

  useEffect(() => {

    loadLocations();

  }, [token]);


  // ===================================================
  // AUTO REFRESH
  // Refresh GPS data every 5 seconds
  // ===================================================

  useEffect(() => {

    if (!token) {
      return;
    }


    const interval =
      setInterval(() => {

        loadLocations();

      }, 5000);


    return () => {

      clearInterval(interval);

    };

  }, [token]);


  // ===================================================
  // VALID GPS LOCATIONS
  // ===================================================

  const validLocations =
    useMemo(() => {

      return locations.filter(
        (location) => {

          const latitude =
            Number(
              location.latitude ??
              location.lat
            );

          const longitude =
            Number(
              location.longitude ??
              location.lng ??
              location.lon
            );


          return (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
          );

        }
      );

    }, [locations]);


  // ===================================================
  // MOVING VEHICLES
  // ===================================================

  const movingVehicles =
    useMemo(() => {

      return locations.filter(
        (location) => {

          const status =
            String(
              location.status ||
              location.vehicle_status ||
              ""
            ).toUpperCase();


          return (
            status.includes("MOV") ||
            status === "IN_TRANSIT" ||
            status === "ACTIVE"
          );

        }
      );

    }, [locations]);


  // ===================================================
  // DELAYED VEHICLES
  // ===================================================

  const delayedVehicles =
    useMemo(() => {

      return locations.filter(
        (location) => {

          const status =
            String(
              location.status ||
              location.vehicle_status ||
              ""
            ).toUpperCase();


          return status.includes(
            "DELAY"
          );

        }
      );

    }, [locations]);


  // ===================================================
  // UNIQUE VEHICLES
  // ===================================================

  const uniqueVehicles =
    useMemo(() => {

      const ids = new Set();


      locations.forEach(
        (location) => {

          if (location.vehicle_id) {

            ids.add(
              location.vehicle_id
            );

          } else if (
            location.vehicleId
          ) {

            ids.add(
              location.vehicleId
            );

          }

        }
      );


      return ids.size;

    }, [locations]);


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (

      <div className="live-network-page">

        <div className="live-network-loading">

          <span></span>

          Connecting to NER GPS network...

        </div>

      </div>

    );

  }


  // ===================================================
  // ERROR SCREEN
  // ===================================================

  if (error) {

    return (

      <div className="live-network-page">

        <div className="live-network-error">

          <h2>
            Unable to load Live Network
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={loadLocations}
          >
            Retry
          </button>

        </div>

      </div>

    );

  }


  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (

    <div className="live-network-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="live-network-header">

        <div>

          <div className="live-network-label">

            <span></span>

            LIVE GPS NETWORK

          </div>


          <h1>
            Northeast India Fleet
          </h1>


          <p>
            Real-time vehicle visibility
            across the North Eastern Region.
          </p>

        </div>


        <div className="live-network-count">

          <span className="live-indicator"></span>

          LIVE

          <span className="record-count">

            {locations.length} vehicles

          </span>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="network-summary">


        <div className="network-summary-card">

          <span>
            GPS RECORDS
          </span>

          <strong>
            {locations.length}
          </strong>

        </div>


        <div className="network-summary-card">

          <span>
            VEHICLES
          </span>

          <strong>
            {uniqueVehicles ||
              locations.length}
          </strong>

        </div>


        <div className="network-summary-card">

          <span>
            MOVING
          </span>

          <strong className="moving-number">

            {movingVehicles.length}

          </strong>

        </div>


        <div className="network-summary-card">

          <span>
            DELAYED
          </span>

          <strong className="delayed-number">

            {delayedVehicles.length}

          </strong>

        </div>


      </div>


      {/* =================================================
          GPS MAP
      ================================================= */}

      <section className="gps-map-panel">


        {/* MAP HEADER */}

        <div className="gps-map-header">

          <div>

            <span>
              REGIONAL GPS VISUALIZATION
            </span>

            <h2>
              Northeast India
            </h2>

          </div>


          <div className="map-status">

            <span></span>

            GPS STREAM ACTIVE

          </div>

        </div>


        {/* MAP */}

        <div className="gps-map">


          <MapContainer

            center={NORTHEAST_CENTER}

            zoom={6}

            scrollWheelZoom={true}

            className="leaflet-map"

          >


            {/* OpenStreetMap */}

            <TileLayer

              attribution='&copy; OpenStreetMap contributors'

              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

            />


            {/* Automatically fit vehicles */}

            <MapController
              locations={validLocations}
            />


            {/* ==========================================
                VEHICLE MARKERS
            ========================================== */}

            {validLocations.map(
              (location, index) => {


                const latitude =
                  Number(
                    location.latitude ??
                    location.lat
                  );


                const longitude =
                  Number(
                    location.longitude ??
                    location.lng ??
                    location.lon
                  );


                const status =
                  String(
                    location.status ||
                    location.vehicle_status ||
                    "UNKNOWN"
                  ).toUpperCase();


                const vehicleNumber =
                  location.vehicle_number ||
                  location.vehicleNumber ||
                  location.registration_number ||
                  `Vehicle ${
                    location.vehicle_id ||
                    index + 1
                  }`;


                const speed =
                  location.speed ??
                  location.speed_kmph ??
                  "—";


                const timestamp =
                  location.recorded_at ||
                  location.timestamp ||
                  location.created_at;


                return (

                  <Marker

                    key={
                      location.id ||
                      `${location.vehicle_id}-${index}`
                    }

                    position={[
                      latitude,
                      longitude,
                    ]}

                    icon={
                      createVehicleIcon(
                        status
                      )
                    }

                  >


                    {/* ==================================
                        VEHICLE POPUP
                    ================================== */}

                    <Popup>

                      <div className="vehicle-popup">

                        <strong>
                          {vehicleNumber}
                        </strong>


                        <div>
                          Vehicle ID:{" "}
                          {location.vehicle_id ||
                            location.vehicleId ||
                            "—"}
                        </div>


                        <div>
                          Status:{" "}
                          <b>
                            {status}
                          </b>
                        </div>


                        <div>
                          Speed:{" "}
                          {speed !== "—"
                            ? `${speed} km/h`
                            : "—"}
                        </div>


                        <div>
                          Latitude:{" "}
                          {latitude.toFixed(5)}
                        </div>


                        <div>
                          Longitude:{" "}
                          {longitude.toFixed(5)}
                        </div>


                        {timestamp && (

                          <div>

                            Updated:{" "}

                            {new Date(
                              timestamp
                            ).toLocaleString()}

                          </div>

                        )}

                      </div>

                    </Popup>

                  </Marker>

                );

              }
            )}

          </MapContainer>


          {/* =================================================
              MAP LEGEND
          ================================================= */}

          <div className="map-legend">


            <div>

              <span
                className="legend-dot moving"
              ></span>

              Moving

            </div>


            <div>

              <span
                className="legend-dot delayed"
              ></span>

              Delayed

            </div>


            <div>

              <span
                className="legend-dot inactive"
              ></span>

              Other

            </div>


          </div>


        </div>

      </section>


      {/* =================================================
          VEHICLE POSITION DATA
      ================================================= */}

      <section className="network-panel">


        <div className="network-panel-header">


          <div>

            <span>
              VEHICLE POSITION DATA
            </span>


            <h2>
              Active Network
            </h2>

          </div>


          <button
            className="refresh-button"
            onClick={loadLocations}
          >
            Refresh
          </button>


        </div>


        {/* ================================================
            EMPTY STATE
        ================================================= */}

        {!locations.length ? (

          <div className="network-empty">

            No vehicle GPS records available.

          </div>

        ) : (


          <div className="vehicle-location-list">


            {locations.map(
              (location, index) => {


                const status =
                  String(
                    location.status ||
                    location.vehicle_status ||
                    "UNKNOWN"
                  ).toUpperCase();


                const vehicleNumber =
                  location.vehicle_number ||
                  location.vehicleNumber ||
                  location.registration_number ||
                  `Vehicle ${
                    location.vehicle_id ||
                    index + 1
                  }`;


                const latitude =
                  location.latitude ??
                  location.lat ??
                  "—";


                const longitude =
                  location.longitude ??
                  location.lng ??
                  location.lon ??
                  "—";


                const speed =
                  location.speed ??
                  location.speed_kmph ??
                  "—";


                return (

                  <div

                    className="vehicle-location-row"

                    key={
                      location.id ||
                      `${location.vehicle_id}-${index}`
                    }

                  >


                    {/* VEHICLE */}

                    <div className="vehicle-main">


                      <div className="vehicle-symbol">
                        ●
                      </div>


                      <div>

                        <strong>
                          {vehicleNumber}
                        </strong>


                        <small>

                          Vehicle ID:{" "}

                          {location.vehicle_id ||
                            location.vehicleId ||
                            "—"}

                        </small>

                      </div>


                    </div>


                    {/* LATITUDE */}

                    <div className="location-value">

                      <span>
                        LATITUDE
                      </span>


                      <strong>
                        {latitude}
                      </strong>

                    </div>


                    {/* LONGITUDE */}

                    <div className="location-value">

                      <span>
                        LONGITUDE
                      </span>


                      <strong>
                        {longitude}
                      </strong>

                    </div>


                    {/* SPEED */}

                    <div className="location-value">

                      <span>
                        SPEED
                      </span>


                      <strong>

                        {speed !== "—"
                          ? `${speed} km/h`
                          : "—"}

                      </strong>

                    </div>


                    {/* STATUS */}

                    <div className="location-status">


                      <span

                        className={

                          status.includes("DELAY")

                            ? "status delayed"

                            : status.includes("MOV") ||
                              status === "ACTIVE" ||
                              status === "IN_TRANSIT"

                            ? "status moving"

                            : "status"

                        }

                      >

                        {status}

                      </span>


                    </div>


                  </div>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* =================================================
          NETWORK INFORMATION
      ================================================= */}

      <section className="network-info-panel">


        {/* NETWORK STATUS */}

        <div>

          <span>
            NETWORK STATUS
          </span>


          <strong>

            <i className="status-dot"></i>

            Operational

          </strong>

        </div>


        {/* REGION */}

        <div>

          <span>
            REGION
          </span>


          <strong>
            Northeast India
          </strong>

        </div>


        {/* LAST SYNC */}

        <div>

          <span>
            LAST GPS SYNC
          </span>


          <strong>

            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "—"}

          </strong>

        </div>


      </section>


    </div>

  );

}


export default LiveNetwork;