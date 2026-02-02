import { Schema, model, models } from "mongoose";

const AuthorSchema = new Schema(
  {
    id: {
      type: Number,
    },
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Author = models.Author || model("Author", AuthorSchema);

export default Author;
