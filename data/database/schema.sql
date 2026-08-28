-- ============================================================
-- NER-LINK
-- AI-Based Smart Logistics and Accessibility Intelligence
-- Platform for North Eastern Region
--
-- Database: PostgreSQL
-- Extension: PostGIS
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================================
-- 2. ENUM TYPES
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE user_role AS ENUM (
            'ADMIN',
            'OFFICIAL',
            'FIELD_OFFICER',
            'OPERATOR'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'connectivity_status'
    ) THEN
        CREATE TYPE connectivity_status AS ENUM (
            'CONNECTED',
            'PARTIALLY_CONNECTED',
            'DISCONNECTED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'road_status'
    ) THEN
        CREATE TYPE road_status AS ENUM (
            'OPEN',
            'PARTIALLY_BLOCKED',
            'BLOCKED',
            'UNDER_REPAIR'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'risk_level'
    ) THEN
        CREATE TYPE risk_level AS ENUM (
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'incident_type'
    ) THEN
        CREATE TYPE incident_type AS ENUM (
            'LANDSLIDE',
            'FLOOD',
            'ROAD_DAMAGE',
            'BRIDGE_DAMAGE',
            'HEAVY_RAIN',
            'TRAFFIC',
            'OTHER'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'incident_status'
    ) THEN
        CREATE TYPE incident_status AS ENUM (
            'REPORTED',
            'VERIFIED',
            'IN_PROGRESS',
            'RESOLVED',
            'REJECTED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'vehicle_status'
    ) THEN
        CREATE TYPE vehicle_status AS ENUM (
            'IDLE',
            'ACTIVE',
            'DELAYED',
            'STOPPED',
            'OFFLINE'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'commodity_type'
    ) THEN
        CREATE TYPE commodity_type AS ENUM (
            'MEDICINE',
            'FOOD',
            'CONSTRUCTION_MATERIAL',
            'AGRICULTURAL_PRODUCE',
            'OTHER'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'delivery_priority'
    ) THEN
        CREATE TYPE delivery_priority AS ENUM (
            'LOW',
            'NORMAL',
            'HIGH',
            'CRITICAL'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'delivery_status'
    ) THEN
        CREATE TYPE delivery_status AS ENUM (
            'PLANNED',
            'IN_TRANSIT',
            'DELAYED',
            'DELIVERED',
            'CANCELLED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'route_status'
    ) THEN
        CREATE TYPE route_status AS ENUM (
            'RECOMMENDED',
            'ACTIVE',
            'BLOCKED',
            'ALTERNATE',
            'COMPLETED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'report_type'
    ) THEN
        CREATE TYPE report_type AS ENUM (
            'LANDSLIDE',
            'FLOOD',
            'ROAD_DAMAGE',
            'BRIDGE_DAMAGE',
            'HEAVY_RAIN',
            'TRAFFIC',
            'OTHER'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'sync_status'
    ) THEN
        CREATE TYPE sync_status AS ENUM (
            'PENDING',
            'SYNCED',
            'FAILED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'alert_type'
    ) THEN
        CREATE TYPE alert_type AS ENUM (
            'ROAD_BLOCKED',
            'HIGH_RISK',
            'DELIVERY_DELAY',
            'ROUTE_DISRUPTION',
            'REGION_INACCESSIBLE'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'notification_channel'
    ) THEN
        CREATE TYPE notification_channel AS ENUM (
            'IN_APP',
            'EMAIL',
            'SMS'
        );
    END IF;

END
$$;


