import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sign-in", "auth/sign-in.tsx")
] satisfies RouteConfig;
