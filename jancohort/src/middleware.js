import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
     '/dashboard(.*)',
     '/recruiter-dashboard(.*)',
     '/roadmap(.*)',
     '/api/upload(.*)', // Protect upload API
     '/api/users(.*)',
     '/api/company(.*)',
     '/api/jobs(.*)',
])

// Define public routes (optional, but good for clarity)
// const isPublicRoute = createRouteMatcher(['/', '/register', '/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
     // Protect routes that require auth
     if (isProtectedRoute(req)) {
          await auth.protect()
     }
})

export const config = {
     matcher: [
          // Skip Next.js internals and all static files, unless found in search params
          '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
          // Always run for API routes
          '/(api|trpc)(.*)',
     ],
}
