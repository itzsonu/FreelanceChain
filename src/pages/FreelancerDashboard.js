import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./FreelancerDashboard.css";

export default function FreelancerDashboard() {
  const navigate = useNavigate();

  const [view, setView] = useState("browse");

  const [projects, setProjects] = useState([]);

  const [leaderboard] = useState([
    { name: "Arjun Sharma", score: 96, projects: 12 },
    { name: "Priya Mehra", score: 91, projects: 8 },
    { name: "Ravi Kumar", score: 87, projects: 15 },
    { name: "Ananya Das", score: 82, projects: 6 },
  ]);

  const user = JSON.parse(localStorage.getItem("user"));
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/projects/all"
      );

      const data = await response.json();

      setProjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApply = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/apply/${projectId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },

        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Applied successfully");

      fetchProjects();
    } catch (error) {
      console.log(error);
      alert("Error applying");
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          FreelanceChain
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${
              view === "browse" ? "active" : ""
            }`}
            onClick={() => setView("browse")}
          >
            🔍 Browse Projects
          </div>

          <div
            className={`nav-item ${
              view === "leaderboard" ? "active" : ""
            }`}
            onClick={() => setView("leaderboard")}
          >
            🏆 Leaderboard
          </div>

          <div
            className="nav-item"
            onClick={() => {
  const myProject = projects.find(
    (p) => p.freelancer?._id === user.id
  );

  if (!myProject) {
    alert("You have no active project yet");
    return;
  }

  navigate(`/milestones/${myProject._id}`);
}}
          >
            🔗 My Milestones
          </div>

          <div className="nav-item">
            ⚙️ Settings
            
          </div>
          <div className="nav-item" onClick={handleLogout}>
  🚪 Logout
</div>
        </nav>

        {/* Trust Score */}
        <div className="sidebar-trust">
          <div className="trust-label-row">
            <span>Your Trust Score</span>

            <span className="trust-num">
              74
            </span>
          </div>

          <div className="trust-bar">
            <div
              className="trust-fill"
              style={{ width: "74%" }}
            ></div>
          </div>

          <div className="trust-hint">
            Complete milestones on time to
            increase!
          </div>
        </div>

        <div className="sidebar-user">
          <div
            className="user-avatar"
            style={{ background: "var(--green)" }}
          >
            F
          </div>

          <div>
            <div className="user-name">
              {user?.name}
            </div>

            <div className="user-role">
              Freelancer
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {view === "browse" ? (
          <>
            <div className="main-header">
              <div>
                <h1>Browse Projects</h1>

                <p className="sub-text">
                  Find projects that match your
                  skills
                </p>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-val">
                  {
                    projects.filter(
                      (p) =>
                        p.freelancer?._id ===
                        user.id
                    ).length
                  }
                </div>

                <div className="stat-label">
                  Applied
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-val">
                  {
                    projects.filter(
                      (p) =>
                        p.freelancer?._id ===
                          user.id &&
                        p.status ===
                          "In Progress"
                    ).length
                  }
                </div>

                <div className="stat-label">
                  Active Project
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-val">
                  5
                </div>

                <div className="stat-label">
                  Milestones Done
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-val">
                  74
                </div>

                <div className="stat-label">
                  Trust Score
                </div>
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <h3 style={{ marginBottom: "16px" }}>
                Available Projects
              </h3>

              <div className="freelancer-grid">
                {projects.map((p) => {
                  const isApplied =
                    p.freelancer?._id ===
                    user.id;

                  return (
                    <div
                      className="project-card"
                      key={p._id}
                      onClick={() => {
  if (p.freelancer?._id === user.id) {
    navigate(`/milestones/${p._id}`);
  }
}}
                    >
                      <div className="pc-top">
                        <div className="pc-title">
                          {p.title}
                        </div>

                        <span
                          className={`tag ${
                            p.status === "Open"
                              ? "tag-green"
                              : "tag-purple"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="pc-client">
                        Client:{" "}
                        {p.client?.name}
                      </div>

                      <div className="pc-meta-row">
                        <span>
                          💰 ₹{p.budget}
                        </span>

                        <span>
                          📅 {p.deadline}
                        </span>
                      </div>

                      <div className="pc-skills">
                        <span className="skill-tag">
                          MERN
                        </span>

                        <span className="skill-tag">
                          React
                        </span>

                        <span className="skill-tag">
                          Node.js
                        </span>
                      </div>

                      <button
                        className={
                          isApplied
                            ? "btn-outline"
                            : "btn-primary"
                        }
                        style={{
                          width: "100%",
                          marginTop: "14px",
                        }}
                        disabled={
                          isApplied ||
                          p.freelancer
                        }
                        onClick={() =>
                          handleApply(p._id)
                        }
                      >
                        {isApplied
                          ? "Applied ✓"
                          : p.freelancer
                          ? "Assigned"
                          : "Apply Now"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="main-header">
              <div>
                <h1>🏆 Leaderboard</h1>

                <p className="sub-text">
                  Top freelancers ranked by
                  Trust Score
                </p>
              </div>
            </div>

            <div
              className="card"
              style={{ marginTop: "8px" }}
            >
              {leaderboard.map((f, i) => (
                <div
                  className={`lb-row ${
                    f.name === user?.name
                      ? "lb-you"
                      : ""
                  }`}
                  key={f.name}
                >
                  <div className="lb-rank">
                    {i + 1}
                  </div>

                  <div
                    className="fc-avatar"
                    style={{
                      width: 36,
                      height: 36,
                      fontSize: 14,
                    }}
                  >
                    {f.name[0]}
                  </div>

                  <div className="lb-name">
                    {f.name}
                  </div>

                  <div
                    className="trust-score"
                    style={{ flex: 1 }}
                  >
                    <div className="trust-bar">
                      <div
                        className="trust-fill"
                        style={{
                          width: `${f.score}%`,
                        }}
                      ></div>
                    </div>

                    <div className="trust-num">
                      {f.score}
                    </div>
                  </div>

                  <div className="lb-projects">
                    {f.projects} projects
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
