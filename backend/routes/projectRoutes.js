const express = require("express");
const Project = require("../models/Project");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, allowRoles("client"), async (req, res) => {
  try {
    const { title, budget, deadline, milestones } = req.body;

    if (!title || !budget || !deadline || !milestones) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const milestoneArray = [];

    for (let i = 0; i < milestones; i++) {
      milestoneArray.push({
        title: `Milestone ${i + 1}`,
        status: i === 0 ? "active" : "locked",
        payment: budget / milestones,
      });
    }

    const project = await Project.create({
      title,
      budget,
      deadline,
      milestones: milestoneArray,
      client: req.user._id,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "name email")
      .populate("freelancer", "name email");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("client", "name email")
      .populate("freelancer", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post(
  "/:projectId/milestone/:milestoneId/submit",
  protect,
  allowRoles("freelancer"),
  async (req, res) => {
    try {
      const { submittedWork } = req.body;

      const project = await Project.findById(req.params.projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const milestone = project.milestones.id(req.params.milestoneId);

      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      if (milestone.status !== "active") {
        return res.status(400).json({
          message: "Only active milestone can be submitted",
        });
      }

      milestone.status = "submitted";
      milestone.submittedWork = submittedWork;
      milestone.submittedAt = new Date();

      await project.save();

      res.json({
        message: "Milestone submitted successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

router.post(
  "/:projectId/milestone/:milestoneId/approve",
  protect,
  allowRoles("client"),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const milestoneIndex = project.milestones.findIndex(
        (m) => m._id.toString() === req.params.milestoneId
      );

      if (milestoneIndex === -1) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      const milestone = project.milestones[milestoneIndex];

      if (milestone.status !== "submitted") {
        return res.status(400).json({
          message: "Only submitted milestone can be approved",
        });
      }

      milestone.status = "completed";
      milestone.approvedAt = new Date();

      if (project.milestones[milestoneIndex + 1]) {
        project.milestones[milestoneIndex + 1].status = "active";
      } else {
        project.status = "Completed";
      }

      await project.save();

      res.json({
        message: "Milestone approved successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;