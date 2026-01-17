"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/ui/loader";

/**
 * Higher-order component to protect routes based on user role
 * @param {React.Component} Component - The component to wrap
 * @param {object} options - Configuration options
 * @param {string|string[]} options.allowedRoles - Role(s) allowed to access this route
 * @param {string} options.redirectTo - Where to redirect if unauthorized
 */
export function withRoleProtection(Component, options = {}) {
     const {
          allowedRoles = ['user', 'company'],
          redirectTo = '/register'
     } = options;

     return function ProtectedRoute(props) {
          const router = useRouter();
          const { isLoaded, isSignedIn, role, isNewUser } = useAuth();

          useEffect(() => {
               if (!isLoaded) return;

               // Not signed in - redirect to home
               if (!isSignedIn) {
                    router.push('/');
                    return;
               }

               // New user without role - redirect to registration
               if (isNewUser) {
                    router.push('/register');
                    return;
               }

               // Check if user's role is allowed
               const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
               if (role && !roles.includes(role)) {
                    // Redirect based on actual role
                    if (role === 'company') {
                         router.push('/recruiter-dashboard');
                    } else {
                         router.push('/dashboard');
                    }
               }
          }, [isLoaded, isSignedIn, role, isNewUser, router]);

          // Show loading while checking auth
          if (!isLoaded) {
               return (
                    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                         <Loader />
                    </div>
               );
          }

          // Not signed in
          if (!isSignedIn) {
               return null;
          }

          // New user - will redirect
          if (isNewUser) {
               return null;
          }

          // Wrong role - will redirect
          const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
          if (role && !roles.includes(role)) {
               return null;
          }

          // Authorized - render the component
          return <Component {...props} />;
     };
}

/**
 * Standalone component for protecting routes
 */
export function ProtectedRoute({
     children,
     allowedRoles = ['user', 'company'],
     redirectTo = '/register',
     loadingComponent = null
}) {
     const router = useRouter();
     const { isLoaded, isSignedIn, role, isNewUser } = useAuth();

     useEffect(() => {
          if (!isLoaded) return;

          if (!isSignedIn) {
               router.push('/');
               return;
          }

          if (isNewUser) {
               router.push('/register');
               return;
          }

          const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
          if (role && !roles.includes(role)) {
               if (role === 'company') {
                    router.push('/recruiter-dashboard');
               } else {
                    router.push('/dashboard');
               }
          }
     }, [isLoaded, isSignedIn, role, isNewUser, router, allowedRoles]);

     if (!isLoaded) {
          return loadingComponent || (
               <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                    <Loader />
               </div>
          );
     }

     if (!isSignedIn || isNewUser) {
          return null;
     }

     const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
     if (role && !roles.includes(role)) {
          return null;
     }

     return children;
}
