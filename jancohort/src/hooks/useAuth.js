"use client";

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";
import { getUserRole, getUserProfile, getCompanyProfile } from "@/lib/api";

/**
 * Custom hook that extends Clerk's useAuth with role detection
 * and profile data from MongoDB
 */
export function useAuth() {
     const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
     const { getToken } = useClerkAuth();

     const [role, setRole] = useState(null); // 'user' | 'company' | null
     const [profile, setProfile] = useState(null); // User or Company data from MongoDB
     const [isRoleLoaded, setIsRoleLoaded] = useState(false);
     const [error, setError] = useState(null);

     // Fetch role and profile data
     const fetchRoleAndProfile = useCallback(async () => {
          if (!isUserLoaded || !isSignedIn || !user) {
               setRole(null);
               setProfile(null);
               setIsRoleLoaded(true);
               return;
          }

          try {
               // Get role from Clerk metadata or database
               const detectedRole = await getUserRole(user, getToken);
               setRole(detectedRole);

               // Fetch appropriate profile based on role
               if (detectedRole === 'company') {
                    const { company } = await getCompanyProfile(getToken);
                    setProfile(company);
               } else if (detectedRole === 'user') {
                    const { user: userData } = await getUserProfile(getToken);
                    setProfile(userData);
               }
          } catch (err) {
               console.error("Error fetching role/profile:", err);
               setError(err.message);
          } finally {
               setIsRoleLoaded(true);
          }
     }, [isUserLoaded, isSignedIn, user, getToken]);

     useEffect(() => {
          fetchRoleAndProfile();
     }, [fetchRoleAndProfile]);

     // Refresh profile data
     const refreshProfile = useCallback(async () => {
          if (!isSignedIn) return;

          try {
               if (role === 'company') {
                    const { company } = await getCompanyProfile(getToken);
                    setProfile(company);
               } else if (role === 'user') {
                    const { user: userData } = await getUserProfile(getToken);
                    setProfile(userData);
               }
          } catch (err) {
               console.error("Error refreshing profile:", err);
          }
     }, [role, isSignedIn, getToken]);

     return {
          // Clerk data
          user,
          isSignedIn,
          getToken,

          // Custom role/profile data
          role,
          profile,
          isLoaded: isUserLoaded && isRoleLoaded,
          error,

          // Helpers
          isCandidate: role === 'user',
          isRecruiter: role === 'company',
          isNewUser: isUserLoaded && isSignedIn && role === null,

          // Actions
          refreshProfile,
     };
}
