# LinkedIn Clone - Setup Guide

This guide will help you get the LinkedIn clone up and running on your system.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd linkedin-clone
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- Material-UI
- TypeScript
- And other dependencies

### 3. Start the Application

Choose one of the following methods:

#### Option A: Quick Start (Recommended)

```bash
./start.sh
```

#### Option B: Manual Start

```bash
npm run dev
```

#### Option C: With Database Support

```bash
./start-with-db.sh
```

### 4. Access the Application

Once started, open your browser and navigate to:

```
http://localhost:3000
```

Or the port displayed in your terminal (may be 3001 if 3000 is in use).

## Available Pages

After starting, you can access:

- **Home Feed**: http://localhost:3000/
- **Profile**: http://localhost:3000/profile
- **Network**: http://localhost:3000/network
- **Messaging**: http://localhost:3000/messaging
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup

## Startup Scripts Explained

### start.sh

The basic startup script that:
- Checks if dependencies are installed
- Displays Node.js version
- Shows application information
- Starts the development server

**Usage:**
```bash
./start.sh
```

### start-with-db.sh

An interactive script for future database integration:
- Guides you through database selection (MongoDB/PostgreSQL)
- Checks if database is installed and running
- Creates `.env.local` configuration file
- Starts the database if possible
- Launches the application

**Usage:**
```bash
./start-with-db.sh
```

**Interactive Prompts:**
1. Choose database type (MongoDB, PostgreSQL, or skip)
2. Script will check installation and status
3. Provides connection strings for configuration

### stop.sh

Stops all running instances of the application:

**Usage:**
```bash
./stop.sh
```

## Configuration

### Environment Variables

The application can be configured using a `.env.local` file. Run `./start-with-db.sh` to auto-generate this file, or create it manually:

```bash
# .env.local

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/linkedin-clone
# or
DATABASE_URL=postgresql://localhost:5432/linkedin_clone

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Theme Customization

Edit `components/ThemeRegistry.tsx` to customize colors:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#0a66c2', // LinkedIn blue
    },
    secondary: {
      main: '#70b5f9',
    },
    background: {
      default: '#f3f2ef', // LinkedIn gray
    },
  },
});
```

## Database Setup (Optional)

Currently, the application uses mock data. To add real database support:

### MongoDB Setup

1. **Install MongoDB**
   ```bash
   # macOS
   brew install mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb

   # Or use MongoDB Atlas (cloud)
   # https://www.mongodb.com/cloud/atlas
   ```

2. **Start MongoDB**
   ```bash
   mongod
   # or
   brew services start mongodb-community
   ```

3. **Configure Connection**
   Add to `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/linkedin-clone
   ```

### PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql
   ```

2. **Start PostgreSQL**
   ```bash
   # macOS
   brew services start postgresql

   # Ubuntu/Debian
   sudo service postgresql start
   ```

3. **Create Database**
   ```bash
   createdb linkedin_clone
   ```

4. **Configure Connection**
   Add to `.env.local`:
   ```
   DATABASE_URL=postgresql://localhost:5432/linkedin_clone
   ```

## Troubleshooting

### Port Already in Use

If you see "Port 3000 is in use", the app will automatically use the next available port (3001, 3002, etc.). The correct URL will be displayed in the terminal.

To free up port 3000:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### Dependencies Not Installing

Try:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Script Permission Denied

Make scripts executable:
```bash
chmod +x start.sh stop.sh start-with-db.sh
```

### MongoDB Not Starting

On macOS:
```bash
# Check if MongoDB is installed
brew list | grep mongodb

# Start service
brew services start mongodb-community

# Check status
brew services list
```

### Node Version Issues

Check your Node.js version:
```bash
node -v
```

This project requires Node.js v18 or higher. Update if needed:
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

## Development Tips

### Hot Reload

The development server supports hot reload. Changes to files will automatically update in the browser.

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Next Steps

1. **Explore the codebase** - Check out the components and pages
2. **Customize the theme** - Edit colors and styles to match your brand
3. **Add backend integration** - Connect to a real database
4. **Implement authentication** - Use NextAuth.js or similar
5. **Add real-time features** - Integrate WebSocket for live messaging

## Support

For issues or questions:
- Check the main README.md
- Review the code comments
- Check Next.js documentation: https://nextjs.org/docs
- Check Material-UI documentation: https://mui.com/

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Docker

Create a `Dockerfile` for containerization:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Other Platforms

- AWS (EC2, Elastic Beanstalk, Amplify)
- Google Cloud (Cloud Run, App Engine)
- DigitalOcean (App Platform)
- Heroku

## License

This is a demo project for educational purposes.
