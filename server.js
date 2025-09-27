const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        'https://entropyproductions.site',
        'https://www.entropyproductions.site'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// In-memory storage (fallback if MongoDB not available)
let users = [];
let modules = [
    {
        id: 1,
        category: 'Design',
        title: 'Intro to Graphic Design',
        description: 'Learn the fundamentals of visual design, color theory, and typography. Perfect for beginners!',
        duration: '2 hours',
        level: 'Beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 2,
        category: 'Design',
        title: 'UI/UX Design Basics',
        description: 'Master user interface and experience design principles for digital products.',
        duration: '3 hours',
        level: 'Beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 3,
        category: 'Design',
        title: 'Digital Photography',
        description: 'Capture stunning images with professional techniques and composition rules.',
        duration: '2.5 hours',
        level: 'Intermediate',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 4,
        category: 'Filmmaking',
        title: 'Intro to Storyboarding',
        description: 'Plan your films with professional storyboarding techniques and visual storytelling.',
        duration: '2 hours',
        level: 'Beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 5,
        category: 'Filmmaking',
        title: 'Cinematography 101',
        description: 'Learn camera angles, lighting, and shot composition for compelling visuals.',
        duration: '3 hours',
        level: 'Intermediate',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 6,
        category: 'Filmmaking',
        title: 'Video Editing Mastery',
        description: 'Master post-production with industry-standard editing software and techniques.',
        duration: '4 hours',
        level: 'Intermediate',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 7,
        category: 'Music',
        title: 'Music Production Basics',
        description: 'Create professional-quality tracks using digital audio workstations and mixing techniques.',
        duration: '3 hours',
        level: 'Beginner',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 8,
        category: 'Music',
        title: 'Audio Recording & Mixing',
        description: 'Learn professional recording techniques and audio mixing for crystal-clear sound.',
        duration: '2.5 hours',
        level: 'Intermediate',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    },
    {
        id: 9,
        category: 'Music',
        title: 'Sound Design for Film',
        description: 'Create immersive soundscapes and audio effects for video projects.',
        duration: '3.5 hours',
        level: 'Advanced',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        enrolled: 0
    }
];

// MongoDB connection (optional)
let User;
try {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/entropy-productions', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        age: { type: Number, required: true, min: 13, max: 19 },
        password: { type: String, required: true },
        enrolledModules: [{ type: Number }],
        createdAt: { type: Date, default: Date.now }
    });
    
    User = mongoose.model('User', userSchema);
    console.log('Connected to MongoDB');
} catch (error) {
    console.log('MongoDB not available, using in-memory storage');
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'entropy-productions-secret-key-2024';

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Entropy Productions API is running',
        timestamp: new Date().toISOString()
    });
});

// Get all modules
app.get('/api/entropy', (req, res) => {
    try {
        const categorizedModules = {
            Design: modules.filter(module => module.category === 'Design'),
            Filmmaking: modules.filter(module => module.category === 'Filmmaking'),
            Music: modules.filter(module => module.category === 'Music')
        };
        
        res.json({
            success: true,
            data: categorizedModules,
            totalModules: modules.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch modules' 
        });
    }
});

// Get specific module by ID
app.get('/api/entropy/module/:id', (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const module = modules.find(m => m.id === moduleId);
        
        if (!module) {
            return res.status(404).json({ 
                success: false, 
                error: 'Module not found' 
            });
        }
        
        res.json({
            success: true,
            data: module
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch module' 
        });
    }
});

// User signup
app.post('/signup', async (req, res) => {
    try {
        const { name, email, age, password } = req.body;
        
        // Validation
        if (!name || !email || !age || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }
        
        if (age < 13 || age > 19) {
            return res.status(400).json({ 
                success: false, 
                error: 'Age must be between 13 and 19' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password must be at least 6 characters long' 
            });
        }
        
        // Check if user already exists
        let existingUser;
        if (User) {
            existingUser = await User.findOne({ email });
        } else {
            existingUser = users.find(user => user.email === email);
        }
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists with this email' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const newUser = {
            name,
            email,
            age,
            password: hashedPassword,
            enrolledModules: [],
            createdAt: new Date()
        };
        
        let savedUser;
        if (User) {
            savedUser = await User.create(newUser);
        } else {
            newUser.id = users.length + 1;
            users.push(newUser);
            savedUser = newUser;
        }
        
        // Generate token
        const token = generateToken(savedUser.id || savedUser._id);
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: savedUser.id || savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                age: savedUser.age,
                enrolledModules: savedUser.enrolledModules
            },
            token
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create user' 
        });
    }
});

// User login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            });
        }
        
        // Find user
        let user;
        if (User) {
            user = await User.findOne({ email });
        } else {
            user = users.find(u => u.email === email);
        }
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }
        
        // Generate token
        const token = generateToken(user.id || user._id);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id || user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                enrolledModules: user.enrolledModules
            },
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to login' 
        });
    }
});

