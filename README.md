# Book-Review-Project

A full-stack web application for discovering, reviewing, and rating books using the Open Library API.
Architecture Overview
Frontend (React + TypeScript)

* Framework: React 18 with TypeScript
Styling: Tailwind CSS
Routing: React Router
Icons: Lucide React
Form Handling: React Hook Form with Zod validation

Backend (Node.js + Express)

Runtime: Node.js
Framework: Express.js
Database: MySQL with connection pooling
Authentication: Token-based auth with localStorage
API: RESTful endpoints for users, reviews, and book data

Database Schema

Users: id, username, email, password, created_at
Reviews: id, book_id, user_id, rating, review_text, book_title, book_author, created_at, updated_at
Book IDs: Hashed Open Library keys for consistent storage

Key Features
Authentication System

User registration and login
Token-based authentication
Protected routes and components
Persistent login sessions

Book Discovery

Integration with Open Library API
Search functionality for books
Detailed book information (covers, authors, descriptions)
Book metadata display (publish date, pages, publishers)

Review System

User can write and submit reviews
5-star rating system

Personal reviews page
Review statistics and averages