// import { NextResponse } from "next/server";

// export function middleware(req) {
//   const url = req.nextUrl.clone();
//   const { pathname } = url
//   const token = req.cookies.get("access_token")?.value;
//   const role = req.cookies.get("user_role")?.value;

//   // List of protected route groups by role
//   // Add more protected routes base on project demand 
//   const protectedRoutes = {
//     admin: ["/admin"],
//     vendor: ["/supplier"],
//     delivery: ["/courier"],
//     client: ["/dashboard", "/orders", "/cart", "/profile", "notifications", ],
//   };

//   // List of open routes (and thses are all authentication routes to have access to protected routes)
//   const loginRoutes = ["/login", "/admin/login", "/supplier/login", "/courier/login"];

//   if (
//     // pathname.startsWith("/_next") ||
//     // pathname.startsWith("/api") ||
//     pathname.startsWith("/public") ||
//     pathname === "/" ||
//     loginRoutes.includes(pathname)
//   ) {
//     return NextResponse.next();
//   }

//   // If no token, redirect to appropriate login page
//   if (!token) { 
//     if (url.pathname.startsWith("/admin")) {
//       url.pathname = "/admin/login";
//     } else if (url.pathname.startsWith("/supplier")) {
//       url.pathname = "/supplier/login";
//     } else if (url.pathname.startsWith("/courier")) {
//       url.pathname = "/courier/login";
//     } else {
//       url.pathname = "/login";
//     }
//     return NextResponse.redirect(url);
//   }

//   // Role-based restriction1
//   // update role 
//   if (role) {
//     // Check if the user’s role is trying to access a restricted path
//     const allRoutes = Object.values(protectedRoutes).flat();
//     const currentPath = allRoutes.find((p) => url.pathname.startsWith(p));

//     if (currentPath) {
//       const allowed = protectedRoutes[role]?.some((p) => url.pathname.startsWith(p));
//       if (!allowed) {
//         // Redirect to role dashboard if unauthorized
//         const redirectMap = {
//           admin: "/admin/dashboard",
//           vendor: "/supplier/dashboard",
//           delivery: "/courier/dashboard",
//           client: "/dashboard",
//         };
//         url.pathname = redirectMap[role] || "/";
//         return NextResponse.redirect(url);
//       }
//     }
//   }

//   return NextResponse.next();
// }

// // Define which paths should use this middleware
// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/supplier/:path*",
//     "/courier/:path*",
//     "/dashboard/:path*",
//     "/orders/:path*",
//     "/cart/:path*",
//     "/profile/:path*",
//   ],
// };
