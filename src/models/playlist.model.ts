import mongoose, { Schema, Document } from "mongoose";

export interface IPlaylist extends Document {
  name: string;
  description: string;
  videos: mongoose.Types.ObjectId[]; 
  owner: mongoose.Types.ObjectId; 
}

const playlistSchema = new Schema<IPlaylist>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String, 
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Playlist = mongoose.model<IPlaylist>("Playlist", playlistSchema);
















// import mongoose, { Schema } from "mongoose";
// import { string } from "zod";

// interface video {
//     videos: Schema.Types.ObjectId
// }

// interface IPlaylist {
//     name: string,
//     description: string,
//     videos: video[],
//     owner: Schema.Types.ObjectId
// }

// const playlistSchema = new Schema<IPlaylist>(
//     {
//         owner: {
//             type: Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },
//         name: {
//             type: string,
//             required: true,
//             trim: true
//         },
//         description: {
//             type: string,
//             required: true
//         },
//         videos: [
//             {
//                 type: Schema.Types.ObjectId,
//                 ref: "Video"
//             }
//         ]
//     },
//     {
//         timestamps: true
//     }
// )

// export const Playlist = mongoose.model<IPlaylist>("Playlist", playlistSchema)