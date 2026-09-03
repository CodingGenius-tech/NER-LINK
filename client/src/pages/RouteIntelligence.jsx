import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  getRoutePredictions,
  getRoutePredictionById,
} from "../services/routePrediction.service";

import "./RouteIntelligence.css";

function RouteIntelligence() {
  const { token } = useAuth();

  const [predictions, setPredictions] = useState([]);
  const [selectedPrediction, setSelectedPrediction] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // LOAD PREDICTIONS
  // ========================================

  useEffect(() => {
    const loadPredictions = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getRoutePredictions(token);

        const data = Array.isArray(response)
          ? response
          : response.data || [];

        setPredictions(data);

        if (data.length > 0) {
          setSelectedPrediction(data[0]);
        } else {
          setSelectedPrediction(null);
        }
      } catch (err) {
        console.error(
          "Route prediction loading failed:",
          err
        );

        setError(
          err.message ||
            "Failed to load route predictions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [token]);

  // ========================================
  // LOAD PREDICTION DETAILS
  // ========================================

  const handlePredictionSelect = async (id) => {
    if (!id) return;

    try {
      setDetailsLoading(true);
      setError("");

      const response =
        await getRoutePredictionById(id, token);

      const data = response.data || response;

      setSelectedPrediction(data);
    } catch (err) {
      console.error(
        "Prediction details loading failed:",
        err
      );

      setError(
        err.message ||
          "Failed to load prediction details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const formatProbability = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    if (number <= 1) {
      return `${Math.round(number * 100)}%`;
    }

    return `${Math.round(number)}%`;
  };

  const getProbabilityPercentage = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return 0;
    }

    const percentage =
      number <= 1 ? number * 100 : number;

    return Math.min(
      Math.max(percentage, 0),
      100
    );
  };

  const getRiskClass = (risk) => {
    const value = String(
      risk || ""
    ).toUpperCase();

    if (
      value === "CRITICAL" ||
      value === "HIGH"
    ) {
      return "risk-high";
    }

    if (value === "MEDIUM") {
      return "risk-medium";
    }

    return "risk-low";
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString();
  };

  const highRiskCount = useMemo(() => {
    return predictions.filter((prediction) => {
      const risk = String(
        prediction.risk_level || ""
      ).toUpperCase();

      return (
        risk === "HIGH" ||
        risk === "CRITICAL"
      );
    }).length;
  }, [predictions]);

  const delayedCount = useMemo(() => {
    return predictions.filter((prediction) => {
      return (
        Number(
          prediction.expected_delay_minutes
        ) > 0
      );
    }).length;
  }, [predictions]);

  const modelVersions = useMemo(() => {
    return [
      ...new Set(
        predictions
          .map(
            (prediction) =>
              prediction.model_version
          )
          .filter(Boolean)
      ),
    ];
  }, [predictions]);

  const latestModel =
    modelVersions.length > 0
      ? modelVersions[0]
      : "—";

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="route-page">
        <div className="route-loading">
          Loading route intelligence...
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error && !predictions.length) {
    return (
      <div className="route-page">
        <div className="route-error">
          <h2>
            Unable to load route intelligence
          </h2>

          <p>{error}</p>

          <button
            onClick={() =>
              window.location.reload()
            }
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="route-page">

      {/* HEADER */}

      <div className="route-page-header">

        <div>
          <div className="route-live-label">
            <span></span>
            ROUTE INTELLIGENCE
          </div>

          <h1>
            Route Prediction
          </h1>

          <p>
            AI-assisted disruption forecasting
            across Northeast India logistics
            corridors.
          </p>
        </div>

        <div className="route-count">
          {predictions.length} prediction
          {predictions.length !== 1
            ? "s"
            : ""}
        </div>

      </div>

      {/* NON-BLOCKING ERROR */}

      {error && predictions.length > 0 && (
        <div className="route-inline-error">
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className="route-summary">

        <div className="route-summary-card">
          <span>
            Total Predictions
          </span>

          <strong>
            {predictions.length}
          </strong>
        </div>

        <div className="route-summary-card">
          <span>
            High Risk
          </span>

          <strong>
            {highRiskCount}
          </strong>
        </div>

        <div className="route-summary-card">
          <span>
            Predicted Delays
          </span>

          <strong>
            {delayedCount}
          </strong>
        </div>

        <div className="route-summary-card">
          <span>
            Latest Model
          </span>

          <strong className="model-value">
            {latestModel}
          </strong>
        </div>

      </div>

      {/* MAIN GRID */}

      <div className="route-grid">

        {/* PREDICTION LIST */}

        <section className="route-panel">

          <div className="route-panel-header">

            <div>
              <span>
                NORTHEAST INDIA
              </span>

              <h2>
                Route Predictions
              </h2>
            </div>

          </div>

          <div className="prediction-list">

            {!predictions.length && (
              <div className="empty-state">
                No route prediction records
                available.
              </div>
            )}

            {predictions.map((prediction) => {

              const isSelected =
                selectedPrediction?.id ===
                prediction.id;

              return (
                <button
                  type="button"
                  className={`prediction-row ${
                    isSelected
                      ? "selected"
                      : ""
                  }`}
                  key={prediction.id}
                  onClick={() =>
                    handlePredictionSelect(
                      prediction.id
                    )
                  }
                >

                  <div className="prediction-route">

                    <strong>
                      {prediction.source ||
                        "Unknown source"}
                    </strong>

                    <span>
                      →
                    </span>

                    <strong>
                      {prediction.destination ||
                        "Unknown destination"}
                    </strong>

                  </div>

                  <div className="prediction-meta">

                    <span>
                      Route #
                      {prediction.route_id ??
                        "—"}
                    </span>

                    <span>
                      {prediction.predicted_disruption_type ||
                        "No disruption type"}
                    </span>

                  </div>

                  <div
                    className={`prediction-risk ${getRiskClass(
                      prediction.risk_level
                    )}`}
                  >
                    {prediction.risk_level ||
                      "UNKNOWN"}
                  </div>

                </button>
              );
            })}

          </div>

        </section>

        {/* DETAILS */}

        <section className="route-panel details-panel">

          <div className="route-panel-header">

            <div>
              <span>
                PREDICTION ANALYSIS
              </span>

              <h2>
                Route Details
              </h2>
            </div>

            {detailsLoading && (
              <span className="details-loading">
                Loading...
              </span>
            )}

          </div>

          {selectedPrediction ? (

            <div className="details-content">

              {/* ROUTE */}

              <div className="detail-route">

                <span>
                  DELIVERY ROUTE
                </span>

                <div>

                  <strong>
                    {selectedPrediction.source ||
                      "Unknown"}
                  </strong>

                  <span>
                    →
                  </span>

                  <strong>
                    {selectedPrediction.destination ||
                      "Unknown"}
                  </strong>

                </div>

              </div>

              {/* RISK */}

              <div className="risk-section">

                <div className="risk-header">

                  <span>
                    DISRUPTION PROBABILITY
                  </span>

                  <strong
                    className={getRiskClass(
                      selectedPrediction.risk_level
                    )}
                  >
                    {formatProbability(
                      selectedPrediction.disruption_probability
                    )}
                  </strong>

                </div>

                <div className="probability-bar">

                  <div
                    style={{
                      width: `${getProbabilityPercentage(
                        selectedPrediction.disruption_probability
                      )}%`,
                    }}
                  ></div>

                </div>

              </div>

              {/* METRICS */}

              <div className="detail-metrics">

                <div className="detail-card">

                  <span>
                    RISK LEVEL
                  </span>

                  <strong
                    className={getRiskClass(
                      selectedPrediction.risk_level
                    )}
                  >
                    {selectedPrediction.risk_level ||
                      "—"}
                  </strong>

                </div>

                <div className="detail-card">

                  <span>
                    EXPECTED DELAY
                  </span>

                  <strong>
                    {selectedPrediction.expected_delay_minutes ??
                      "—"}

                    {selectedPrediction.expected_delay_minutes !==
                      null &&
                    selectedPrediction.expected_delay_minutes !==
                      undefined
                      ? " min"
                      : ""}
                  </strong>

                </div>

                <div className="detail-card">

                  <span>
                    DISRUPTION TYPE
                  </span>

                  <strong>
                    {selectedPrediction.predicted_disruption_type ||
                      "—"}
                  </strong>

                </div>

                <div className="detail-card">

                  <span>
                    MODEL VERSION
                  </span>

                  <strong>
                    {selectedPrediction.model_version ||
                      "—"}
                  </strong>

                </div>

              </div>

              {/* IDENTIFIERS */}

              <div className="detail-identifiers">

                <div>
                  <span>
                    Prediction ID
                  </span>

                  <strong>
                    {selectedPrediction.id}
                  </strong>
                </div>

                <div>
                  <span>
                    Route ID
                  </span>

                  <strong>
                    {selectedPrediction.route_id ??
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Delivery ID
                  </span>

                  <strong>
                    {selectedPrediction.delivery_id ??
                      "—"}
                  </strong>
                </div>

              </div>

              {/* TIMESTAMPS */}

              <div className="detail-timestamps">

                <div>
                  <span>
                    Predicted At
                  </span>

                  <strong>
                    {formatDate(
                      selectedPrediction.predicted_at
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Created At
                  </span>

                  <strong>
                    {formatDate(
                      selectedPrediction.created_at
                    )}
                  </strong>
                </div>

              </div>

            </div>

          ) : (

            <div className="empty-state">
              Select a prediction to view
              detailed route intelligence.
            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default RouteIntelligence;