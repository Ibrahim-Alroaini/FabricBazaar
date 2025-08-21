# Overview

This is a full-stack e-commerce application for "Alreef Fabric", a fabric and textile store in the UAE. The application is built as a monorepo with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM. It features product catalog management, reviews, orders, and an admin dashboard for store management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with JSON responses
- **Request Handling**: Express middleware for JSON parsing, CORS, and error handling
- **Development**: Hot reload via Vite integration in development mode

## Data Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Schema**: Shared between client and server via `shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations and schema updates
- **Connection**: Neon serverless driver for PostgreSQL connections

## Data Models
- **Categories**: Product categorization (silk, cotton, wool, synthetic)
- **Products**: Core inventory with images, specifications, pricing, and stock
- **Reviews**: Customer feedback with ratings and verification status
- **Orders**: Purchase records with items and status tracking

## Development Storage
- **Implementation**: In-memory storage class for development/demo purposes
- **Interface**: Abstracted storage interface allowing easy database integration
- **Mock Data**: Pre-populated sample data for categories and products

## Authentication & Authorization
- **Current State**: No authentication implemented (development phase)
- **Session Handling**: Connect-pg-simple for PostgreSQL session storage (prepared)
- **Architecture**: Ready for session-based authentication implementation

## File Upload & Media
- **Configuration**: Multer configured for image uploads (5MB limit)
- **Storage**: Memory storage for development, ready for cloud storage integration
- **Image Handling**: Multiple images per product with gallery display

## API Structure
- **Categories**: GET endpoints for category listing
- **Products**: Full CRUD operations with search and filtering capabilities
- **Reviews**: Product review creation and retrieval
- **Orders**: Order management and status tracking
- **Analytics**: Dashboard statistics and reporting endpoints
- **Admin**: Product management and inventory control

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-kit**: Database migration and schema management tools
- **express**: Web server framework
- **react**: Frontend UI library
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

## UI and Styling
- **@radix-ui/\***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class utilities
- **lucide-react**: Icon library

## Development Tools
- **vite**: Build tool and development server
- **typescript**: Type system and compilation
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds

## Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation library
- **drizzle-zod**: Drizzle to Zod schema conversion

## Utilities
- **date-fns**: Date manipulation and formatting
- **multer**: File upload middleware
- **connect-pg-simple**: PostgreSQL session store
- **nanoid**: Unique ID generation

## Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit development tools integration