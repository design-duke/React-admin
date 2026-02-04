import lazyLoad from "./lazyLoad";
import Layout from "@/layout/index";
import Login from "@/pages/Login/index";
import { lazy } from "react";
import { Navigate, useRoutes } from "react-router";

export const routers: any = [
  {
    path: "/",
    element: <Navigate to={"login"} replace />,
  },
  { path: "login", element: <Login /> },
  {
    path: "/three/china",
    auth: true,
    element: lazyLoad(lazy(() => import("@/pages/Three/chinaMap/index"))),
  },
  {
    path: "/three/galaxy",
    auth: true,
    element: lazyLoad(lazy(() => import("@/pages/Three/Galaxy/index"))),
  },
  {
    path: "/three/light",
    auth: true,
    element: lazyLoad(lazy(() => import("@/pages/Three/Light/index"))),
  },
  {
    element: <Layout />,
    children: [
      {
        path: "Home",
        auth: true,
        element: lazyLoad(lazy(() => import("@/pages/Home/index"))),
      },
      {
        path: "products",
        auth: true,
        element: lazyLoad(lazy(() => import("@/pages/products/index"))),
      },
      {
        path: "subOne/count",
        auth: true,
        element: lazyLoad(lazy(() => import("@/pages/reduxCount/index"))),
      },
      {
        path: "subOne/table",
        auth: true,
        element: lazyLoad(lazy(() => import("@/pages/table/index"))),
      },
      {
        path: "subOne/communication",
        auth: true,
        element: lazyLoad(lazy(() => import("@/pages/count/index"))),
      },
      {
        path: "subTwo/link",
        auth: true,
        element: lazyLoad(lazy(() => import("@/pages/github/index"))),
      },
      {
        path: "/chat",
        auth: true,
        element: lazyLoad(lazy(() => import("@/pages/ai/index"))),
      },
      { path: "*", element: lazyLoad(lazy(() => import("@/pages/404"))) },
    ],
  },
  { path: "*", element: lazyLoad(lazy(() => import("@/pages/404"))) },
];

const Router = () => {
  const routes = useRoutes(routers);
  return routes;
};

export default Router;
