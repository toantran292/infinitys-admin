import {type RouteConfig, route, index, layout} from "@react-router/dev/routes";

export default [
  route("sign-in", "auth/sign-in.tsx"),
  layout("components/private-route.tsx", [
      layout("components/default.layout.tsx", [
        index("routes/home.tsx"),
      ]),
  ]),
] satisfies RouteConfig;
