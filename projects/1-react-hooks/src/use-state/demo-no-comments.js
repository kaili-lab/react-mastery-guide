// ============================================
// 核心数据结构
// ============================================

let componentFiber = {
  hooksChain: null, // 指向第一个 Hook 节点（链表的头） // 初始值是 null，因为还没创建任何 Hook
};

let currentHook = null;

function useState(initialValue) {
  let hook;

  if (currentHook === null) {
    if (componentFiber.hooksChain === null) {
      // 🔵 首次渲染：创建第一个 Hook 节点

      hook = {
        value: initialValue, // 保存 state 的值
        next: null, // 指向下一个 Hook（现在还没有，所以是 null）
      };

      // 把这个 Hook 设置为链表的头节点
      componentFiber.hooksChain = hook;
    } else {
      // 🟢 Re-render：链表已存在，复用第一个节点
      hook = componentFiber.hooksChain;
    }
  } else {
    // ----- 分支 2：处理后续的 Hook（不是第一个）-----

    if (currentHook.next === null) {
      // 🔵 首次渲染：创建新 Hook 节点

      hook = {
        value: initialValue,
        next: null,
      };
      // 把新节点连接到链表：上一个 Hook 的 next 指向新节点
      currentHook.next = hook;
    } else {
      // 🟢 Re-render：下一个节点已存在，复用它
      hook = currentHook.next;
    }
  }

  currentHook = hook;

  const setState = (newValue) => {
    hook.value = newValue;
    rerender();
  };

  // 返回 [当前值, 更新函数]
  return [hook.value, setState];
}

function render() {
  currentHook = null;
  MyComponent();
}

function rerender() {
  render();
}

function MyComponent() {
  /**
   * 调用顺序分析：
   *
   * 首次渲染：
   * 1. currentHook = null (render 函数重置的)
   * 2. 调用 useState('Kai')
   *    - currentHook === null，且链表为空
   *    - 创建 Hook0，设置为链表头
   *    - currentHook = Hook0
   * 3. 调用 useState(25)
   *    - currentHook === Hook0 (不是 null)
   *    - Hook0.next === null
   *    - 创建 Hook1，连接到 Hook0
   *    - currentHook = Hook1
   * 4. 调用 useState('Developer')
   *    - currentHook === Hook1
   *    - Hook1.next === null
   *    - 创建 Hook2，连接到 Hook1
   *    - currentHook = Hook2
   *
   * 链表结果：Hook0('Kai') → Hook1(25) → Hook2('Developer')
   *
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *
   * Re-render：
   * 1. currentHook = null (render 函数重置的)
   * 2. 调用 useState('Kai')
   *    - currentHook === null，但链表已存在
   *    - hook = componentFiber.hooksChain (复用 Hook0)
   *    - currentHook = Hook0
   * 3. 调用 useState(25)
   *    - currentHook === Hook0
   *    - Hook0.next === Hook1 (已存在)
   *    - hook = Hook0.next (复用 Hook1)
   *    - currentHook = Hook1
   * 4. 调用 useState('Developer')
   *    - currentHook === Hook1
   *    - Hook1.next === Hook2 (已存在)
   *    - hook = Hook1.next (复用 Hook2)
   *    - currentHook = Hook2
   *
   * ✅ 完美匹配！每个 useState 都读取到了正确的 Hook
   */
  const [name, setName] = useState("Kai");
  const [age, setAge] = useState(25);
  const [job, setJob] = useState("Developer");

  return { setName, setAge, setJob };
}

// ============================================
// 错误示例：条件 Hook
// ============================================

let showExtra = true;

function BrokenComponent() {
  /**
   * 调用顺序分析（问题演示）：
   *
   * 首次渲染 (showExtra = true)：
   * 1. currentHook = null
   * 2. useState('Kai')    → 创建 Hook0, currentHook = Hook0
   * 3. if (true) 进入
   * 4. useState('Extra')  → 创建 Hook1, currentHook = Hook1
   * 5. useState(25)       → 创建 Hook2, currentHook = Hook2
   *
   * 链表：Hook0('Kai') → Hook1('Extra') → Hook2(25)
   *
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *
   * Re-render (showExtra = false)：
   * 1. currentHook = null
   * 2. useState('Kai')    → hook = Hook0 ✅ 正确
   *                         currentHook = Hook0
   * 3. if (false) 不进入  → 跳过了一次 useState 调用！
   * 4. useState(25)       → hook = Hook0.next = Hook1 ❌ 错误！
   *                         currentHook = Hook1
   *
   * ❌ 问题：
   * - 第二个 useState(25) 期望读取 age 的值 (25)
   * - 但实际读取到了 Hook1，它保存的是 extra 的值 ('Extra')
   * - Hook2 永远不会被访问到！
   *
   * 这就是为什么不能在条件语句中使用 Hooks：
   * - 条件改变 → useState 调用次数改变
   * - 调用次数改变 → currentHook 指针移动次数改变
   * - 指针移动错位 → 读取到错误的 Hook 节点
   */
  const [name, setName] = useState("Kai");

  if (showExtra) {
    const [extra, setExtra] = useState("Extra");
  }

  const [age, setAge] = useState(25);

  return { setName, setAge };
}
