WebGame Platform
A comprehensive web-based gaming platform with separate interfaces for users, publishers, and administrators.

Project Overview
WebGame is a full-stack application that allows users to browse, purchase, and play games online. The platform consists of three separate frontend applications and a backend API:

User Application - For regular users to browse, purchase, and play games
Publisher Application - For game publishers to manage their games and profiles
Admin Application - For administrators to oversee the platform
Architecture
Backend Services

Frontend Applications

API Requests

API Requests

API Requests

Frontend - User App
(frontend/)

Frontend - Publisher App
(frontend-publisher/)

Frontend - Admin App
(frontend-admin/)

Django REST API

Technology Stack
Frontend: Next.js (React-based framework)
Styling: Tailwind CSS
Backend: Django REST API
Authentication: JWT-based authentication
Getting Started
Prerequisites
Node.js (v14 or higher)
npm, yarn, pnpm, or bun
Python (for backend)
Frontend Setup
Clone the repository:
git clone https://github.com/LinhHa0211/WebGame.git  
cd WebGame
Install dependencies for each frontend application:
For user application:

cd frontend  
npm install
For publisher application:

cd frontend-publisher  
npm install
For admin application:

cd frontend-admin  
npm install
Run the development server for any of the applications:
npm run dev  
# or  
yarn dev  
# or  
pnpm dev  
# or  
bun dev
Open http://localhost:3000 with your browser to see the result.
Key Features
User Interface: Browse games by category and operating system, purchase games, manage library
Publisher Interface: Upload and manage games, track sales and analytics
Admin Interface: Manage users, games, and website settings
Game Management: Add, edit, and delete games with details like title, description, price, etc.
Category System: Organize games by categories
Operating System Compatibility: Filter games by compatible operating systems
Order System: Purchase games with promotional discounts
Responsive Design: Works on mobile and desktop devices
Project Structure
Each frontend application follows a similar structure:

src/  
├── app/            # Next.js app router pages  
├── components/     # Reusable UI components  
│   ├── addgame/    # Game addition components  
│   ├── button/     # Button components  
│   ├── footer/     # Footer components  
│   ├── game/       # Game-related components  
│   ├── modal/      # Modal components  
│   └── navbar/     # Navigation components  
├── hooks/          # Custom React hooks  
└── services/       # API services  
API Communication
The frontend applications communicate with the backend API using a consistent approach through the apiService module. Examples of API endpoints:

/api/game/category/ - Get game categories
/api/game/operatingSystem/ - Get operating systems
/api/game/{id}/toggle_favorite/ - Toggle game favorite status
/api/game/promotion_detail/{id}/ - Get game promotion details
/api/game/order/{id}/ - Create a new order
Deployment
The easiest way to deploy the Next.js applications is to use the Vercel Platform from the creators of Next.js.

Learn More
To learn more about Next.js, take a look at the following resources:

Next.js Documentation - learn about Next.js features and API.
Learn Next.js - an interactive Next.js tutorial.
License
© 2025 Ha Ngoc Linh B2207536. All rights reserved.
