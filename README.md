# PrimeRoute Cargos - Freight & Shipment Management

![PrimeRoute Cargos](https://img.shields.io/badge/PrimeRoute-Cargos-blue?style=for-the-badge&logo=truck)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-lightgrey?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=flat-square&logo=mongodb)

A modern, full-stack freight and package tracking website for PrimeRoute Cargos. This web application provides shipment tracking, rate calculation, user management, and an admin dashboard.

## 🚀 Features

### Core Features
- **📦 Package Tracking** - Real-time package tracking with detailed history
- **💰 Shipping Rate Calculator** - Dynamic rate calculation based on weight, dimensions, and distance
- **👤 User Authentication** - Secure registration and login system
- **📊 Admin Dashboard** - Complete shipment management for administrators
- **📱 Responsive Design** - Mobile-first, responsive design for all devices
- **🔒 Security** - JWT authentication, rate limiting, and data validation

### User Features
- User registration and profile management
- Create and manage shipments
- Track multiple packages
- View shipping history
- Calculate shipping rates in real-time

### Admin Features
- Dashboard with comprehensive analytics
- Manage all shipments and update statuses
- User management
- Real-time tracking updates
- Revenue and performance metrics

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database for storing shipments and user data
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16.0 or higher) - [Download Node.js](https://nodejs.org/)
- **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download Git](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd primeroute-cargos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Environment Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/airpress-shipping
DB_NAME=airpress-shipping

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API Keys (Replace with actual keys)
SHIPPING_API_KEY=your-shipping-api-key
EMAIL_API_KEY=your-email-service-api-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup
Make sure MongoDB is running on your system:

**Local MongoDB:**
```bash
mongod --dbpath /path/to/your/db
```

**Or use MongoDB Atlas** (Cloud database):
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at:
- **Website**: http://localhost:3001
- **API**: http://localhost:3001/api

## 📁 Project Structure

```
primeroute-cargos/
├── backend/                 # Server-side code
│   ├── middleware/          # Express middleware
│   │   └── auth.js         # Authentication middleware
│   ├── models/             # Database models
│   │   ├── User.js         # User model
│   │   └── Shipment.js     # Shipment model
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── shipments.js    # Shipment management
│   │   ├── tracking.js     # Package tracking
│   │   └── admin.js        # Admin functionality
│   └── server.js           # Main server file
├── frontend/               # Client-side code
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   └── main.js         # Main JavaScript file
│   ├── images/             # Image assets
│   ├── index.html          # Main landing page
│   ├── shipping.html       # Shipping estimate and rate calculator
│   └── contact.html        # Contact and support form
├── .github/
│   └── copilot-instructions.md  # Development guidelines
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Node.js dependencies and scripts
└── README.md               # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Shipments
- `POST /api/shipments/calculate-rate` - Calculate shipping rate
- `POST /api/shipments/create` - Create new shipment (auth required)
- `GET /api/shipments/my-shipments` - Get user's shipments (auth required)

### Tracking
- `GET /api/tracking/:trackingNumber` - Track package by tracking number
- `POST /api/tracking/bulk-track` - Track multiple packages

### Admin (Admin access required)
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/shipments` - Get all shipments with filters
- `PUT /api/admin/shipments/:id/status` - Update shipment status
- `GET /api/admin/users` - Get all users

## 📱 Usage Guide

### For Customers

1. **Register/Login**
   - Click "Login" in the navigation
   - Create a new account or login with existing credentials

2. **Calculate Shipping Rates**
   - Go to the "Ship" section
   - Enter origin and destination ZIP codes
   - Add package dimensions and weight
   - Select service type
   - Click "Calculate Rate"

3. **Track Packages**
   - Use the quick track form on the homepage
   - Or go to the "Track" section
   - Enter your tracking number
   - View real-time status and history

4. **Create Shipments**
   - Login to your account
   - Use the rate calculator
   - Click "Create Shipment" after calculating rates
   - Fill in recipient details and package information

### For Administrators

1. **Access Admin Dashboard**
   - Login with admin credentials
   - Click on user menu → "Admin Dashboard"

2. **Manage Shipments**
   - View all shipments with filtering options
   - Update shipment statuses
   - Track shipment progress

3. **View Analytics**
   - Monitor key performance indicators
   - Track revenue and shipment volumes
   - View user statistics

## 🔧 Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (when available)
npm test

# Build frontend (when build process is added)
npm run build
```

### Development Guidelines

1. **Code Style**
   - Use ES6+ features
   - Follow consistent indentation (2 spaces)
   - Use meaningful variable and function names
   - Add comments for complex logic

2. **API Development**
   - Use RESTful conventions
   - Implement proper error handling
   - Validate all inputs
   - Return consistent response formats

3. **Frontend Development**
   - Follow responsive design principles
   - Use semantic HTML
   - Implement proper accessibility features
   - Optimize for performance

### Adding New Features

1. **Backend Features**
   - Create new routes in `/backend/routes/`
   - Add database models in `/backend/models/`
   - Implement middleware in `/backend/middleware/`
   - Test API endpoints

2. **Frontend Features**
   - Update HTML structure in `/frontend/index.html`
   - Add styles in `/frontend/css/style.css`
   - Implement functionality in `/frontend/js/main.js`
   - Ensure responsive design

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production` in your production environment
2. Use a strong, unique `JWT_SECRET`
3. Configure production MongoDB connection
4. Set up proper CORS origins
5. Configure rate limiting for your traffic

### Recommended Hosting Platforms
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Database**: MongoDB Atlas, AWS DocumentDB
- **Frontend**: Netlify, Vercel (if serving separately)

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connection secure
- [ ] JWT secret is strong and unique
- [ ] HTTPS enabled
- [ ] Error monitoring setup
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] Security headers enabled

## 🔒 Security Features

- **Authentication**: JWT-based authentication
- **Password Security**: bcrypt hashing with salt
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet.js for security headers
- **Data Sanitization**: Prevents injection attacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: PrimeRoute Cargos Development Team
 - **Contact**: Configure the support contact for your deployment

## 🆘 Support

For support and questions:

- **Email**: Configure the support contact for your deployment
- **Phone**: 1-800-FEDEX-1 (1-800-333-3391)
- **Documentation**: Check this README and code comments
- **Issues**: Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and profile management
  - Package tracking system
  - Shipping rate calculator
  - Admin dashboard
  - Responsive design

## 🚀 Future Enhancements

- [ ] Email notifications for shipment updates
- [ ] SMS notifications
- [ ] Bulk shipment creation
- [ ] Advanced reporting and analytics
- [ ] Integration with actual shipping carriers
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Automated label printing
- [ ] Warehouse management features

---

**PrimeRoute Cargos** - Freight services and shipment tracking