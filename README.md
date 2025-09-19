# E-commerce Project

## Overview
This is an e-commerce application built with Next.js and Supabase for the backend database.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Supabase Connection Troubleshooting

If you're experiencing issues with Supabase connection, we've created a troubleshooting page to help diagnose and fix common problems.

### How to Access the Troubleshooting Page

1. Start your development server with `npm run dev`
2. Navigate to `/supabase-troubleshoot` in your browser

### What the Troubleshooting Page Does

- Checks if all required environment variables are set
- Tests the connection to your Supabase project
- Provides step-by-step guidance for resolving common issues

### Common Issues and Solutions

1. **Invalid API Key Error**
   - Verify your Supabase project exists in the Supabase Dashboard
   - Check if your API keys are correct and up-to-date
   - Ensure there are no hardcoded API keys in your codebase

2. **Missing Environment Variables**
   - Make sure your `.env.local` file contains all required variables
   - Restart your development server after updating environment variables

3. **Project Deleted or Not Found**
   - If your Supabase project was deleted, you'll need to create a new one
   - Update all API keys in your application with the new project keys