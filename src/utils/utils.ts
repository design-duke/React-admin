/**
 * @description 获取需要展开的 subMenu
 * @param {String} path 当前访问地址
 * @returns array
 */
export const getOpenKeys = (path: string) => {
  let newStr: string = "";
  let newArr: any[] = [];
  let arr = path.split("/").map((i) => "/" + i);
  for (let i = 1; i < arr.length - 1; i++) {
    newStr += arr[i];
    newArr.push(newStr);
  }
  return newArr;
};

interface RouteObject {
  caseSensitive?: boolean;
  children?: RouteObject[];
  element?: React.ReactNode;
  index?: boolean;
  auth?: boolean;
  path?: string;
}
/**
 * @description 递归查询对应的路由
 * @param {String} path 当前访问地址
 * @param {Array} routes 路由列表
 * @returns array
 */
export const searchRoute = (
  path: string,
  routes: RouteObject[] = []
): RouteObject => {
  let result: RouteObject = {};
  for (let item of routes) {
    const pathItem = "/" + item.path;
    if (item.path === path || pathItem === path) return item;
    if (item.children) {
      const res = searchRoute(path, item.children);
      if (Object.keys(res).length) result = res;
    }
  }
  return result;
};

class MessageQueue {
  queue: any[];
  processing: boolean;

  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // 入队：传入一个异步处理函数（返回 Promise）
  enqueue(handler: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ handler, resolve, reject });
      this._process();
    });
  }

  async _process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const { handler, resolve, reject } = this.queue.shift();

    try {
      const result = await handler(); // 执行你的异步逻辑
      resolve(result);
    } catch (error) {
      console.error("MQTT message handler error:", error);
      reject(error);
    } finally {
      this.processing = false;
      this._process();
    }
  }
}

const mqttMessageQueue = new MessageQueue();
mqttMessageQueue.enqueue(async () => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(1);
      resolve(); // 告诉队列：我完成了！
    }, 2000);
  });
});

mqttMessageQueue.enqueue(async () => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(2);
      resolve();
    }, 2000);
  });
});

mqttMessageQueue.enqueue(async () => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(3);
      resolve();
    }, 2000);
  });
});

// export function proxy() {
//   let obj: any = { text: "vue3" };
//   const bucket = new Set();
//   const newObj = new Proxy(obj, {
//     get(target, key) {
//       bucket.add(effect);
//       return target[key];
//     },
//     set(target, key, newValue) {
//       target[key] = newValue;
//       bucket.forEach((fn) => fn());
//       return true;
//     },
//   });
//   function effect() {
//     document.getElementById("test")?.innerText = newObj.text;
//   }
//   effect();
//   newObj.text = "vue3响应了";
// }
