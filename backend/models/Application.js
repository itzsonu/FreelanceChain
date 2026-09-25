const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proposal: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ project: 1 });
applicationSchema.index({ freelancer: 1 });
applicationSchema.index({ project: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