-- ============================================================
-- 3. USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (

    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(120) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'OPERATOR',

    phone VARCHAR(20),

    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. DISTRICTS
-- ============================================================

CREATE TABLE IF NOT EXISTS districts (

    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    state VARCHAR(150) NOT NULL,

    geometry GEOMETRY(POLYGON, 4326),

    connectivity_status connectivity_status
        NOT NULL DEFAULT 'CONNECTED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_district_name_state
        UNIQUE (name, state)
);


-- ============================================================
-- 5. ROADS
-- ============================================================

CREATE TABLE IF NOT EXISTS roads (

    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    road_type VARCHAR(100),

    district_id BIGINT
        REFERENCES districts(id)
        ON DELETE SET NULL,

    geometry GEOMETRY(LINESTRING, 4326) NOT NULL,

    current_status road_status
        NOT NULL DEFAULT 'OPEN',

    risk_level risk_level
        NOT NULL DEFAULT 'LOW',

    speed_limit NUMERIC(6,2),

    condition_score NUMERIC(5,2),

    last_updated TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_condition_score
        CHECK (
            condition_score IS NULL
            OR (
                condition_score >= 0
                AND condition_score <= 100
            )
        ),

    CONSTRAINT valid_speed_limit
        CHECK (
            speed_limit IS NULL
            OR speed_limit >= 0
        )
);


-- ============================================================
-- 6. FIELD REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS field_reports (

    id BIGSERIAL PRIMARY KEY,

    reported_by BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    report_type report_type NOT NULL,

    description TEXT,

    latitude NUMERIC(10,7),

    longitude NUMERIC(10,7),

    location GEOMETRY(POINT, 4326) NOT NULL,

    photo_url TEXT,

    sync_status sync_status
        NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    synced_at TIMESTAMPTZ,

    CONSTRAINT valid_latitude
        CHECK (
            latitude IS NULL
            OR (
                latitude >= -90
                AND latitude <= 90
            )
        ),

    CONSTRAINT valid_longitude
        CHECK (
            longitude IS NULL
            OR (
                longitude >= -180
                AND longitude <= 180
            )
        )
);


-- ============================================================
-- 7. ROAD INCIDENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS road_incidents (

    id BIGSERIAL PRIMARY KEY,

    road_id BIGINT
        REFERENCES roads(id)
        ON DELETE SET NULL,

    incident_type incident_type NOT NULL,

    severity risk_level
        NOT NULL DEFAULT 'MEDIUM',

    description TEXT,

    location GEOMETRY(POINT, 4326) NOT NULL,

    reported_by BIGINT
        REFERENCES users(id)
        ON DELETE SET NULL,

    status incident_status
        NOT NULL DEFAULT 'REPORTED',

    started_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 8. VEHICLES
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicles (

    id BIGSERIAL PRIMARY KEY,

    vehicle_number VARCHAR(50) NOT NULL UNIQUE,

    vehicle_type VARCHAR(100),

    driver_name VARCHAR(150),

    commodity_type commodity_type,

    capacity NUMERIC(12,2),

    status vehicle_status
        NOT NULL DEFAULT 'IDLE',

    current_location GEOMETRY(POINT, 4326),

    last_location_update TIMESTAMPTZ,

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_vehicle_capacity
        CHECK (
            capacity IS NULL
            OR capacity >= 0
        )
);


-- ============================================================
-- 9. VEHICLE LOCATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_locations (

    id BIGSERIAL PRIMARY KEY,

    vehicle_id BIGINT NOT NULL
        REFERENCES vehicles(id)
        ON DELETE CASCADE,

    location GEOMETRY(POINT, 4326) NOT NULL,

    speed NUMERIC(8,2),

    heading NUMERIC(6,2),

    recorded_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_vehicle_speed
        CHECK (
            speed IS NULL
            OR speed >= 0
        ),

    CONSTRAINT valid_vehicle_heading
        CHECK (
            heading IS NULL
            OR (
                heading >= 0
                AND heading <= 360
            )
        )
);


-- ============================================================
-- 10. DELIVERIES
-- ============================================================

CREATE TABLE IF NOT EXISTS deliveries (

    id BIGSERIAL PRIMARY KEY,

    vehicle_id BIGINT
        REFERENCES vehicles(id)
        ON DELETE SET NULL,

    source VARCHAR(255) NOT NULL,

    destination VARCHAR(255) NOT NULL,

    commodity_type commodity_type NOT NULL,

    priority delivery_priority
        NOT NULL DEFAULT 'NORMAL',

    quantity NUMERIC(12,2),

    status delivery_status
        NOT NULL DEFAULT 'PLANNED',

    expected_delivery_at TIMESTAMPTZ,

    actual_delivery_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_delivery_quantity
        CHECK (
            quantity IS NULL
            OR quantity >= 0
        )
);


-- ============================================================
-- 11. ROUTES
-- ============================================================

CREATE TABLE IF NOT EXISTS routes (

    id BIGSERIAL PRIMARY KEY,

    delivery_id BIGINT
        REFERENCES deliveries(id)
        ON DELETE CASCADE,

    start_location GEOMETRY(POINT, 4326) NOT NULL,

    end_location GEOMETRY(POINT, 4326) NOT NULL,

    route_geometry GEOMETRY(LINESTRING, 4326),

    distance_km NUMERIC(12,3),

    estimated_time_minutes NUMERIC(12,2),

    risk_score NUMERIC(6,3),

    route_status route_status
        NOT NULL DEFAULT 'RECOMMENDED',

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_route_distance
        CHECK (
            distance_km IS NULL
            OR distance_km >= 0
        ),

    CONSTRAINT valid_route_time
        CHECK (
            estimated_time_minutes IS NULL
            OR estimated_time_minutes >= 0
        ),

    CONSTRAINT valid_route_risk_score
        CHECK (
            risk_score IS NULL
            OR (
                risk_score >= 0
                AND risk_score <= 100
            )
        )
);


-- ============================================================
-- 12. WEATHER DATA
-- ============================================================

CREATE TABLE IF NOT EXISTS weather_data (

    id BIGSERIAL PRIMARY KEY,

    district_id BIGINT
        REFERENCES districts(id)
        ON DELETE SET NULL,

    location GEOMETRY(POINT, 4326) NOT NULL,

    rainfall_mm NUMERIC(10,2),

    temperature NUMERIC(6,2),

    humidity NUMERIC(6,2),

    wind_speed NUMERIC(8,2),

    weather_condition VARCHAR(100),

    recorded_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_rainfall
        CHECK (
            rainfall_mm IS NULL
            OR rainfall_mm >= 0
        ),

    CONSTRAINT valid_humidity
        CHECK (
            humidity IS NULL
            OR (
                humidity >= 0
                AND humidity <= 100
            )
        ),

    CONSTRAINT valid_wind_speed
        CHECK (
            wind_speed IS NULL
            OR wind_speed >= 0
        )
);


-- ============================================================
-- 13. ROUTE PREDICTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS route_predictions (

    id BIGSERIAL PRIMARY KEY,

    route_id BIGINT NOT NULL
        REFERENCES routes(id)
        ON DELETE CASCADE,

    disruption_probability NUMERIC(6,5),

    risk_level risk_level
        NOT NULL DEFAULT 'LOW',

    predicted_disruption_type incident_type,

    expected_delay_minutes NUMERIC(12,2),

    model_version VARCHAR(100),

    predicted_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_disruption_probability
        CHECK (
            disruption_probability IS NULL
            OR (
                disruption_probability >= 0
                AND disruption_probability <= 1
            )
        ),

    CONSTRAINT valid_prediction_delay
        CHECK (
            expected_delay_minutes IS NULL
            OR expected_delay_minutes >= 0
        )
);


-- ============================================================
-- 14. ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS alerts (

    id BIGSERIAL PRIMARY KEY,

    alert_type alert_type NOT NULL,

    severity risk_level
        NOT NULL DEFAULT 'MEDIUM',

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    road_id BIGINT
        REFERENCES roads(id)
        ON DELETE SET NULL,

    district_id BIGINT
        REFERENCES districts(id)
        ON DELETE SET NULL,

    vehicle_id BIGINT
        REFERENCES vehicles(id)
        ON DELETE SET NULL,

    delivery_id BIGINT
        REFERENCES deliveries(id)
        ON DELETE SET NULL,

    location GEOMETRY(POINT, 4326),

    is_resolved BOOLEAN
        NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    resolved_at TIMESTAMPTZ
);


-- ============================================================
-- 15. NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (

    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    alert_id BIGINT
        REFERENCES alerts(id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    language VARCHAR(10)
        NOT NULL DEFAULT 'en',

    channel notification_channel
        NOT NULL DEFAULT 'IN_APP',

    is_read BOOLEAN
        NOT NULL DEFAULT FALSE,

    sent_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ
        NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 16. INDEXES
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_active
    ON users(is_active);


-- Districts
CREATE INDEX IF NOT EXISTS idx_districts_state
    ON districts(state);

CREATE INDEX IF NOT EXISTS idx_districts_geometry
    ON districts
    USING GIST(geometry);


-- Roads
CREATE INDEX IF NOT EXISTS idx_roads_district
    ON roads(district_id);

CREATE INDEX IF NOT EXISTS idx_roads_status
    ON roads(current_status);

CREATE INDEX IF NOT EXISTS idx_roads_risk
    ON roads(risk_level);

CREATE INDEX IF NOT EXISTS idx_roads_geometry
    ON roads
    USING GIST(geometry);


-- Field Reports
CREATE INDEX IF NOT EXISTS idx_field_reports_reported_by
    ON field_reports(reported_by);

CREATE INDEX IF NOT EXISTS idx_field_reports_type
    ON field_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_field_reports_sync_status
    ON field_reports(sync_status);

CREATE INDEX IF NOT EXISTS idx_field_reports_location
    ON field_reports
    USING GIST(location);


-- Road Incidents
CREATE INDEX IF NOT EXISTS idx_road_incidents_road
    ON road_incidents(road_id);

CREATE INDEX IF NOT EXISTS idx_road_incidents_status
    ON road_incidents(status);

CREATE INDEX IF NOT EXISTS idx_road_incidents_type
    ON road_incidents(incident_type);

CREATE INDEX IF NOT EXISTS idx_road_incidents_location
    ON road_incidents
    USING GIST(location);


-- Vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_status
    ON vehicles(status);

CREATE INDEX IF NOT EXISTS idx_vehicles_location
    ON vehicles
    USING GIST(current_location);


-- Vehicle Locations
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vehicle
    ON vehicle_locations(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_locations_recorded
    ON vehicle_locations(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_locations_location
    ON vehicle_locations
    USING GIST(location);


-- Deliveries
CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle
    ON deliveries(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_status
    ON deliveries(status);

CREATE INDEX IF NOT EXISTS idx_deliveries_priority
    ON deliveries(priority);


-- Routes
CREATE INDEX IF NOT EXISTS idx_routes_delivery
    ON routes(delivery_id);

CREATE INDEX IF NOT EXISTS idx_routes_status
    ON routes(route_status);

CREATE INDEX IF NOT EXISTS idx_routes_geometry
    ON routes
    USING GIST(route_geometry);


-- Weather
CREATE INDEX IF NOT EXISTS idx_weather_district
    ON weather_data(district_id);

CREATE INDEX IF NOT EXISTS idx_weather_recorded
    ON weather_data(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_weather_location
    ON weather_data
    USING GIST(location);


-- Predictions
CREATE INDEX IF NOT EXISTS idx_predictions_route
    ON route_predictions(route_id);

CREATE INDEX IF NOT EXISTS idx_predictions_risk
    ON route_predictions(risk_level);

CREATE INDEX IF NOT EXISTS idx_predictions_time
    ON route_predictions(predicted_at DESC);


-- Alerts
CREATE INDEX IF NOT EXISTS idx_alerts_type
    ON alerts(alert_type);

CREATE INDEX IF NOT EXISTS idx_alerts_severity
    ON alerts(severity);

CREATE INDEX IF NOT EXISTS idx_alerts_unresolved
    ON alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_alerts_location
    ON alerts
    USING GIST(location);


-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON notifications(user_id, is_read);


-- ============================================================
-- 17. COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'NER-LINK DATABASE SCHEMA CREATED SUCCESSFULLY';
    RAISE NOTICE 'PostgreSQL + PostGIS';
    RAISE NOTICE '==============================================';
END
$$;