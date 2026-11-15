require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");

// Firebase Admin SDK
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json"
);

initializeApp({
    credential: cert(serviceAccount)
});

console.log("Firebase Admin Connected Successfully!");
console.log("Admin UID Loaded:", !!process.env.ADMIN_UID);

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Verify Firebase User
async function verifyFirebaseToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized. Please login."
        });
    }

    try {
        const token = authHeader.split(" ")[1];
        req.user = await getAuth().verifyIdToken(token);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Firebase token."
        });
    }
}

// Check Admin Permission
function adminOnly(req, res, next) {
    if (req.user.uid !== process.env.ADMIN_UID) {
        return res.status(403).json({
            message: "Admin access only."
        });
    }

    next();
}

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas Connected Successfully!");
        
        app.listen(5000, () => {
            console.log('Server running on port 5000');
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });

// Blog Schema
const blogSchema = new mongoose.Schema({
    newTitle: String,
    newContent: String,
    date: String,
    likes: Number
});

const Blog = mongoose.model('Blog', blogSchema);

// GET All Blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find({});
        res.send(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LIKE Blog
app.patch('/api/blogs/like/:id', async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                message: 'Blog not found'
            });
        }

        res.json(updatedBlog);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADD Blog - Admin Only
app.post('/api/blogs', verifyFirebaseToken, adminOnly, async (req, res) => {
    try {
        const blog = new Blog({
            newTitle: req.body.newTitle,
            newContent: req.body.newContent,
            date: req.body.date,
            likes: req.body.likes ?? 0
        });

        const newBlog = await blog.save();

        res.status(201).json(newBlog);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// EDIT Blog - Admin Only
app.patch('/api/blogs/:id', verifyFirebaseToken, adminOnly, async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                newTitle: req.body.newTitle,
                newContent: req.body.newContent
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedBlog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(updatedBlog);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE Blog - Admin Only
app.delete('/api/blogs/:id', verifyFirebaseToken, adminOnly, async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

        if (!deletedBlog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json({
            message: "Blog deleted successfully!"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

