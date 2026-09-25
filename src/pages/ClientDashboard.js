import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function ClientDashboard() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const [projects, setProjects] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);

  const [applications, setApplications] = useState([]);

  const [newProject, setNewProject] = useState({
    title: "",
    budget: "",
    deadline: "",
    milestones: "",
  });


  const user = JSON.parse(localStorage.getItem("user"));
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/projects/all");

      const data = await response.json();

      setProjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const statusColor = (s) => {
    if (s === "In Progress") return "tag tag-purple";
    if (s === "Pending Review") return "tag tag-red";
    if (s === "Open") return "tag tag-green";
    return "tag tag-gray";
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/projects/create",
        {
          method: "POST",

          headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},

          body: JSON.stringify(newProject),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Project created successfully");

      setShowModal(false);

      setNewProject({
        title: "",
        budget: "",
        deadline: "",
        milestones: "",
      });

      fetchProjects();
    } catch (error) {
      console.log(error);
      alert("Error creating project");
    }
  };

  const fetchApplications = async (project) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/project/${project._id}`,
        {
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

      setSelectedProject(project);
      setApplications(data);
    } catch (error) {
      console.log(error);
      alert("Error loading applications");
    }
  };

  const updateApplication = async (applicationId, action) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/${action}`,
        {
          method: "PATCH",
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

      await fetchApplications(selectedProject);
      if (action === "accept") {
        setSelectedProject({
          ...selectedProject,
          status: "In Progress",
          freelancer: data.application.freelancer,
        });
      }
      fetchProjects();
    } catch (error) {
      console.log(error);
      alert("Error updating application");
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">FreelanceChain</div>

        <nav className="sidebar-nav">
          <div className="nav-item active">📁 My Projects</div>

          <div
            className="nav-item"
            onClick={() => navigate("/freelancer-dashboard")}
          >
            👥 Freelancers
          </div>

          <div className="nav-item">💳 Payments</div>

          <div className="nav-item">⚙️ Settings</div>
          <div className="nav-item" onClick={handleLogout}>
  🚪 Logout
</div>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">C</div>

          <div>
            <div className="user-name">{user?.name}</div>

            <div className="user-role">Client</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="main-header">
          <div>
            <h1>My Projects</h1>

            <p className="sub-text">
              Manage your projects and milestone chains
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + New Project
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-val">{projects.length}</div>

            <div className="stat-label">Total Projects</div>
          </div>

          <div className="stat-card">
            <div className="stat-val">
              {
                projects.filter((p) => p.status === "In Progress").length
              }
            </div>

            <div className="stat-label">Active</div>
          </div>

          <div className="stat-card">
            <div className="stat-val">
              {projects.reduce(
                (acc, p) =>
                  acc +
                  p.milestones.filter(
                    (m) => m.status === "completed"
                  ).length,
                0
              )}
            </div>

            <div className="stat-label">
              Completed Milestones
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-val">
              ₹
              {projects.reduce(
                (acc, p) => acc + Number(p.budget),
                0
              )}
            </div>

            <div className="stat-label">Budget Used</div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="card" style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "20px" }}>
            All Projects
          </h3>

          <div className="project-list">
            {projects.map((p) => {
              const completed = p.milestones.filter(
                (m) => m.status === "completed"
              ).length;

              return (
                <div
                  className="project-row"
                  key={p._id}
                  onClick={() =>
                    navigate(`/milestones/${p._id}`)
                  }
                >
                  <div className="project-info">
                    <div className="project-title">
                      {p.title}
                    </div>

                    <div className="project-meta">
                      Freelancer:{" "}
                      {p.freelancer
                        ? p.freelancer.name
                        : "Not Assigned"}{" "}
                      · Deadline: {p.deadline}
                    </div>
                  </div>

                  <div className="project-progress-wrap">
                    <div className="progress-label">
                      {completed}/{p.milestones.length} milestones
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            (completed /
                              p.milestones.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="project-budget">
                    ₹{p.budget}
                  </div>

                  <button
                    className="btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchApplications(p);
                    }}
                  >
                    Applications
                  </button>

                  <span className={statusColor(p.status)}>
                    {p.status}
                  </span>

                  <span className="arrow">→</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create New Project</h2>

            <form
              onSubmit={handleCreate}
              className="modal-form"
            >
              <div className="form-group">
                <label>Project Title</label>

                <input
                  type="text"
                  placeholder="e.g. E-Commerce Website"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Budget (₹)</label>

                <input
                  type="number"
                  placeholder="25000"
                  value={newProject.budget}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      budget: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>

                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      deadline: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Milestones</label>

                <input
                  type="number"
                  placeholder="4"
                  min="1"
                  max="10"
                  value={newProject.milestones}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      milestones: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Create Project
                </button>

                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedProject && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Applications for {selectedProject.title}</h2>

            {applications.length === 0 ? (
              <p>No applications yet.</p>
            ) : (
              applications.map((application) => (
                <div key={application._id} style={{ marginBottom: "18px" }}>
                  <strong>{application.freelancer?.name}</strong>
                  <p>{application.proposal || "No proposal provided."}</p>
                  <p>
                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                  <p>Status: {application.status}</p>

                  {application.status === "PENDING" &&
                    selectedProject.status === "Open" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-primary"
                          onClick={() =>
                            updateApplication(application._id, "accept")
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() =>
                            updateApplication(application._id, "reject")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                </div>
              ))
            )}

            <button
              type="button"
              className="btn-outline"
              onClick={() => setSelectedProject(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}