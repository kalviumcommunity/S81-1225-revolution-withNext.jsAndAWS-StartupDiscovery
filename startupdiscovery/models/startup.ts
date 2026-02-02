import { Schema, model, models } from "mongoose";

const StartupSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      required: [true, "Please enter a category"],
      minlength: [1, "Please enter a category"],
      maxlength: [20, "Category must be 20 characters or less"],
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
    pitch: {
      type: String,
    },
  },
  { timestamps: true }
);

const Startup = models.Startup || model("Startup", StartupSchema);

export default Startup;
