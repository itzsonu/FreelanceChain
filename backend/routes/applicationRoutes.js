const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const Project = require("../models/Project");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

router.post("/", protect, allowRoles("freelancer"), async (req, res) => {
  try {
    const { projectId, proposal = "" } = req.body;

    if (!projectId || !isValidId(projectId)) {
      return res.status(400).json({ message: "A valid project ID is required" });
    }

    if (typeof proposal !== "string" || proposal.length > 2000) {
      return res.status(400).json({ message: "Proposal must be 2000 characters or fewer" });
    }

    const project = await Project.findById(projectId).select("status freelancer");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== "Open" || project.freelancer) {
      return res.status(409).json({ message: "Applications are closed for this project" });
    }

    const application = await Application.create({
      project: projectId,
      freelancer: req.user._id,
      proposal,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already applied to this project" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

router.get("/mine", protect, allowRoles("freelancer"), async (req, res) => {
  try {
    const applications = await Application.find({ freelancer: req.user._id })
      .populate("project", "title status freelancer")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/project/:projectId",
  protect,
  allowRoles("client"),
  async (req, res) => {
    try {
      const { projectId } = req.params;

      if (!isValidId(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await Project.findById(projectId).select("client");

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }

      const applications = await Application.find({ project: projectId })
        .populate("freelancer", "name")
        .sort({ createdAt: -1 });

      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

const updateApplicationStatus = async (req, res, status) => {
  try {
    const { applicationId } = req.params;

    if (!isValidId(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const project = await Project.findById(application.project);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (application.status !== "PENDING") {
      return res.status(409).json({ message: "Application is no longer pending" });
    }

    if (status === "ACCEPTED") {
      if (project.status !== "Open" || project.freelancer) {
        return res.status(409).json({ message: "Project already has an assigned freelancer" });
      }

      project.freelancer = application.freelancer;
      project.status = "In Progress";
      await project.save();

      application.status = "ACCEPTED";
      await application.save();

      await Application.updateMany(
        {
          project: project._id,
          _id: { $ne: application._id },
          status: "PENDING",
        },
        { $set: { status: "REJECTED" } }
      );
    } else {
      application.status = "REJECTED";
      await application.save();
    }

    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

router.patch(
  "/:applicationId/accept",
  protect,
  allowRoles("client"),
  (req, res) => updateApplicationStatus(req, res, "ACCEPTED")
);

router.patch(
  "/:applicationId/reject",
  protect,
  allowRoles("client"),
  (req, res) => updateApplicationStatus(req, res, "REJECTED")
);

module.exports = router;
