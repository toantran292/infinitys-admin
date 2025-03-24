import {
  type RouteConfig,
  route,
  index,
  layout
} from "@react-router/dev/routes";

export default [
  route("sign-in", "auth/sign-in.tsx"),
  layout("components/private-route.tsx", [
    layout("components/default.layout.tsx", [
      index("routes/home.tsx"),
      route("problems", "routes/problems/problems.tsx"),
      route("problems/:id", "routes/problems-id/problems-id.tsx")
    ])
  ])
] satisfies RouteConfig;
