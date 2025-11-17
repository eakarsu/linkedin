# LinkedIn Clone - Usage Guide

## Quick Start

### Starting the Application

Simply run the start script:

```bash
./start.sh
```

This will:
1. **Clean up ports** - Automatically free ports 3000-3002 if they're in use
2. **Clear cache** - Remove `.next` folder to ensure fresh build
3. **Check dependencies** - Install npm packages if needed
4. **Start the server** - Launch the Next.js development server

### Stopping the Application

Run the stop script:

```bash
./stop.sh
```

Or press `Ctrl+C` in the terminal where the server is running.

## Script Features

### start.sh - Main Startup Script

**Features:**
- ✅ Automatic port cleanup (3000, 3001, 3002)
- ✅ Automatic cache clearing (.next folder)
- ✅ Dependency checking and installation
- ✅ Node.js version verification
- ✅ Color-coded status messages
- ✅ Application information display
- ✅ Available pages listing

**What happens when you run it:**

```
==========================================
   LinkedIn Clone - Startup Script
==========================================

Checking and cleaning ports...
✓ Port cleanup complete

Cleaning Next.js cache...
✓ Cache cleared

✓ Node.js version: v18.17.0

Application Information:
  - Framework: Next.js 16
  - UI Library: Material-UI
  - Language: TypeScript
  - Database: None (using mock data)

Starting LinkedIn Clone...

Available pages:
  - Home Feed:    http://localhost:3000/
  - Profile:      http://localhost:3000/profile
  - Network:      http://localhost:3000/network
  - Messaging:    http://localhost:3000/messaging
  - Login:        http://localhost:3000/login
  - Signup:       http://localhost:3000/signup

Press Ctrl+C to stop the server
==========================================
```

### start-with-db.sh - Database Integration Script

**Features:**
- ✅ All features from start.sh
- ✅ Interactive database setup
- ✅ MongoDB/PostgreSQL support
- ✅ Database status checking
- ✅ Automatic .env.local creation
- ✅ Database connection guidance

**Usage:**

```bash
./start-with-db.sh
```

**Interactive prompts:**

```
Database Configuration:

This application currently uses mock data.
To enable database support, choose an option:

1) MongoDB (recommended for this project)
2) PostgreSQL
3) Skip database (use mock data only)

Enter your choice (1-3):
```

**If you choose MongoDB:**
- Checks if MongoDB is installed
- Verifies if MongoDB is running
- Attempts to start MongoDB if stopped
- Provides connection string: `mongodb://localhost:27017/linkedin-clone`

**If you choose PostgreSQL:**
- Checks if PostgreSQL is installed
- Verifies if PostgreSQL is running
- Attempts to start PostgreSQL if stopped
- Provides connection string: `postgresql://localhost:5432/linkedin_clone`

**If you skip:**
- Proceeds with mock data (current setup)

### stop.sh - Stop All Instances

**Features:**
- ✅ Finds all running Next.js processes
- ✅ Safely terminates all instances
- ✅ Confirms successful shutdown
- ✅ Color-coded messages

**Usage:**

```bash
./stop.sh
```

**Output:**

```
==========================================
   LinkedIn Clone - Stop Script
==========================================

Stopping LinkedIn Clone...

Stopping process: 12345
Stopping process: 12346

✓ LinkedIn Clone stopped successfully

==========================================
```

## Port Management

### Automatic Port Cleanup

The `start.sh` and `start-with-db.sh` scripts automatically clean up ports **3000, 3001, and 3002** before starting the application.

**Why this matters:**
- Prevents "port already in use" errors
- Ensures a fresh start every time
- Stops any zombie processes

**Ports checked:**
- **3000** - Default Next.js port
- **3001** - Fallback port if 3000 is busy
- **3002** - Second fallback port

### Manual Port Cleanup

If you need to manually free a specific port:

```bash
# Check what's using a port
lsof -ti:3000

# Kill process on a specific port
kill -9 $(lsof -ti:3000)
```

## Common Usage Scenarios

### 1. Fresh Start Each Day

```bash
./start.sh
```

The script handles everything - no need to worry about lingering processes.

### 2. Setting Up Database

```bash
./start-with-db.sh
# Choose option 1 or 2 for database setup
```

### 3. Multiple Restarts

You can run `./start.sh` multiple times. It will:
- Kill any existing instances
- Free up ports
- Start fresh

### 4. Clean Shutdown

```bash
./stop.sh
```

### 5. Quick Restart

```bash
./stop.sh && ./start.sh
```

## Troubleshooting

### Script Won't Run (Permission Denied)

Make scripts executable:

```bash
chmod +x start.sh stop.sh start-with-db.sh
```

### Port Still Shows as Busy

The script should handle this automatically, but if not:

```bash
# Find all processes on port 3000
lsof -ti:3000

# Force kill
sudo kill -9 $(lsof -ti:3000)
```

### Database Won't Start

**For MongoDB:**
```bash
# Check if installed
brew list | grep mongodb

# Start manually
brew services start mongodb-community
```

**For PostgreSQL:**
```bash
# Check if installed
brew list | grep postgresql

# Start manually
brew services start postgresql
```

### Node Modules Issues

The script auto-installs, but you can manually clean:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

When you run `start-with-db.sh`, a `.env.local` file is created with:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/linkedin-clone
DATABASE_URL=postgresql://localhost:5432/linkedin_clone

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Edit this file to configure your database and authentication.

## Development Workflow

### Recommended Workflow

1. **Start of day:**
   ```bash
   ./start.sh
   ```

2. **Make changes** - Files will hot-reload automatically

3. **Test features** - Navigate to different pages

4. **End of day:**
   ```bash
   ./stop.sh
   ```

### With Database

1. **First time setup:**
   ```bash
   ./start-with-db.sh
   # Follow prompts to setup database
   ```

2. **Subsequent starts:**
   ```bash
   ./start.sh
   # Database should already be configured
   ```

## Production Tips

### Before Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Test production build locally:**
   ```bash
   npm start
   ```

3. **Check for errors:**
   ```bash
   npm run lint
   ```

### Environment Variables for Production

Set these in your hosting platform (Vercel, AWS, etc.):

```bash
NODE_ENV=production
DATABASE_URL=your-production-database-url
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secure-secret
```

## Advanced Usage

### Custom Port

To use a specific port:

```bash
PORT=4000 npm run dev
```

### Debug Mode

```bash
NODE_OPTIONS='--inspect' npm run dev
```

### Performance Profiling

```bash
npm run build -- --profile
```

## Script Customization

### Adding More Ports to Clean

Edit `start.sh` or `start-with-db.sh`:

```bash
# Find this line:
PORTS_TO_CHECK=(3000 3001 3002)

# Add more ports:
PORTS_TO_CHECK=(3000 3001 3002 8080 8081)
```

### Changing Application Behavior

Edit the scripts to customize:
- Port checking behavior
- Dependency installation
- Pre-start checks
- Environment setup

## Support

For issues:
1. Check this USAGE.md guide
2. Review SETUP.md for installation help
3. Check the main README.md
4. Look at script output for specific errors

## Summary

**Start Application:**
```bash
./start.sh
```

**Stop Application:**
```bash
./stop.sh
```

**Setup with Database:**
```bash
./start-with-db.sh
```

That's it! The scripts handle everything else automatically.
