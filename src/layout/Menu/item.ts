const menu = [
  {
    key: "/Home",
    icon: "VideoCameraOutlined",
    i18nKey: "menu.home",
    path: "/Home",
  },
  {
    key: "/products",
    icon: "VideoCameraOutlined",
    i18nKey: "menu.products",
    path: "/products",
  },
  {
    key: "/chat",
    icon: "VideoCameraOutlined",
    i18nKey: "menu.chat",
    path: "/chat",
  },
  {
    key: "/three",
    icon: "FacebookOutlined",
    i18nKey: "menu.three",
    path: "/three",
    children: [
      {
        key: "/three/china",
        icon: "UserOutlined",
        i18nKey: "menu.chinaMap",
        path: "/three/china",
      },
      {
        key: "/three/galaxy",
        icon: "UploadOutlined",
        i18nKey: "menu.galaxy",
        path: "/three/galaxy",
      },
      {
        key: "/three/light",
        icon: "UploadOutlined",
        i18nKey: "menu.lighting",
        path: "/three/light",
      },
    ],
  },
  {
    key: "/subOne",
    icon: "UploadOutlined",
    i18nKey: "menu.menu",
    children: [
      {
        key: "/subOne/count",
        icon: "UserOutlined",
        i18nKey: "menu.count",
        path: "/subOne/count",
      },
      {
        key: "/subOne/table",
        icon: "UploadOutlined",
        i18nKey: "menu.table",
        path: "/subOne/table",
      },
      {
        key: "/subOne/communication",
        icon: "UploadOutlined",
        i18nKey: "menu.communication",
        path: "/subOne/communication",
      },
    ],
  },
  {
    key: "/subTwo",
    icon: "AppstoreOutlined",
    i18nKey: "menu.link",
    children: [
      {
        key: "/subTwo/link",
        icon: "BugOutlined",
        i18nKey: "menu.githubLink",
        path: "/subTwo/link",
      },
    ],
  },
];

export default menu;
