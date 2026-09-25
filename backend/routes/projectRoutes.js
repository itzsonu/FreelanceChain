const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const { protect, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, allowRoles("client"), async (req, res) => {
  try {
    const { title, budget, deadline, milestones } = req.body;
    const trimmedTitle = typeof title === "string" ? title.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ message: "Project title is required" });
    }

    const numericBudget = Number(budget);
    if (
      budget === undefined ||
      budget === null ||
      budget === "" ||
      !Number.isFinite(numericBudget) ||
      numericBudget <= 0
    ) {
      return res.status(400).json({
        message: "Budget must be a number greater than 0",
      });
    }

    if (
      deadline === undefined ||
      deadline === null ||
      deadline === "" ||
      Number.isNaN(new Date(deadline).getTime())
    ) {
      return res.status(400).json({ message: "Deadline must be a valid date" });
    }

    let milestoneArray = [];

    if (Array.isArray(milestones)) {
      if (milestones.length === 0) {
        return res.status(400).json({ message: "At least one milestone is required" });
      }

      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];

        if (!milestone || typeof milestone !== "object") {
          return res.status(400).json({ message: `Milestone ${i + 1} is invalid` });
        }

        const milestoneTitle = typeof milestone.title === "string" ? milestone.title.trim() : "";

        if (!milestoneTitle) {
          return res.status(400).json({ message: `Milestone ${i + 1} title is required` });
        }

        const milestonePayment = Number(milestone.payment ?? 0);
        if (!Number.isFinite(milestonePayment) || milestonePayment < 0) {
          return res.status(400).json({
            message: `Milestone ${i + 1} payment must be a valid non-negative number`,
          });
        }

        const selectedStatus = milestone.status || "locked";
        if (!["locked", "active", "submitted", "completed"].includes(selectedStatus)) {
          return res.status(400).json({
            message: `Milestone ${i + 1} has an invalid status`,
          });
        }

        milestoneArray.push({
          title: milestoneTitle,
          description: typeof milestone.description === "string" ? milestone.description : "",
          status: selectedStatus,
          payment: milestonePayment,
          submittedWork: typeof milestone.submittedWork === "string" ? milestone.submittedWork : "",
        });
      }
    } else {
      const milestoneCount = Number(milestones);
      if (!Number.isInteger(milestoneCount) || milestoneCount <= 0) {
        return res.status(400).json({
          message: "Milestones must be a positive number or an array",
        });
      }

      for (let i = 0; i < milestoneCount; i++) {
        milestoneArray.push({
          title: `Milestone ${i + 1}`,
          status: i === 0 ? "active" : "locked",
          payment: numericBudget / milestoneCount,
        });
      }
    }

    const totalMilestonePayment = milestoneArray.reduce(
      (sum, milestone) => sum + Number(milestone.payment || 0),
      0
    );

    if (totalMilestonePayment > numericBudget) {
      return res.status(400).json({
        message: "Total milestone payments cannot exceed the project budget",
      });
    }

    const project = await Project.create({
      title: trimmedTitle,
      budget: numericBudget,
      deadline,
      milestones: milestoneArray,
      client: req.user._id,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("client", "name")
      .populate("freelancer", "name");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:projectId", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = await Project.findById(req.params.projectId)
      .populate("client", "name email")
      .populate("freelancer", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const currentUserId = req.user._id.toString();
    const projectClientId = project.client
      ? project.client._id
        ? project.client._id.toString()
        : project.client.toString()
      : null;
    const projectFreelancerId = project.freelancer
      ? project.freelancer._id
        ? project.freelancer._id.toString()
        : project.freelancer.toString()
      : null;

    const isClientProject = projectClientId && projectClientId === currentUserId;
    const isAssignedFreelancer =
      projectFreelancerId && projectFreelancerId === currentUserId;

    if (!isClientProject && !isAssignedFreelancer) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/:projectId/milestone/:milestoneId/submit",
  protect,
  allowRoles("freelancer"),
  async (req, res) => {
    try {
      const { submittedWork } = req.body;

      if (!mongoose.Types.ObjectId.isValid(req.params.milestoneId)) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
        return res.status(404).json({ message: "Project not found" });
      }

      const project = await Project.findById(req.params.projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.freelancer || project.freelancer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
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
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/:projectId/milestone/:milestoneId/approve",
  protect,
  allowRoles("client"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.milestoneId)) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
        return res.status(404).json({ message: "Project not found" });
      }

      const project = await Project.findById(req.params.projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
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
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;