// Get user profile (protected route)
app.get('/modules', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Find user
        let user;
        if (User) {
            user = await User.findById(userId);
        } else {
            user = users.find(u => u.id === userId);
        }
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        // Get enrolled modules
        const enrolledModules = modules.filter(module => 
            user.enrolledModules.includes(module.id)
        );
        
        // Get completed modules
        const completedModules = modules.filter(module => 
            user.completedModules && user.completedModules.includes(module.id)
        );
        
        // Calculate progress for each enrolled module
        const progress = {};
        user.enrolledModules.forEach(moduleId => {
            progress[moduleId] = user.moduleProgress && user.moduleProgress[moduleId] || 0;
        });
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id || user._id,
                    name: user.name,
                    email: user.email,
                    age: user.age
                },
                enrolledModules: user.enrolledModules || [],
                completedModules: user.completedModules || [],
                progress: progress,
                enrolledModulesData: enrolledModules,
                completedModulesData: completedModules,
                allModules: modules
            }
        });
        
    } catch (error) {
        console.error('Get modules error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch user modules' 
        });
    }
});

// Enroll in a module (protected route)
app.post('/modules/enroll', authenticateToken, async (req, res) => {
    try {
        const { moduleId } = req.body;
        const userId = req.user.userId;
        
        if (!moduleId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Module ID is required' 
            });
        }
        
        // Check if module exists
        const module = modules.find(m => m.id === parseInt(moduleId));
        if (!module) {
            return res.status(404).json({ 
                success: false, 
                error: 'Module not found' 
            });
        }
        
        // Find user
        let user;
        if (User) {
            user = await User.findById(userId);
        } else {
            user = users.find(u => u.id === userId);
        }
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        // Check if already enrolled
        if (user.enrolledModules.includes(parseInt(moduleId))) {
            return res.status(400).json({ 
                success: false, 
                error: 'Already enrolled in this module' 
            });
        }
        
        // Enroll user
        user.enrolledModules.push(parseInt(moduleId));
        module.enrolled += 1;
        
        if (User) {
            await user.save();
        }
        
        res.json({
            success: true,
            message: 'Successfully enrolled in module',
            data: {
                module: module,
                enrolledModules: user.enrolledModules
            }
        });
        
    } catch (error) {
        console.error('Enroll error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to enroll in module' 
        });
    }
});

// Mark module as completed (protected route)
app.post('/modules/complete', authenticateToken, async (req, res) => {
    try {
        const { moduleId } = req.body;
        const userId = req.user.userId;
        
        if (!moduleId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Module ID is required' 
            });
        }
        
        // Check if module exists
        const module = modules.find(m => m.id === parseInt(moduleId));
        if (!module) {
            return res.status(404).json({ 
                success: false, 
                error: 'Module not found' 
            });
        }
        
        // Find user
        let user;
        if (User) {
            user = await User.findById(userId);
        } else {
            user = users.find(u => u.id === userId);
        }
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        // Check if user is enrolled
        if (!user.enrolledModules.includes(parseInt(moduleId))) {
            return res.status(400).json({ 
                success: false, 
                error: 'You must be enrolled in this module to complete it' 
            });
        }
        
        // Check if already completed
        if (user.completedModules && user.completedModules.includes(parseInt(moduleId))) {
            return res.status(400).json({ 
                success: false, 
                error: 'Module already completed' 
            });
        }
        
        // Mark as completed
        if (!user.completedModules) {
            user.completedModules = [];
        }
        user.completedModules.push(parseInt(moduleId));
        
        // Set progress to 100%
        if (!user.moduleProgress) {
            user.moduleProgress = {};
        }
        user.moduleProgress[moduleId] = 100;
        
        if (User) {
            await user.save();
        }
        
        res.json({
            success: true,
            message: 'Module marked as completed',
            data: {
                module: module,
                completedModules: user.completedModules,
                progress: user.moduleProgress
            }
        });
        
    } catch (error) {
        console.error('Complete module error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to complete module' 
        });
    }
});

// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/signup') || req.path.startsWith('/login') || req.path.startsWith('/modules') || req.path.startsWith('/health')) {
        return res.status(404).json({ 
            success: false, 
            error: 'Route not found' 
        });
    }
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Something went wrong!' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Entropy Productions API running on port ${PORT}`);
    console.log(`📚 Available routes:`);
    console.log(`   GET  /health - Health check`);
    console.log(`   GET  /api/entropy - Get all modules`);
    console.log(`   GET  /api/entropy/module/:id - Get specific module`);
    console.log(`   POST /signup - User registration`);
    console.log(`   POST /login - User login`);
    console.log(`   GET  /modules - Get user modules (protected)`);
    console.log(`   POST /modules/enroll - Enroll in module (protected)`);
    console.log(`\n🌐 Frontend should connect to: http://localhost:${PORT}`);
});

module.exports = app;
