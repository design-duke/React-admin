// 1. 定义状态常量
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class MyPromise {
  status;
  value;
  reason;

  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    // 2. 定义内部 resolve/reject (闭包的核心)
    const resolve = (value) => {
      // 只有状态是 PENDING 时才允许改变状态
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
      }
    };

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }
    };

    // 3. 立即执行用户传入的函数，并传入内部的控制权
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  // 4. then 方法：根据当前状态决定做什么
  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      // 如果已经成功了，立即执行成功回调
      onFulfilled(this.value);
    }
    if (this.status === REJECTED) {
      // 如果已经失败了，立即执行失败回调
      onRejected(this.reason);
    }
    // 注意：这个简易版没有处理“异步”情况（即调用 then 时状态还是 PENDING 的情况）
  }
}

// --- 测试 ---
const p = new MyPromise((resolve, reject) => {
  console.log("Executor 开始执行...");
  resolve("success"); // 这里触发了内部逻辑，改变了 p 的状态
});

p.then(
  (value) => {
    console.log(">>> 收到成功消息:", value);
  },
  (reason) => {
    console.log(">>> 收到失败消息:", reason);
  }
);
