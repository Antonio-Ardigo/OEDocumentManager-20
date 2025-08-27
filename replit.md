# Overview

This is a full-stack web application for managing Operational Excellence (OE) processes within an organization, specifically designed for ARAMCO's OE framework. The system provides comprehensive process management capabilities including creation, editing, and tracking of OE elements, processes, steps, performance measures, and document versions with full audit trails.

The application follows the 8-element OE framework structure and enables users to create detailed process documentation with hierarchical organization, version control, and performance tracking capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit OAuth integration with OpenID Connect
- **API Design**: RESTful APIs with consistent error handling and logging

## Data Storage
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema versioning
- **Session Storage**: PostgreSQL-backed session store for authentication persistence
- **Database Structure**: 
  - Users table for authentication
  - OE Elements table for the 8 OE framework categories
  - OE Processes table for main process definitions
  - Process Steps table for detailed step-by-step procedures
  - Performance Measures table for tracking metrics
  - Document Versions table for version control

## Authentication & Authorization
- **Provider**: Replit OAuth with OIDC (OpenID Connect)
- **Session Management**: Secure HTTP-only cookies with PostgreSQL persistence
- **Security**: CSRF protection, secure session configuration
- **User Management**: Automatic user creation/updates on authentication

## Project Structure
- **Monorepo Layout**: Client, server, and shared code in single repository
- **Shared Types**: Common TypeScript interfaces and Zod schemas in `/shared`
- **Client**: React application in `/client` with component-based architecture
- **Server**: Express API server in `/server` with modular route organization
- **Database**: Schema definitions and migrations managed by Drizzle

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **@neondatabase/serverless**: WebSocket-based database client for serverless environments

## Authentication Services
- **Replit OAuth**: Primary authentication provider using OpenID Connect
- **OpenID Client**: Standard OIDC implementation for secure authentication flows

## UI & Styling Libraries
- **Radix UI**: Headless component primitives for accessibility and customization
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

## Development & Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Static typing for both frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **Replit Integration**: Development environment integration with banner and cartographer plugins

## Runtime Dependencies
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definitions
- **Date-fns**: Date manipulation and formatting utilities
- **Express Session**: Session middleware with PostgreSQL storage backend