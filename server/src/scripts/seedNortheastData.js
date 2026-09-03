const { Client } = require("pg");
const path = require("path");

require("dotenv").config({
  path: path.resolve(process.cwd(), ".env"),
});

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ============================================================
// NER-LINK — NORTHEAST INDIA DATA SEED
// ============================================================
// This script:
// 1. Removes old operational/test data.
// 2. Preserves users.
// 3. Inserts Northeast India data only.
// 4. Creates at least 10 records in every major section.
// 5. Uses exact PostgreSQL enum values from the current schema.
// 6. Uses PostGIS for locations/geometries.
// ============================================================

const point = (lng, lat) => `
  ST_SetSRID(
    ST_MakePoint(${lng}, ${lat}),
    4326
  )
`;

const polygonAround = (lng, lat, size = 0.08) => `
  ST_SetSRID(
    ST_MakePolygon(
      ST_GeomFromText(
        'LINESTRING(
          ${lng - size} ${lat - size},
          ${lng + size} ${lat - size},
          ${lng + size} ${lat + size},
          ${lng - size} ${lat + size},
          ${lng - size} ${lat - size}
        )',
        4326
      )
    ),
    4326
  )
`;

async function main() {
  try {
    await client.connect();

    console.log("");
    console.log("==============================================");
    console.log(" NER-LINK NORTHEAST DATA SEED");
    console.log("==============================================");
    console.log("");

    await client.query("BEGIN");

    // =========================================================
    // EXISTING ACTIVE USER
    // =========================================================

    const userResult = await client.query(`
      SELECT id
      FROM users
      WHERE COALESCE(is_active, true) = true
      ORDER BY id
      LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      throw new Error(
        "No active user found. Please create/login with a user first."
      );
    }

    const userId = userResult.rows[0].id;

    console.log(`Using existing active user ID: ${userId}`);

    // =========================================================
    // REMOVE OLD OPERATIONAL DATA
    // USERS ARE NOT TOUCHED
    // =========================================================

    console.log("");
    console.log("Removing old operational/test data...");

    await client.query(`
      TRUNCATE TABLE
        notifications,
        alerts,
        field_reports,
        road_incidents,
        route_predictions,
        deliveries,
        vehicle_locations,
        vehicles,
        routes,
        roads,
        weather_data,
        districts
      RESTART IDENTITY CASCADE
    `);

    console.log("Old operational data removed.");

    // =========================================================
    // 1. DISTRICTS
    // =========================================================

    console.log("");
    console.log("[1/12] Creating Northeast districts...");

    const districts = [
      {
        name: "Kamrup Metropolitan",
        state: "Assam",
        lat: 26.1445,
        lng: 91.7362,
        connectivity: "CONNECTED",
      },
      {
        name: "Dibrugarh",
        state: "Assam",
        lat: 27.4728,
        lng: 94.912,
        connectivity: "CONNECTED",
      },
      {
        name: "Tawang",
        state: "Arunachal Pradesh",
        lat: 27.586,
        lng: 91.859,
        connectivity: "PARTIALLY_CONNECTED",
      },
      {
        name: "West Kameng",
        state: "Arunachal Pradesh",
        lat: 27.2646,
        lng: 92.424,
        connectivity: "PARTIALLY_CONNECTED",
      },
      {
        name: "East Khasi Hills",
        state: "Meghalaya",
        lat: 25.5788,
        lng: 91.8933,
        connectivity: "CONNECTED",
      },
      {
        name: "Kohima",
        state: "Nagaland",
        lat: 25.6751,
        lng: 94.1086,
        connectivity: "PARTIALLY_CONNECTED",
      },
      {
        name: "Imphal West",
        state: "Manipur",
        lat: 24.817,
        lng: 93.9368,
        connectivity: "CONNECTED",
      },
      {
        name: "Aizawl",
        state: "Mizoram",
        lat: 23.7271,
        lng: 92.7176,
        connectivity: "PARTIALLY_CONNECTED",
      },
      {
        name: "West Tripura",
        state: "Tripura",
        lat: 23.8315,
        lng: 91.2868,
        connectivity: "CONNECTED",
      },
      {
        name: "Gangtok",
        state: "Sikkim",
        lat: 27.3389,
        lng: 88.6065,
        connectivity: "PARTIALLY_CONNECTED",
      },
    ];

    const districtIds = [];

    for (const district of districts) {
      const result = await client.query(
        `
        INSERT INTO districts (
          name,
          state,
          geometry,
          connectivity_status
        )
        VALUES (
          $1,
          $2,
          ${polygonAround(district.lng, district.lat)},
          $3
        )
        RETURNING id
        `,
        [
          district.name,
          district.state,
          district.connectivity,
        ]
      );

      districtIds.push(result.rows[0].id);
    }

    console.log(`Created ${districtIds.length} districts.`);

    // =========================================================
    // 2. ROADS
    // =========================================================

    console.log("");
    console.log("[2/12] Creating Northeast roads...");

    const roads = [
      {
        name: "NH-27 Guwahati-Dibrugarh Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[0],
        lat: 26.8,
        lng: 92.7,
        status: "OPEN",
        risk: "MEDIUM",
        speed: 70,
        condition: 82,
      },
      {
        name: "NH-15 Tezpur-Dibrugarh Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[1],
        lat: 27.2,
        lng: 93.5,
        status: "PARTIALLY_BLOCKED",
        risk: "HIGH",
        speed: 60,
        condition: 68,
      },
      {
        name: "NH-13 Balipara-Tawang Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[2],
        lat: 27.4,
        lng: 92.3,
        status: "PARTIALLY_BLOCKED",
        risk: "CRITICAL",
        speed: 35,
        condition: 51,
      },
      {
        name: "Bhalukpong-Bomdila Road",
        type: "STATE_HIGHWAY",
        district: districtIds[3],
        lat: 27.05,
        lng: 92.35,
        status: "OPEN",
        risk: "HIGH",
        speed: 40,
        condition: 63,
      },
      {
        name: "NH-6 Shillong-Silchar Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[4],
        lat: 25.3,
        lng: 92.7,
        status: "OPEN",
        risk: "MEDIUM",
        speed: 55,
        condition: 76,
      },
      {
        name: "NH-2 Dimapur-Kohima Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[5],
        lat: 25.75,
        lng: 94.1,
        status: "PARTIALLY_BLOCKED",
        risk: "HIGH",
        speed: 45,
        condition: 61,
      },
      {
        name: "NH-2 Imphal-Kohima Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[6],
        lat: 25.15,
        lng: 94.0,
        status: "OPEN",
        risk: "MEDIUM",
        speed: 50,
        condition: 73,
      },
      {
        name: "NH-6 Sairang-Kolasib Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[7],
        lat: 23.9,
        lng: 92.65,
        status: "OPEN",
        risk: "MEDIUM",
        speed: 45,
        condition: 78,
      },
      {
        name: "NH-8 Agartala-Churaibari Corridor",
        type: "NATIONAL_HIGHWAY",
        district: districtIds[8],
        lat: 24.0,
        lng: 91.7,
        status: "OPEN",
        risk: "LOW",
        speed: 60,
        condition: 86,
      },
      {
        name: "Gangtok-Nathu La Road",
        type: "MOUNTAIN_ROAD",
        district: districtIds[9],
        lat: 27.4,
        lng: 88.75,
        status: "PARTIALLY_BLOCKED",
        risk: "HIGH",
        speed: 30,
        condition: 57,
      },
    ];

    const roadIds = [];

    for (const road of roads) {
      const result = await client.query(
        `
        INSERT INTO roads (
          name,
          road_type,
          district_id,
          geometry,
          current_status,
          risk_level,
          speed_limit,
          condition_score
        )
        VALUES (
          $1,
          $2,
          $3,
          ST_MakeLine(
            ST_SetSRID(
              ST_MakePoint($4 - 0.08, $5 - 0.04),
              4326
            ),
            ST_SetSRID(
              ST_MakePoint($4 + 0.08, $5 + 0.04),
              4326
            )
          ),
          $6,
          $7,
          $8,
          $9
        )
        RETURNING id
        `,
        [
          road.name,
          road.type,
          road.district,
          road.lng,
          road.lat,
          road.status,
          road.risk,
          road.speed,
          road.condition,
        ]
      );

      roadIds.push(result.rows[0].id);
    }

    console.log(`Created ${roadIds.length} roads.`);

    // =========================================================
    // 3. VEHICLES
    // =========================================================

    console.log("");
    console.log("[3/12] Creating Northeast fleet...");

    const vehicles = [
      ["AS01-NE-1001", "TRUCK", "Ranjit Das", "FOOD", 12000, "ACTIVE", 91.7362, 26.1445],
      ["AS01-NE-1002", "TRUCK", "Bikash Sharma", "MEDICINE", 9000, "ACTIVE", 94.912, 27.4728],
      ["AR01-NE-2001", "TRUCK", "Tashi Dorjee", "FOOD", 8000, "DELAYED", 91.859, 27.586],
      ["AR01-NE-2002", "UTILITY", "Pema Norbu", "CONSTRUCTION_MATERIAL", 7000, "ACTIVE", 92.424, 27.2646],
      ["ML05-NE-3001", "TRUCK", "Samuel Lyngdoh", "FOOD", 10000, "ACTIVE", 91.8933, 25.5788],
      ["NL01-NE-4001", "TRUCK", "Keneilhou Richa", "MEDICINE", 8500, "DELAYED", 94.1086, 25.6751],
      ["MN01-NE-5001", "TRUCK", "Somorjit Singh", "MEDICINE", 9500, "ACTIVE", 93.9368, 24.817],
      ["MZ01-NE-6001", "TRUCK", "Lalhminga", "FOOD", 7500, "STOPPED", 92.7176, 23.7271],
      ["TR01-NE-7001", "TRUCK", "Debasish Roy", "AGRICULTURAL_PRODUCE", 11000, "ACTIVE", 91.2868, 23.8315],
      ["SK01-NE-8001", "UTILITY", "Sonam Bhutia", "CONSTRUCTION_MATERIAL", 6000, "DELAYED", 88.6065, 27.3389],
    ];

    const vehicleIds = [];

    for (const vehicle of vehicles) {
      const [
        vehicleNumber,
        vehicleType,
        driverName,
        commodityType,
        capacity,
        status,
        lng,
        lat,
      ] = vehicle;

      const result = await client.query(
        `
        INSERT INTO vehicles (
          vehicle_number,
          vehicle_type,
          driver_name,
          commodity_type,
          capacity,
          status,
          current_location,
          last_location_update
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          ${point(lng, lat)},
          NOW()
        )
        RETURNING id
        `,
        [
          vehicleNumber,
          vehicleType,
          driverName,
          commodityType,
          capacity,
          status,
        ]
      );

      vehicleIds.push(result.rows[0].id);
    }

    console.log(`Created ${vehicleIds.length} vehicles.`);

    // =========================================================
    // 4. VEHICLE LOCATIONS
    // =========================================================

    console.log("");
    console.log("[4/12] Creating vehicle GPS locations...");

    const gpsLocations = [
      [vehicleIds[0], 91.78, 26.18, 54, 82],
      [vehicleIds[1], 94.88, 27.46, 47, 110],
      [vehicleIds[2], 91.91, 27.57, 21, 145],
      [vehicleIds[3], 92.45, 27.28, 38, 95],
      [vehicleIds[4], 91.84, 25.55, 52, 70],
      [vehicleIds[5], 94.02, 25.71, 31, 120],
      [vehicleIds[6], 93.98, 24.84, 48, 35],
      [vehicleIds[7], 92.68, 23.75, 0, 15],
      [vehicleIds[8], 91.31, 23.86, 57, 40],
      [vehicleIds[9], 88.64, 27.36, 24, 165],
    ];

    for (const [vehicleId, lng, lat, speed, heading] of gpsLocations) {
      await client.query(
        `
        INSERT INTO vehicle_locations (
          vehicle_id,
          location,
          speed,
          heading,
          recorded_at
        )
        VALUES (
          $1,
          ${point(lng, lat)},
          $2,
          $3,
          NOW()
        )
        `,
        [vehicleId, speed, heading]
      );

      await client.query(
        `
        UPDATE vehicles
        SET
          current_location = ${point(lng, lat)},
          last_location_update = NOW()
        WHERE id = $1
        `,
        [vehicleId]
      );
    }

    console.log("Created 10 vehicle GPS locations.");

    // =========================================================
    // 5. DELIVERIES
    // =========================================================

    console.log("");
    console.log("[5/12] Creating Northeast supply deliveries...");

    const deliveries = [
      [
        vehicleIds[0],
        "Guwahati Central Warehouse",
        "Dibrugarh District Hospital",
        "MEDICINE",
        "CRITICAL",
        4200,
        "IN_TRANSIT",
      ],
      [
        vehicleIds[1],
        "Dibrugarh Food Depot",
        "Tinsukia Relief Centre",
        "FOOD",
        "HIGH",
        7800,
        "IN_TRANSIT",
      ],
      [
        vehicleIds[2],
        "Tezpur Supply Hub",
        "Tawang Relief Centre",
        "FOOD",
        "CRITICAL",
        5300,
        "DELAYED",
      ],
      [
        vehicleIds[3],
        "Bhalukpong Logistics Point",
        "Bomdila District Store",
        "CONSTRUCTION_MATERIAL",
        "HIGH",
        6100,
        "IN_TRANSIT",
      ],
      [
        vehicleIds[4],
        "Shillong Central Depot",
        "Silchar Medical Store",
        "MEDICINE",
        "CRITICAL",
        3600,
        "IN_TRANSIT",
      ],
      [
        vehicleIds[5],
        "Dimapur Logistics Hub",
        "Kohima District Hospital",
        "MEDICINE",
        "HIGH",
        4100,
        "DELAYED",
      ],
      [
        vehicleIds[6],
        "Imphal Supply Depot",
        "Kohima Relief Centre",
        "FOOD",
        "HIGH",
        6900,
        "IN_TRANSIT",
      ],
      [
        vehicleIds[7],
        "Aizawl Food Depot",
        "Lunglei Relief Centre",
        "FOOD",
        "CRITICAL",
        4700,
        "DELAYED",
      ],
      [
        vehicleIds[8],
        "Agartala Central Store",
        "Khowai Relief Centre",
        "MEDICINE",
        "HIGH",
        3200,
        "DELIVERED",
      ],
      [
        vehicleIds[9],
        "Gangtok Supply Depot",
        "Namchi District Store",
        "CONSTRUCTION_MATERIAL",
        "NORMAL",
        5400,
        "IN_TRANSIT",
      ],
    ];

    const deliveryIds = [];

    for (let i = 0; i < deliveries.length; i++) {
      const [
        vehicleId,
        source,
        destination,
        commodityType,
        priority,
        quantity,
        status,
      ] = deliveries[i];

      const result = await client.query(
        `
        INSERT INTO deliveries (
          vehicle_id,
          source,
          destination,
          commodity_type,
          priority,
          quantity,
          status,
          expected_delivery_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          NOW() + ($8 * INTERVAL '1 hour')
        )
        RETURNING id
        `,
        [
          vehicleId,
          source,
          destination,
          commodityType,
          priority,
          quantity,
          status,
          3 + i,
        ]
      );

      deliveryIds.push(result.rows[0].id);
    }

    console.log(`Created ${deliveryIds.length} deliveries.`);

    // =========================================================
    // 6. ROUTES
    // =========================================================

    console.log("");
    console.log("[6/12] Creating route plans...");

    const routes = [
      [deliveryIds[0], 91.7362, 26.1445, 94.912, 27.4728, 440, 480, 22, "ACTIVE"],
      [deliveryIds[1], 94.912, 27.4728, 95.026, 27.489, 105, 130, 31, "ACTIVE"],
      [deliveryIds[2], 92.702, 27.1, 91.859, 27.586, 320, 620, 68, "ALTERNATE"],
      [deliveryIds[3], 92.64, 27.0, 92.42, 27.26, 160, 290, 48, "RECOMMENDED"],
      [deliveryIds[4], 91.8933, 25.5788, 92.778, 24.833, 295, 390, 28, "ACTIVE"],
      [deliveryIds[5], 93.72, 25.9, 94.1086, 25.6751, 70, 115, 55, "ALTERNATE"],
      [deliveryIds[6], 93.9368, 24.817, 94.1086, 25.6751, 150, 270, 39, "ACTIVE"],
      [deliveryIds[7], 92.7176, 23.7271, 92.735, 22.9, 170, 250, 26, "RECOMMENDED"],
      [deliveryIds[8], 91.2868, 23.8315, 91.61, 24.08, 145, 190, 14, "COMPLETED"],
      [deliveryIds[9], 88.6065, 27.3389, 88.28, 27.1, 75, 160, 46, "ALTERNATE"],
    ];

    const routeIds = [];

    for (const route of routes) {
      const [
        deliveryId,
        startLng,
        startLat,
        endLng,
        endLat,
        distance,
        estimatedTime,
        riskScore,
        routeStatus,
      ] = route;

      const result = await client.query(
        `
        INSERT INTO routes (
          delivery_id,
          start_location,
          end_location,
          route_geometry,
          distance_km,
          estimated_time_minutes,
          risk_score,
          route_status
        )
        VALUES (
          $1,
          ${point(startLng, startLat)},
          ${point(endLng, endLat)},
          ST_MakeLine(
            ${point(startLng, startLat)},
            ${point(endLng, endLat)}
          ),
          $2,
          $3,
          $4,
          $5
        )
        RETURNING id
        `,
        [
          deliveryId,
          distance,
          estimatedTime,
          riskScore,
          routeStatus,
        ]
      );

      routeIds.push(result.rows[0].id);
    }

    console.log(`Created ${routeIds.length} routes.`);

    // =========================================================
    // 7. ROUTE PREDICTIONS
    // =========================================================

    console.log("");
    console.log("[7/12] Creating AI route predictions...");

    const predictions = [
      [routeIds[0], 0.24, "MEDIUM", "HEAVY_RAIN", 28],
      [routeIds[1], 0.31, "MEDIUM", "ROAD_DAMAGE", 42],
      [routeIds[2], 0.76, "CRITICAL", "LANDSLIDE", 110],
      [routeIds[3], 0.58, "HIGH", "LANDSLIDE", 65],
      [routeIds[4], 0.27, "MEDIUM", "HEAVY_RAIN", 35],
      [routeIds[5], 0.63, "HIGH", "ROAD_DAMAGE", 70],
      [routeIds[6], 0.41, "MEDIUM", "HEAVY_RAIN", 48],
      [routeIds[7], 0.36, "MEDIUM", "FLOOD", 40],
      [routeIds[8], 0.18, "LOW", "HEAVY_RAIN", 12],
      [routeIds[9], 0.69, "HIGH", "LANDSLIDE", 95],
    ];

    const predictionIds = [];

    for (const [
      routeId,
      probability,
      riskLevel,
      disruptionType,
      delay,
    ] of predictions) {
      const result = await client.query(
        `
        INSERT INTO route_predictions (
          route_id,
          disruption_probability,
          risk_level,
          predicted_disruption_type,
          expected_delay_minutes,
          model_version,
          predicted_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          'ner-demo-v1',
          NOW()
        )
        RETURNING id
        `,
        [
          routeId,
          probability,
          riskLevel,
          disruptionType,
          delay,
        ]
      );

      predictionIds.push(result.rows[0].id);
    }

    console.log(`Created ${predictionIds.length} predictions.`);

    // =========================================================
    // 8. ALERTS
    // =========================================================

    console.log("");
    console.log("[8/12] Creating risk alerts...");

    const alerts = [
      [
        "ROAD_BLOCKED",
        "HIGH",
        "Partial blockage reported on NH-15",
        "Heavy rainfall has affected movement on the Tezpur-Dibrugarh corridor.",
        roadIds[1],
        districtIds[1],
      ],
      [
        "HIGH_RISK",
        "CRITICAL",
        "Landslide risk on NH-13",
        "Mountain corridor towards Tawang has elevated landslide risk.",
        roadIds[2],
        districtIds[2],
      ],
      [
        "ROUTE_DISRUPTION",
        "HIGH",
        "Bhalukpong-Bomdila disruption risk",
        "Road condition requires monitoring after heavy rain.",
        roadIds[3],
        districtIds[3],
      ],
      [
        "HIGH_RISK",
        "HIGH",
        "Shillong-Silchar rain risk",
        "Heavy rainfall may increase travel time on NH-6.",
        roadIds[4],
        districtIds[4],
      ],
      [
        "ROAD_BLOCKED",
        "HIGH",
        "Dimapur-Kohima partial blockage",
        "Traffic movement is slower due to road maintenance and weather.",
        roadIds[5],
        districtIds[5],
      ],
      [
        "DELIVERY_DELAY",
        "HIGH",
        "Medical delivery delay near Kohima",
        "Essential medicine shipment is behind expected schedule.",
        roadIds[6],
        districtIds[6],
      ],
      [
        "REGION_INACCESSIBLE",
        "HIGH",
        "Aizawl corridor monitoring alert",
        "Mountain road accessibility requires continuous monitoring.",
        roadIds[7],
        districtIds[7],
      ],
      [
        "HIGH_RISK",
        "MEDIUM",
        "Tripura corridor flood watch",
        "Low-lying stretches may experience temporary water accumulation.",
        roadIds[8],
        districtIds[8],
      ],
      [
        "ROAD_BLOCKED",
        "HIGH",
        "Gangtok mountain route disruption",
        "Weather conditions may restrict movement towards higher elevations.",
        roadIds[9],
        districtIds[9],
      ],
      [
        "DELIVERY_DELAY",
        "MEDIUM",
        "Assam supply movement delay",
        "Rain-related traffic slowdown may delay essential supplies.",
        roadIds[0],
        districtIds[0],
      ],
    ];

    const alertIds = [];

    for (const alert of alerts) {
      const [
        alertType,
        severity,
        title,
        message,
        roadId,
        districtId,
      ] = alert;

      const result = await client.query(
        `
        INSERT INTO alerts (
          alert_type,
          severity,
          title,
          message,
          road_id,
          district_id,
          is_resolved
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          false
        )
        RETURNING id
        `,
        [
          alertType,
          severity,
          title,
          message,
          roadId,
          districtId,
        ]
      );

      alertIds.push(result.rows[0].id);
    }

    console.log(`Created ${alertIds.length} alerts.`);

    // =========================================================
    // 9. ROAD INCIDENTS
    // =========================================================

    console.log("");
    console.log("[9/12] Creating road incidents...");

    const incidents = [
      [
        roadIds[0],
        "HEAVY_RAIN",
        "MEDIUM",
        "Heavy rainfall reported along the Guwahati-Dibrugarh corridor.",
        26.20,
        91.80,
        "VERIFIED",
      ],
      [
        roadIds[1],
        "ROAD_DAMAGE",
        "HIGH",
        "Surface damage reported on NH-15 following prolonged rain.",
        27.22,
        93.50,
        "IN_PROGRESS",
      ],
      [
        roadIds[2],
        "LANDSLIDE",
        "CRITICAL",
        "Slope movement reported on the Balipara-Tawang mountain corridor.",
        27.45,
        92.15,
        "VERIFIED",
      ],
      [
        roadIds[3],
        "LANDSLIDE",
        "HIGH",
        "Minor landslide debris observed near Bomdila approach.",
        27.28,
        92.39,
        "REPORTED",
      ],
      [
        roadIds[4],
        "HEAVY_RAIN",
        "MEDIUM",
        "Continuous rainfall affecting visibility and travel speed.",
        25.40,
        92.10,
        "VERIFIED",
      ],
      [
        roadIds[5],
        "TRAFFIC",
        "HIGH",
        "Traffic congestion reported on the Dimapur-Kohima route.",
        25.78,
        93.95,
        "IN_PROGRESS",
      ],
      [
        roadIds[6],
        "ROAD_DAMAGE",
        "HIGH",
        "Road surface deterioration reported on the hill section.",
        25.18,
        94.00,
        "VERIFIED",
      ],
      [
        roadIds[7],
        "FLOOD",
        "HIGH",
        "Water accumulation reported on a low-lying approach.",
        23.76,
        92.68,
        "REPORTED",
      ],
      [
        roadIds[8],
        "FLOOD",
        "MEDIUM",
        "Temporary flooding reported after heavy rainfall.",
        23.95,
        91.55,
        "RESOLVED",
      ],
      [
        roadIds[9],
        "LANDSLIDE",
        "HIGH",
        "Rockfall risk reported on the Gangtok-Nathu La mountain route.",
        27.42,
        88.74,
        "IN_PROGRESS",
      ],
    ];

    const incidentIds = [];

    for (const incident of incidents) {
      const [
        roadId,
        incidentType,
        severity,
        description,
        lat,
        lng,
        status,
      ] = incident;

      const result = await client.query(
        `
        INSERT INTO road_incidents (
          road_id,
          incident_type,
          severity,
          description,
          location,
          reported_by,
          status,
          started_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          ${point(lng, lat)},
          $5,
          $6,
          NOW() - INTERVAL '2 hours'
        )
        RETURNING id
        `,
        [
          roadId,
          incidentType,
          severity,
          description,
          userId,
          status,
        ]
      );

      incidentIds.push(result.rows[0].id);
    }

    console.log(`Created ${incidentIds.length} road incidents.`);

    // =========================================================
    // 10. FIELD REPORTS
    // =========================================================

    console.log("");
    console.log("[10/12] Creating field reports...");

    const fieldReports = [
      [
        "HEAVY_RAIN",
        "Continuous rainfall observed near Guwahati corridor.",
        26.20,
        91.80,
      ],
      [
        "ROAD_DAMAGE",
        "Pothole and surface damage reported on NH-15.",
        27.22,
        93.50,
      ],
      [
        "LANDSLIDE",
        "Fresh debris observed near Tawang approach road.",
        27.45,
        92.15,
      ],
      [
        "LANDSLIDE",
        "Slope instability observed near Bomdila.",
        27.28,
        92.39,
      ],
      [
        "HEAVY_RAIN",
        "Visibility reduced due to heavy rainfall.",
        25.40,
        92.10,
      ],
      [
        "TRAFFIC",
        "Vehicle queue building near Kohima approach.",
        25.78,
        93.95,
      ],
      [
        "ROAD_DAMAGE",
        "Deteriorated road surface reported near Imphal corridor.",
        25.18,
        94.00,
      ],
      [
        "FLOOD",
        "Water accumulation reported near Sairang corridor.",
        23.76,
        92.68,
      ],
      [
        "FLOOD",
        "Temporary flooding reported on Tripura corridor.",
        23.95,
        91.55,
      ],
      [
        "LANDSLIDE",
        "Rockfall debris observed near Nathu La approach.",
        27.42,
        88.74,
      ],
    ];

    for (const report of fieldReports) {
      const [
        reportType,
        description,
        lat,
        lng,
      ] = report;

      await client.query(
        `
        INSERT INTO field_reports (
          reported_by,
          report_type,
          description,
          latitude,
          longitude,
          location,
          photo_url,
          sync_status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          ${point(lng, lat)},
          NULL,
          'SYNCED'
        )
        `,
        [
          userId,
          reportType,
          description,
          lat,
          lng,
        ]
      );
    }

    console.log("Created 10 field reports.");

    // =========================================================
    // 11. NOTIFICATIONS
    // =========================================================

    console.log("");
    console.log("[11/12] Creating notifications...");

    const notifications = [
      [
        "Critical landslide risk on NH-13",
        "Tawang corridor has a high probability of disruption.",
        "en",
        "IN_APP",
        false,
      ],
      [
        "NH-15 road blockage warning",
        "Partial blockage may delay Dibrugarh-bound supplies.",
        "en",
        "IN_APP",
        false,
      ],
      [
        "Kohima delivery delay",
        "Medical delivery is currently behind schedule.",
        "en",
        "SMS",
        false,
      ],
      [
        "Heavy rain warning",
        "Rainfall may affect Shillong-Silchar travel time.",
        "en",
        "IN_APP",
        true,
      ],
      [
        "Aizawl route monitoring",
        "Mountain corridor requires continued monitoring.",
        "en",
        "IN_APP",
        false,
      ],
      [
        "Tripura flood watch",
        "Monitor low-lying road sections for water accumulation.",
        "en",
        "SMS",
        false,
      ],
      [
        "Gangtok landslide risk",
        "Rockfall risk detected on the Nathu La route.",
        "en",
        "IN_APP",
        false,
      ],
      [
        "Imphal route update",
        "Road condition monitoring is active.",
        "en",
        "IN_APP",
        true,
      ],
      [
        "Bomdila field report",
        "New landslide observation received from field team.",
        "en",
        "EMAIL",
        false,
      ],
      [
        "Assam supply movement",
        "Rain-related slowdown may affect delivery ETA.",
        "en",
        "IN_APP",
        true,
      ],
    ];

    for (let i = 0; i < notifications.length; i++) {
      const [
        title,
        message,
        language,
        channel,
        isRead,
      ] = notifications[i];

      await client.query(
        `
        INSERT INTO notifications (
          user_id,
          alert_id,
          title,
          message,
          language,
          channel,
          is_read,
          sent_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          NOW()
        )
        `,
        [
          userId,
          alertIds[i],
          title,
          message,
          language,
          channel,
          isRead,
        ]
      );
    }

    console.log("Created 10 notifications.");

    // =========================================================
    // 12. WEATHER DATA
    // =========================================================

    console.log("");
    console.log("[12/12] Creating Northeast weather observations...");

    const weather = [
      [districtIds[0], 91.7362, 26.1445, 85, 31, 78, 18, "Heavy Rain"],
      [districtIds[1], 94.912, 27.4728, 72, 29, 81, 14, "Cloudy"],
      [districtIds[2], 91.859, 27.586, 96, 12, 88, 22, "Heavy Rain"],
      [districtIds[3], 92.424, 27.2646, 82, 17, 84, 19, "Rain"],
      [districtIds[4], 91.8933, 25.5788, 68, 22, 86, 16, "Rain"],
      [districtIds[5], 94.1086, 25.6751, 54, 24, 79, 12, "Cloudy"],
      [districtIds[6], 93.9368, 24.817, 61, 25, 77, 11, "Cloudy"],
      [districtIds[7], 92.7176, 23.7271, 74, 23, 83, 17, "Rain"],
      [districtIds[8], 91.2868, 23.8315, 48, 28, 75, 9, "Partly Cloudy"],
      [districtIds[9], 88.6065, 27.3389, 59, 16, 82, 14, "Rain"],
    ];

    for (const weatherRecord of weather) {
      const [
        districtId,
        lng,
        lat,
        rainfall,
        temperature,
        humidity,
        windSpeed,
        weatherCondition,
      ] = weatherRecord;

      await client.query(
        `
        INSERT INTO weather_data (
          district_id,
          location,
          rainfall_mm,
          temperature,
          humidity,
          wind_speed,
          weather_condition,
          recorded_at
        )
        VALUES (
          $1,
          ${point(lng, lat)},
          $2,
          $3,
          $4,
          $5,
          $6,
          NOW()
        )
        `,
        [
          districtId,
          rainfall,
          temperature,
          humidity,
          windSpeed,
          weatherCondition,
        ]
      );
    }

    console.log("Created 10 weather observations.");

    // =========================================================
    // COMMIT
    // =========================================================

    await client.query("COMMIT");

    console.log("");
    console.log("==============================================");
    console.log(" NER-LINK DATA SEED SUCCESSFUL");
    console.log("==============================================");
    console.log("");
    console.log("Districts          : 10");
    console.log("Roads              : 10");
    console.log("Vehicles           : 10");
    console.log("Vehicle Locations  : 10");
    console.log("Deliveries         : 10");
    console.log("Routes             : 10");
    console.log("Predictions        : 10");
    console.log("Alerts             : 10");
    console.log("Road Incidents     : 10");
    console.log("Field Reports      : 10");
    console.log("Notifications      : 10");
    console.log("Weather Records    : 10");
    console.log("");
    console.log("Users were preserved.");
    console.log("Only Northeast India operational data was inserted.");
    console.log("");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError.message);
    }

    console.error("");
    console.error("==============================================");
    console.error(" SEED FAILED — DATABASE ROLLED BACK");
    console.error("==============================================");
    console.error("");
    console.error(error);
    console.error("");

    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();