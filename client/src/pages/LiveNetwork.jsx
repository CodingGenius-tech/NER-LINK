import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import { useAuth } from "../context/AuthContext";
import { getVehicleLocations } from "../services/vehicleLocation.service";

import "leaflet/dist/leaflet.css";
import "./LiveNetwork.css";

/* =========================================================
   NORTHEAST INDIA
   ========================================================= */

const NORTHEAST_CENTER = [25.95, 94.2];

const NORTHEAST_BOUNDS = [
  [21.5, 88.0],
  [30.0, 98.0],
];

/*
  Initial view is deliberately tighter than the maximum bounds.
*/
const INITIAL_BOUNDS = [
  [22.8, 88.9],
  [29.7, 97.5],
];

/*
  Northeast states.
  These are used as the visible geographic mask.
*/
const NORTHEAST_STATES = [
  {
    name: "Sikkim",
    positions: [
      [27.58, 88.02],
      [28.13, 88.68],
      [27.99, 89.12],
      [27.42, 88.91],
      [27.08, 88.62],
      [27.15, 88.19],
    ],
  },

  {
    name: "Arunachal Pradesh",
    positions: [
      [28.35, 92.00],
      [29.48, 94.70],
      [29.50, 97.10],
      [28.20, 97.45],
      [27.10, 96.20],
      [27.05, 94.90],
      [27.50, 93.80],
      [27.20, 92.60],
    ],
  },

  {
    name: "Assam",
    positions: [
      [27.95, 89.70],
      [28.25, 92.10],
      [27.45, 93.55],
      [27.10, 95.10],
      [27.20, 96.10],
      [26.40, 96.05],
      [25.55, 95.20],
      [24.90, 94.10],
      [24.45, 92.50],
      [24.65, 91.00],
      [25.20, 89.85],
      [26.00, 89.60],
    ],
  },

  {
    name: "Nagaland",
    positions: [
      [27.05, 93.35],
      [27.20, 95.55],
      [26.65, 95.95],
      [25.70, 95.85],
      [25.20, 95.10],
      [25.25, 93.60],
      [26.00, 93.30],
    ],
  },

  {
    name: "Manipur",
    positions: [
      [25.65, 93.15],
      [25.70, 94.95],
      [24.80, 95.35],
      [23.85, 94.45],
      [24.00, 93.20],
      [24.85, 93.00],
    ],
  },

  {
    name: "Mizoram",
    positions: [
      [24.55, 92.25],
      [24.05, 93.05],
      [23.55, 93.35],
      [22.90, 92.70],
      [22.45, 92.25],
      [22.95, 91.60],
      [23.75, 92.00],
    ],
  },

  {
    name: "Tripura",
    positions: [
      [24.55, 91.60],
      [24.00, 92.15],
      [23.45, 92.05],
      [22.95, 91.45],
      [23.45, 91.05],
      [24.10, 91.10],
    ],
  },

  {
    name: "Meghalaya",
    positions: [
      [26.10, 89.80],
      [26.25, 91.00],
      [25.90, 92.15],
      [25.35, 92.55],
      [25.00, 91.75],
      [25.05, 90.55],
      [25.45, 89.90],
    ],
  },
];

/* =========================================================
   MAP CONTROLLER
   ========================================================= */

function MapController() {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(NORTHEAST_BOUNDS);
    map.options.maxBoundsViscosity = 1;

    map.fitBounds(INITIAL_BOUNDS, {
      padding: [10, 10],
      animate: false,
    });
  }, [map]);

  return null;
}

/* =========================================================
   VEHICLE ICON
   ========================================================= */

const createVehicleIcon = (status) => {
  const isDelayed =
    String(status || "").toLowerCase().includes("delay");

  const isStopped =
    String(status || "").toLowerCase().includes("stop");

  let className = "ner-vehicle-marker";

  if (isDelayed) {
    className += " ner-vehicle-delayed";
  } else if (isStopped) {
    className += " ner-vehicle-stopped";
  } else {
    className += " ner-vehicle-moving";
  }

  return L.divIcon({
    className: "ner-vehicle-icon-wrapper",
    html: `
      <div class="${className}">
        <span class="ner-vehicle-dot"></span>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
};

/* =========================================================
   SAFE COORDINATE HELPERS
   ========================================================= */

const getLatitude = (item) => {
  const value =
    item?.latitude ??
    item?.lat ??
    item?.location?.latitude ??
    item?.location?.lat;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const getLongitude = (item) => {
  const value =
    item?.longitude ??
    item?.lng ??
    item?.lon ??
    item?.location?.longitude ??
    item?.location?.lng ??
    item?.location?.lon;

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const isInsideNortheastBounds = (lat, lng) => {
  return (
    lat >= NORTHEAST_BOUNDS[0][0] &&
    lat <= NORTHEAST_BOUNDS[1][0] &&
    lng >= NORTHEAST_BOUNDS[0][1] &&
    lng <= NORTHEAST_BOUNDS[1][1]
  );
};

/* =========================================================
   LIVE NETWORK
   ========================================================= */

export default function LiveNetwork() {
  const { token } = useAuth();

  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadLocations = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await getVehicleLocations(token);

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        if (mounted) {
          setLocations(data);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Unable to load vehicle locations.");
        }
      }
    };

    loadLocations();

    const interval = setInterval(loadLocations, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  /*
    Only locations geographically inside the NER bounding region
    are allowed to become markers.
  */
  const visibleLocations = useMemo(() => {
    return locations.filter((item) => {
      const lat = getLatitude(item);
      const lng = getLongitude(item);

      if (lat === null || lng === null) {
        return false;
      }

      return isInsideNortheastBounds(lat, lng);
    });
  }, [locations]);

  return (
    <div className="live-network-map-page">
      <MapContainer
        center={NORTHEAST_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={11}
        maxBounds={NORTHEAST_BOUNDS}
        maxBoundsViscosity={1}
        worldCopyJump={false}
        zoomControl={true}
        attributionControl={true}
        className="live-network-map"
      >
        <MapController />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />

        {/* =================================================
            NORTHEAST STATE MASK / BOUNDARIES

            These polygons visually restrict the useful map
            area to the eight Northeast states.
           ================================================= */}

        {NORTHEAST_STATES.map((state) => (
          <Polygon
            key={state.name}
            positions={state.positions}
            pathOptions={{
              color: "#00e5a8",
              weight: 1,
              opacity: 0.35,
              fillColor: "#00e5a8",
              fillOpacity: 0.025,
            }}
          />
        ))}

        {/* =================================================
            LIVE VEHICLE MARKERS
           ================================================= */}

        {visibleLocations.map((vehicle, index) => {
          const lat = getLatitude(vehicle);
          const lng = getLongitude(vehicle);

          const vehicleId =
            vehicle?.vehicle_id ??
            vehicle?.vehicleId ??
            vehicle?.id ??
            `vehicle-${index}`;

          const status =
            vehicle?.status ??
            vehicle?.vehicle_status ??
            "Moving";

          return (
            <Marker
              key={`${vehicleId}-${index}`}
              position={[lat, lng]}
              icon={createVehicleIcon(status)}
            >
              <Popup>
                <div className="ner-vehicle-popup">
                  <strong>
                    {vehicle?.vehicle_number ??
                      vehicle?.vehicleNumber ??
                      vehicle?.registration_number ??
                      "Vehicle"}
                  </strong>

                  <span>
                    Status: {status}
                  </span>

                  <span>
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {error && (
        <div className="live-network-map-error">
          {error}
        </div>
      )}
    </div>
  );
}