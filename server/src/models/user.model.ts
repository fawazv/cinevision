/**
 * User Mongoose model.
 *
 * - Password is NEVER returned by default (select: false + toJSON transform)
 * - comparePassword instance method for safe credential checking
 * - findByEmailWithPassword static for the login flow
 */

import mongoose, { Schema, type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/** Raw MongoDB document — includes all fields including password. */
export interface UserDocument extends Document {
    /** Virtual `id` string (Mongoose maps _id → id automatically). */
    id: string;
    name: string;
    email: string;
    /** Hashed password — excluded from queries by default (`select: false`). */
    password: string;
    createdAt: Date;
    updatedAt: Date;
    /** Compare a plain-text password against the stored hash. */
    comparePassword(candidate: string): Promise<boolean>;
}

/** Statics available on the User model class itself. */
interface UserModel extends Model<UserDocument> {
    /** Find a user by email and include the password field for auth checks. */
    findByEmailWithPassword(email: string): Promise<UserDocument | null>;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const userSchema = new Schema<UserDocument, UserModel>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            // Never include password in query results unless explicitly requested
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true,
            transform(_doc, ret: Record<string, unknown>) {
                // Use `as` to satisfy exactOptionalPropertyTypes:
                // Mongoose puts _id on the doc, but we expose `id` (the virtual) instead
                ret['_id'] = undefined;
                ret['password'] = undefined;
                // Remove undefined keys from the serialised output
                return Object.fromEntries(
                    Object.entries(ret).filter(([, v]) => v !== undefined),
                );
            },
        },
    },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ email: 1 });

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

/** Hash password before saving — only when the password field was modified. */
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const SALT_ROUNDS = 12;
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

userSchema.methods['comparePassword'] = async function (
    this: UserDocument,
    candidate: string,
): Promise<boolean> {
    return bcrypt.compare(candidate, this.password);
};

// ─── Static Methods ───────────────────────────────────────────────────────────

userSchema.statics['findByEmailWithPassword'] = function (
    this: UserModel,
    email: string,
): Promise<UserDocument | null> {
    return this.findOne({ email }).select('+password').exec() as Promise<UserDocument | null>;
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
