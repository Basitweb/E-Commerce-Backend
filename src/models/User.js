import mongoose from 'mongoose'; 
import bcrypt from 'bcryptjs';
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

  verificationToken: String,
verificationTokenExpire: Date,
isVerified: {
  type: Boolean,
  default: false,
},

    isActive: {
      type: Boolean,
      default: true,
    },

    name: {
      first: {
        type: String,
        // required: true,
        trim: true,
      },
      last: {
        type: String,
        trim: true,
      },
    },

    phone: {
      primary: {
        type: String,
        // required: true,
      },
      secondary: {
        type: String,
      },
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // 🔥 Recommended Extra Fields
    avatar: {
      type: String, // image URL (Cloudinary etc)
    },

    lastLogin: {
      type: Date,
    },

    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema({
  //   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   role: { type: String, default: "user" },
//   isVerified: { type: Boolean, default: false },
//   avatar: {
//     url: String,
//     public_id: String
//   }
// }, { timestamps: true });

// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

userSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) return;

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// 🔑 Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.verificationTokenExpire = Date.now() + 10 * 60 * 1000;

  return token;
};
// userSchema.methods.generateEmailVerificationToken = function () {
//   const token = crypto.randomBytes(32).toString("hex");

//   this.verificationToken = crypto
//     .createHash("sha256")
//     .update(token)
//     .digest("hex");

//   this.verificationTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min

//   return token; // send raw token in email
// };
// export default mongoose.model("User", userSchema);
  export default mongoose.model("User", userSchema);