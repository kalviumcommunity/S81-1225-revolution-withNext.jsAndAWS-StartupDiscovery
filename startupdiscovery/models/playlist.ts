import { Schema, model, models } from "mongoose";

const PlaylistSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
    },
    title: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    select: [
      {
        type: Schema.Types.ObjectId,
        ref: "Startup",
      },
    ],
  },
  { timestamps: true }
);

const Playlist = models.Playlist || model("Playlist", PlaylistSchema);

export default Playlist;
