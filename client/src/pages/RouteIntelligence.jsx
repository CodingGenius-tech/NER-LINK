import { useEffect, useState } from "react";
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
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getRoutePredictions(token);

        const data = response.data || [];

        setPredictions(data);

        if (data.length > 0) {
          setSelectedPrediction(data[0]);
        }
      } catch (error) {
        console.error(
          "Route prediction loading failed:",
          error
        );

        setError(
          error.message ||
            "Failed to load route predictions"
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
    try {
      setDetailsLoading(true);

      const response =
        await getRoutePredictionById(id, token);

      setSelectedPrediction(response.data);
    } catch (error) {
      console.error(
        "Prediction details loading failed:",
        error
      );

      setError(
        error.message ||
          "Failed to load prediction details"
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
      value === undefined
    ) {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    // Handles both 0.78 and 78 formats
    if (number <= 1) {
      return `${Math.round(number * 100)}%`;
    }

    return `${Math.round(number)}%`;
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
            Predictive visibility across
            logistics routes and delivery
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
            {
              predictions.filter((prediction) => {
                const risk = String(
                  prediction.risk_level || ""
                ).toUpperCase();

                return (
                  risk === "HIGH" ||
                  risk === "CRITICAL"
                );
              }).length
            }
          </strong>
        </div>

        <div className="route-summary-card">
          <span>
            Predicted Delays
          </span>

          <strong>
            {
              predictions.filter(
                (prediction) =>
                  Number(
                    prediction.expected_delay_minutes
                  ) > 0
              ).length
            }
          </strong>
        </div>

        <div className="route-summary-card">
          <span>
            Latest Model
          </span>

          <strong className="model-value">
            {predictions[0]?.model_version ||
              "—"}
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
                PREDICTION RECORDS
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
                      width: `${
                        Math.min(
                          Math.max(
                            Number(
                              selectedPrediction.disruption_probability
                            ) <= 1
                              ? Number(
                                  selectedPrediction.disruption_probability
                                ) * 100
                              : Number(
                                  selectedPrediction.disruption_probability
                                ),
                            0
                          ),
                          100
                        )
                      }%`,
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