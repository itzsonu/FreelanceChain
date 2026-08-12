const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    enum: ["locked", "active", "submitted", "completed"],
    default: "locked",
  },

  payment: {
    type: Number,
    default: 0,
  },

  submittedWork: {
    type: String,
    default: "",
  },

  submittedAt: {
    type: Date,
    default: null,
  },

  approvedAt: {
    type: Date,
    default: null,
  },
});

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    deadline: {
      type: String,
      required: true,
    },

    milestones: [milestoneSchema],

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);