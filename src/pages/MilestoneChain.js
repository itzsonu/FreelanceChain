import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MilestoneChain.css";

export default function MilestoneChain() {
  const navigate = useNavigate();

  const { projectId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));

  const [project, setProject] = useState(null);

  const [selected, setSelected] = useState(null);

  const [submitText, setSubmitText] = useState("");

  const fetchProject = async () => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Project not found");
      navigate(-1);
      return;
    }

    setProject(data);
  } catch (error) {
    console.log(error);
    alert("Error loading project");
  }
};

  useEffect(() => {
    fetchProject();
  }, []);

  const handleSubmit = async (milestoneId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/milestone/${milestoneId}/submit`,
        {
          method: "POST",

          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},

          body: JSON.stringify({
            submittedWork: submitText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Milestone submitted successfully");

      setSubmitText("");

      setSelected(null);

      fetchProject();
    } catch (error) {
      console.log(error);
      alert("Error submitting milestone");
    }
  };

  const handleApprove = async (milestoneId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/milestone/${milestoneId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Milestone approved successfully");

      setSelected(null);

      fetchProject();
    } catch (error) {
      console.log(error);
      alert("Error approving milestone");
    }
  };

  const statusIcon = (s) => {
    if (s === "completed") return "✓";

    if (s === "submitted") return "⏳";

    if (s === "active") return "●";

    return "🔒";
  };

  const statusClass = (s) => {
    if (s === "completed") return "ms-completed";

    if (s === "submitted") return "ms-submitted";

    if (s === "active") return "ms-active";

    return "ms-locked";
  };

 if (!project || !project.milestones) {
  return (
    <div className="milestone-page">
      <h2>Project not found</h2>
    </div>
  );
}

  return (
    <div className="milestone-page">
      <div className="ms-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div>
          <h1>Milestone Chain</h1>

          <p className="sub-text">
            {project.title}
          </p>
        </div>

        <div className="ms-progress-info">
          <span>
            {
              project.milestones.filter(
                (m) => m.status === "completed"
              ).length
            }
            /{project.milestones.length} completed
          </span>
        </div>
      </div>

      <div className="ms-layout">
        {/* Left */}
        <div className="chain-column">
          {project.milestones.map((m, i) => (
            <React.Fragment key={m._id}>
              <div
                className={`ms-node ${statusClass(
                  m.status
                )} ${
                  selected?._id === m._id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  m.status !== "locked" &&
                  setSelected(m)
                }
              >
                <div className="node-left">
                  <div
                    className={`node-icon ${statusClass(
                      m.status
                    )}`}
                  >
                    {statusIcon(m.status)}
                  </div>
                </div>

                <div className="node-body">
                  <div className="node-title">
                    {m.title}
                  </div>

                  <div className="node-desc">
                    {m.description ||
                      "No description"}
                  </div>

                  <div className="node-meta">
                    <span>
                      💰 ₹{m.payment}
                    </span>
                  </div>
                </div>

                <div className="node-status-badge">
                  <span
                    className={`tag ${
                      m.status === "completed"
                        ? "tag-green"
                        : m.status ===
                          "submitted"
                        ? "tag-red"
                        : m.status ===
                          "active"
                        ? "tag-purple"
                        : "tag-gray"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>

              {i <
                project.milestones.length -
                  1 && (
                <div
                  className={`chain-connector ${
                    m.status === "completed"
                      ? "connector-done"
                      : ""
                  }`}
                >
                  <div className="connector-line"></div>

                  <div className="connector-arrow">
                    ↓
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Right */}
        <div className="side-panel">
          {selected ? (
            <div className="card panel-card">
              <h3>{selected.title}</h3>

              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "14px",
                  marginTop: "8px",
                }}
              >
                {selected.description ||
                  "No description"}
              </p>

              <div className="panel-info">
                <div className="pi-row">
                  <span>Payment</span>

                  <span
                    style={{
                      color: "var(--green)",
                    }}
                  >
                    ₹{selected.payment}
                  </span>
                </div>

                <div className="pi-row">
                  <span>Status</span>

                  <span
                    className={`tag ${
                      selected.status ===
                      "completed"
                        ? "tag-green"
                        : selected.status ===
                          "submitted"
                        ? "tag-red"
                        : "tag-purple"
                    }`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Active */}
              {selected.status ===
                "active" &&
                user.role ===
                  "freelancer" && (
                  <div className="panel-actions">
                    <h4>Submit Work</h4>

                    <textarea
                      placeholder="Describe your work..."
                      value={submitText}
                      onChange={(e) =>
                        setSubmitText(
                          e.target.value
                        )
                      }
                      rows={4}
                      className="submit-textarea"
                    />

                    <button
                      className="btn-primary"
                      style={{ width: "100%" }}
                      onClick={() =>
                        handleSubmit(
                          selected._id
                        )
                      }
                    >
                      Submit Milestone
                    </button>
                  </div>
                )}

              {/* Submitted */}
              {selected.status ===
                "submitted" &&
                user.role ===
                  "client" && (
                  <div className="panel-actions">
                    <h4>
                      Submitted Work
                    </h4>

                    <div
                      style={{
                        padding: "12px",
                        background:
                          "rgba(255,255,255,0.05)",
                        borderRadius: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      {
                        selected.submittedWork
                      }
                    </div>

                    <button
                      className="btn-primary"
                      style={{ width: "100%" }}
                      onClick={() =>
                        handleApprove(
                          selected._id
                        )
                      }
                    >
                      Approve Milestone
                    </button>
                  </div>
                )}

              {selected.status ===
                "completed" && (
                <div className="completed-msg">
                  <span>✓</span> This
                  milestone has been
                  completed and approved.
                </div>
              )}
            </div>
          ) : (
            <div className="card panel-card empty-panel">
              <div className="empty-icon">
                🔗
              </div>

              <h3>Milestone Chain</h3>

              <p>
                Click any active milestone
                to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}