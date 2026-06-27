import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    }
}, {
    timestamps: true
});

// Pre-save hook to hash password before saving to DB
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password during login
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = model('User', UserSchema);
