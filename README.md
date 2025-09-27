# Entropy Productions - Teen Creative Platform

A full-stack web application for teenage creators to learn, collaborate, and showcase their talents in filmmaking, design, and music.

## Project Structure

```
ENTRO/
├── frontend/                 # Frontend files
│   ├── index.html           # Main HTML file
│   ├── styles.css           # CSS styles
│   └── script.js            # JavaScript functionality
├── node_modules/            # Node.js dependencies
├── package.json             # Project dependencies
├── package-lock.json        # Lock file for dependencies
├── server.js                # Express.js backend server
├── start.sh                 # Startup script
└── README.md               # This file
```

## Features

- **User Authentication**: Sign up and login for teens (ages 13-19)
- **Learning Modules**: Interactive courses in Design, Filmmaking, and Music
- **Progress Tracking**: Monitor learning progress and completed courses
- **Workshop Registration**: Sign up for live workshops and events
- **Community Features**: Discussion forums and creator showcase
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- MongoDB (optional - falls back to in-memory storage)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/entropy-productions
JWT_SECRET=your-secret-key-here
```

### 3. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Using the startup script
```bash
chmod +x start.sh
./start.sh
```

## Running the Application

1. **Start the server**: The application will run on `http://localhost:3000`
2. **Access the frontend**: Open your browser and navigate to `http://localhost:3000`
3. **API endpoints**: Available at `http://localhost:3000/api/entropy`

## API Endpoints

### Public Routes
- `GET /health` - Health check
- `GET /api/entropy` - Get all learning modules
- `GET /api/entropy/module/:id` - Get specific module
- `POST /signup` - User registration
- `POST /login` - User login

### Protected Routes (require authentication)
- `GET /modules` - Get user's enrolled modules
- `POST /modules/enroll` - Enroll in a module
- `POST /modules/complete` - Mark module as completed

## Deployment Instructions

### For Hostinger VPS or any Node.js hosting:

#### 1. Prepare the Server
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Upload Your Project
```bash
# Upload your project files to the server
# You can use SCP, SFTP, or Git clone
scp -r /path/to/ENTRO user@your-server-ip:/home/user/
```

#### 3. Install Dependencies
```bash
cd /home/user/ENTRO
npm install --production
```

#### 4. Configure Environment Variables
```bash
# Create .env file
nano .env
```

Add the following content:
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/entropy-productions
JWT_SECRET=your-secure-secret-key-here
```

#### 5. Start the Application with PM2
```bash
# Start the application
pm2 start server.js --name "entropy-productions"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 6. Configure Nginx (Optional but recommended)
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/entropy-productions
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/entropy-productions /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt (Optional)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Database Setup (Optional)

### MongoDB Installation
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Monitoring and Maintenance

### PM2 Commands
```bash
# View running processes
pm2 list

# View logs
pm2 logs entropy-productions

# Restart application
pm2 restart entropy-productions

# Stop application
pm2 stop entropy-productions

# Monitor resources
pm2 monit
```

### Log Files
- Application logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in .env file
2. **MongoDB connection failed**: The app will fall back to in-memory storage
3. **Permission denied**: Ensure proper file permissions
4. **Module not found**: Run `npm install` to install dependencies

### Health Check
Visit `http://your-domain.com/health` to check if the API is running.

## Development

### Adding New Features
1. Update the backend API in `server.js`
2. Modify frontend in `frontend/` directory
3. Test locally with `npm run dev`
4. Deploy to production

### Code Structure
- **Backend**: Express.js with JWT authentication
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Database**: MongoDB with Mongoose ODM (optional)
- **Styling**: Custom CSS with responsive design

## Support

For issues and questions:
- Check the logs: `pm2 logs entropy-productions`
- Verify environment variables
- Ensure all dependencies are installed
- Check firewall settings for port access

## License

MIT License - see LICENSE file for details.