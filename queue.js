class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // 入队：传入一个异步处理函数（返回 Promise）
  enqueue(handler) {
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
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(1);
      resolve(); // 告诉队列：我完成了！
    }, 2000);
  });
});

mqttMessageQueue.enqueue(async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(2);
      resolve();
    }, 2000);
  });
});

mqttMessageQueue.enqueue(async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(3);
      resolve();
    }, 2000);
  });
});

// 请实现一个 Scheduler 类。它包含一个 add 方法，接收一个返回 Promise 的异步任务函数。要求同一时刻最多只能有 limit 个任务并发执行；当有一个任务完成时，自动从等待队列中取出下一个任务执行。
class Scheduler {
  constructor(limit) {
    this.limit = limit; // 最大并发数
    this.runningCount = 0; // 当前正在运行的任务数
    this.queue = []; // 等待执行的任务队列 (存储的是执行函数)
  }

  add(taskCreator) {
    // 返回一个 Promise，当任务完成时 resolve
    return new Promise((resolve, reject) => {
      // 定义实际的执行逻辑
      const run = async () => {
        this.runningCount++;

        // 执行任务创建器，获取 Promise
        try {
          const result = await taskCreator();
          // 任务成功完成
          resolve(result);
        } catch (err) {
          // 任务失败，也视为完成（根据需求通常也需要释放槽位）
          reject(err);
        } finally {
          // 无论成功失败，都要减少运行计数并尝试启动下一个任务
          this.runningCount--;
          this.next();
        }
      };

      // 如果当前运行数小于限制，立即执行；否则加入队列
      if (this.runningCount < this.limit) {
        run();
      } else {
        // 将 run 函数包装一下存入队列，确保上下文正确（虽然这里不需要额外绑定）
        this.queue.push(run);
      }
    });
  }

  // 从队列中取出下一个任务执行
  next() {
    if (this.queue.length > 0 && this.runningCount < this.limit) {
      const taskRunner = this.queue.shift();
      taskRunner();
    }
  }
}
// --- 测试代码 ---
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const scheduler = new Scheduler(2); // 最多并发 2 个

const addTask = (time, order) => {
  scheduler.add(() => sleep(time)).then(() => console.log(order));
};

console.log("开始执行...");
addTask(1000, "1");
addTask(500, "2");
addTask(300, "3");
addTask(400, "4");

class Scheduler2 {
  queue = [];
  activeCount = 0;

  constructor(limit) {
    this.limit = limit;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      const run = () => {
        this.activeCount++;

        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.activeCount--;
            this.runNext();
          });
      };

      this.queue.push(run);
      this.runNext();
    });
  }

  runNext() {
    if (this.activeCount >= this.limit) return;
    const job = this.queue.shift();
    if (!job) return;
    job();
  }
}
