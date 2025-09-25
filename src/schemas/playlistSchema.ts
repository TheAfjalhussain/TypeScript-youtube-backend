import { z } from "zod";
import mongoose, { isValidObjectId } from "mongoose";

export const createPlaylistSchema = z.object({
    name: z.string().trim(),
    description: z.string()
})



export const getUserPlaylistsSchema = z.object({
  userId: z.string().refine((val) => isValidObjectId(val), {
      message: "Invalid user Id format",
    }),
});


export const getPlaylistByIdSchema = z.object({
    PlaylistId: z.string().refine((val) => isValidObjectId(val), {
      message: "Invalid Playlist Id format",
    }),
})

export const addVideoToPlaylistSchema = z.object({
  playlistId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid playlist Id format",
  }),
  videoId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid video Id format",
  })
});

export const removeVideoToPlaylistSchema = z.object({
  playlistId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid playlist Id format",
  }),
  videoId: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid video Id format",
  })
});

export const deletePlaylistSchema = z.object({
    playlistId: z.string().refine((val) =>  isValidObjectId(val), {
        message: "invalid Playlist id format !!."
    })
})

export const updatePlaylistSchema = z.object({
    params: z.object({
        playlistId: z.string().refine((val) => isValidObjectId(val), {
           message: "Invalid playlist id."
        })
    }),
    body: z.object({
        name: z.string().trim(),
        description: z.string()
    })
})