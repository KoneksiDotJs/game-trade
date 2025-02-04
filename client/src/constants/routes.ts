export const routes = {
  client: {
    home: "/",
    listings: "/listings",
    profile: "/profile",
    messages: "/messages",
  },
  admin: {
    root: "/",
    login: "/admin/login",
    dashboard: "/",
    users: "/users",
    games: "/games",
    categories: "/categories",
    listings: "/listings",
  },
} as const;

export type Routes = typeof routes;
