// import mongoose, { Schema } from "mongoose";
// import bcrypt from "bcrypt"
// import jwt from "jsonwebtoken"

// export interface IUserSchema {
//     fullName: string,
//     email: string,
//     username: string,
//     coverImage: string,
//     avatar: string,
//     password: string,
//     refreshToken: string,
//     watchedHistory: [],
//     isPasswordCorrect: any,
//     generateRefreshToken: any,
//     generateAccessToken: any
// }

// const userSchema = new Schema<IUserSchema>(
//     {
//         fullName: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         username: {
//             type: String,
//             required: true,
//             unique: true,
//             lowercase: true,
//             trim: true
//         },
//         email: {
//             type: String,
//             required: true,
//             lowercase: true,
//             unique: true,
//             trim: true
//         },
//         avatar: {
//             type: {
//                 public_id: String,
//                 url: String 
//             },
//             required: true
//         },
//         coverImage: {
//             type: {
//                 public_id: String,
//                 url: String 
//             },
//         },
//         watchedHistory: [
//             {
//                 type: Schema.Types.ObjectId,
//                 ref: "Video"
//             }
//         ],
//         password: {
//             type: String,
//             required: true
//         },
//         refreshToken: {
//             type: String
//         }
//     },
//     {
//         timestamps: true
//     }
// )

// userSchema.pre("save", async function (next) {
//     if(!this.isModified("password")) return next()
//     this.password = await bcrypt.hash(this.password, 10)
//     next()
// })

// userSchema.methods.isPasswordCorrect = async function (password:string) {
//     return await bcrypt.compare(password, this.password)
// }

// userSchema.methods.generateAccessToken = function () {
//     // @ts-ignore
//     return jwt.sign(
//         {
//             _id: this._id
//         },
//         process.env.JWT_ACCESS_TOKEN!,
//         {
//             expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY
//         }
//     )
// }


// userSchema.methods.generateRefreshToken = function () {
//     // @ts-ignore
//     return jwt.sign(
//         {
//             _id: this._id
//         },
//         process.env.JWT_REFRESH_TOKEN!,
//         {
//             expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY
//         }
//     )
// }

// export const User = mongoose.model("User", userSchema)





import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ---------- Interfaces ----------
interface IImage {
  public_id: string;
  url: string;
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  username: string;
  avatar: IImage;
  coverImage?: IImage;
  password: string;
  refreshToken?: string;
  watchedHistory: mongoose.Types.ObjectId[];

  // Methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// ---------- Schema ----------
const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    avatar: {
      type: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
      required: true,
    },
    coverImage: {
      type: {
        public_id: String,
        url: String,
      }
    },
    watchedHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ---------- Hooks ----------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ---------- Methods ----------
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
    // @ts-ignore
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_ACCESS_TOKEN as string,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
//   @ts-ignore
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_REFRESH_TOKEN as string,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    }
  );
};

// ---------- Model ----------
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
