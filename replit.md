# Dent Moldova - Dental Clinic Directory

## Overview

Dent Moldova is a minimalist dental clinic directory web application for Moldova, inspired by the Nomad List design aesthetic. The application provides a fast, simple catalog of dental clinics with filtering, search, and detailed clinic information. It features a clean, card-based interface with rating systems and multi-language support (Russian and Romanian).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with Tailwind CSS for styling
- **Component Architecture**: Modular component structure with reusable UI components

**Key Design Decisions**:
- Minimalist design approach with clean, card-based layouts
- Responsive grid system (1-4 columns) for clinic cards
- Light theme with neutral color palette
- No external maps integration in MVP to maintain simplicity

### Backend Architecture

**Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints for clinic data, cities, and districts
- **Development Server**: Vite middleware integration for hot reloading
- **Request Handling**: Express middleware for JSON parsing and logging

**Key Design Decisions**:
- Separation of concerns with dedicated route handlers
- Centralized error handling middleware
- Development-optimized logging and debugging

### Data Storage Solutions

**Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: Relational structure with cities, districts, clinics, and packages
- **Connection**: Neon serverless PostgreSQL for cloud deployment
- **Migrations**: Drizzle Kit for database schema management

**Key Design Decisions**:
- Normalized database structure for geographical data
- JSON columns for flexible arrays (languages, specializations, tags)
- UUID primary keys for better scalability
- Built-in support for multilingual content (Russian/Romanian)

### Internationalization

**Framework**: Custom i18n implementation with language detection
- **Languages**: Russian (default) and Romanian
- **Storage**: JSON files for translation dictionaries
- **Architecture**: Context-based language switching with persistent preferences

**Key Design Decisions**:
- File-based translations for easy content management
- Seamless language switching without page reload
- Consistent naming conventions for multilingual database fields

### Authentication and Authorization

**Current State**: Minimal authentication structure in place
- **User Schema**: Basic user table with username support
- **Session Management**: Express session configuration ready
- **Future Extension**: Architecture prepared for role-based access control

### Search and Filtering System

**Implementation**: Query parameter-based filtering with debounced search
- **Search**: Full-text search across clinic names and services
- **Filters**: Multi-select filters for districts, specializations, languages
- **Sorting**: Multiple sort options (D-score, price, trust, reviews)
- **Pagination**: Server-side pagination with configurable page sizes

**Key Design Decisions**:
- URL-based filter state for shareable links
- Debounced search input to reduce server load
- Mobile-responsive filter interface with drawer/sheet components

### Scoring System

**D-Score Algorithm**: Weighted composite score for clinic ranking
- **Components**: Trust index (30%), Reviews (25%), Price (25%), Access (20%)
- **Implementation**: Calculated server-side and stored in database
- **Display**: Visual score bars with color coding (green/yellow/red)

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations with PostgreSQL driver
- **Connection Pooling**: Built-in connection management for serverless environments

### UI and Styling
- **Radix UI**: Accessible component primitives for dialogs, selects, checkboxes, etc.
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono)

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production builds
- **Replit Integration**: Development environment optimizations

### Runtime Libraries
- **TanStack Query**: Server state synchronization and caching
- **Wouter**: Lightweight routing for single-page application
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Component variant management
- **CLSX/Tailwind Merge**: Conditional CSS class handling

### Development Dependencies
- **TSX**: TypeScript execution for development server
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation for API inputs and schemas