import { z } from "zod"

export const signupSchema = z.object({
    fullName: z.string(),
    email: z.string().email(),
    username: z.string(),
    coverImage: z.string().optional(),
    avatar: z.string().optional(),
    password: z.string()
    
})

export const loginSchema = z.object({
    email: z.string().email().optional(),
    username: z.string().optional(),
    password: z.string()
})

export const changePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string()
})

export const updateAccountDetailsSchema = z.object({
    email: z.string().email().optional(),
    fullName: z.string().optional()
})

export const updateAvatarImageSchema = z.object({
    avatar: z.string().min(1, { message: "Avatar File path is required !!." }),
})

export const updateUserCoverImageSchema = z.object({
    coverImage: z.string().min(1, { message: "coverImage File path is required !!." }),
})

export const getUserChannelProfileSchema = z.object({
    username: z.string()
})
