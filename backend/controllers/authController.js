import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    });
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).
            json({ message: "Please provide name, email and password" });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        // Check if user already exists
        const exists = await User.findOne({ email: email.toLowerCase() });

        if (exists) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email : email.toLowerCase(),
            password,
            avatar: name.charAt(0).toUpperCase(),
        });

        // Generate JWT
        const token = signToken(user._id);
        res.status(201).json({user, token});


    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const login = async (req,res) =>{
    try{
        const {email,password}=req.body;
        if(!email || !password)
            return res.status(400).json({message: "Email and Password required"});

        const user = await User.findOne({email: email.toLowerCase()});
        if(!user || !(await user.matchPassword(password))){
            return res.status(401).json({message: "Invalid email or password"});
        }
        const token= signToken(user._id);
        res.json({user,token});
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
};

export const me= async(req,res) => {
    res.json({user : req.user});
}

export const updateProfile = async (req, res) => {
    try {
        const { name,  morningMotivation } = req.body;
        const user = await User.findById(req.user._id);

        // Prepare update object
        if (name !== undefined){
            user.name = name;
            user.avatar= name.charAt(0).toUpperCase();
        }
        if (morningMotivation !== undefined) user.morningMotivation = morningMotivation;

        // Update user
        await user.save();
        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        res.status(500).json({ message:  err.message });
    }
};