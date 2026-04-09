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
  queue: (() => void)[];
  limit: number;
  runCount: number;

  constructor(limit: number) {
    this.queue = [];
    this.limit = limit;
    this.runCount = 0;
  }

  // 入队：传入一个异步处理函数（返回 Promise）
  enqueue<T>(handler: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.runCount++;
        try {
          const result = await handler();
          resolve(result); // 处理完成，告诉调用者结果
        } catch (error) {
          reject(error); // 处理出错，告诉调用者错误
        } finally {
          this.runCount--;
          this.next(); // 处理完当前任务后，继续处理下一个任务
        }
      };

      this.queue.push(run);
      this.next();
    });
  }

  next() {
    if (this.queue.length > 0 && this.runCount < this.limit) {
      const task = this.queue.shift();
      if (task) task();
    }
  }
}

const mqttMessageQueue = new MessageQueue(1);
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
