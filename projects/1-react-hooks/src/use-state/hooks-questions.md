# hooks 相关问题

## 为什么 hooks 只能在组件的顶层中定义

### 主回答（结构化，2-3 分钟）

React Hooks 不能放在条件语句中，核心原因是 React 依赖 Hooks 的调用顺序来管理状态。
具体来说分四个层面

1. 背景 - 为什么需要这个机制

   - 函数组件每次渲染都会重新执行整个函数
   - 函数内的所有变量（包括 `const [count, setCount]`）都是新创建的
   - 但 state 的值需要在多次渲染间保持，所以必须存储在**组件外部**

2. 存储机制 - 在哪里存

   - React 为每个组件维护了一个 **Fiber 节点**
   - Fiber 节点上有一个 **Hooks 链表**，按调用顺序存储所有 Hook 的状态
   - 首次渲染时，每调用一次 `useState`，就创建一个新的链表节点

3. 读取机制 - 怎么读

   - Re-render 时，React 会**重置指针到链表头部**
   - 每次调用 `useState`，指针向后移动一位，读取对应位置的值
   - 关键：React 是通过"第几次调用"来匹配状态，而不是变量名

4. 为什么条件语句会破坏机制

   - 如果 `useState` 在 `if` 中：
   - 首次渲染 `if` 成立，创建了 3 个 Hook 节点
   - Re-render 时 `if` 不成立，只调用了 2 次 `useState`
   - 指针移动次数不同，导致后续的 Hook 读取到错误位置的值

### 补充：其他 Hooks 也是同样机制

- `useEffect`、`useCallback`、`useMemo` 等所有 Hooks 都存在这个链表中
- 即使它们不存储"数据"，也需要记住依赖项、回调函数等
- 所以所有 Hooks 都必须遵守调用顺序的规则

---

## 可能的追问 + 标准答案

### 追问 1：为什么不用对象或 Map 存储，而用链表？

用对象需要给每个 state 提供唯一标识符：

```javascript
// 假设用对象
useState("count", 0); // 需要手动传 key
useState("name", "Kai");
```

但这样有几个问题：

1. **增加开发者负担** - 需要手动命名，容易重名
2. **JavaScript 限制** - 函数执行后，局部变量名会丢失，无法自动获取
3. **性能问题** - 对象查找比指针移动慢

而链表的优点是：

- **调用顺序是天然的** - 代码书写顺序就决定了存储顺序
- **零成本** - 不需要开发者提供额外信息
- **性能好** - 直接通过指针移动访问，O(1) 复杂度"

---

### 追问 2：useEffect 也是同样的机制吗？它不存储数据啊？

useEffect 也在同一个链表中，虽然它不存储 state 值，但需要存储：

- **上一次的依赖项数组** - 用来对比是否变化
- **清理函数** - `useEffect` 返回的 cleanup 函数
- **回调函数的引用**

每次 re-render 时，React 会：

1. 读取链表中保存的旧依赖项
2. 和新依赖项对比
3. 如果变化了，执行 effect

所以 `useEffect` 的 Hook 节点大概长这样：

```javascript
{
  memoizedState: {
    create: effectCallback,    // effect 函数
    deps: [count, name],       // 依赖数组
    destroy: cleanupFunction,  // 清理函数
  },
  next: nextHook
}
```

这也是为什么依赖项必须是数组，React 需要按顺序对比。"

---

### 追问 3：真实的 React 源码是用链表实现的吗？

真实源码也是链表，但更复杂：

1. Fiber 架构 - 每个组件对应一个 Fiber 节点
2. Hook 对象 - 链表节点的结构类似：

```javascript
{
  memoizedState: any,      // 当前状态
  baseState: any,          // 基础状态（用于并发）
  queue: UpdateQueue,      // 更新队列
  next: Hook               // 下一个 Hook
}
```

3. 双缓冲: 有 `current` 和 `workInProgress` 两棵 Fiber 树
4. 并发模式: - 支持中断和恢复渲染

核心思想是一样的：**通过链表 + 顺序访问来保存和读取状态**。

可以在 React 源码的 `ReactFiberHooks.js` 文件中找到实现。"

---

### 追问 4：如果不小心在 if 中用了 Hook，React 会报错吗？

React 在开发模式下会检测 Hook 数量变化，报错信息类似：

```markdown
React has detected a change in the order of Hooks called by Component.
This will lead to bugs and errors if not fixed.
```

具体机制：

1. React 会记录首次渲染时的 Hook 数量
2. Re-render 时对比数量是否一致
3. 不一致就抛出错误

另外，官方提供了 **eslint-plugin-react-hooks** 插件：

- 规则 1：`rules-of-hooks` - 静态检查 Hook 是否在条件/循环中
- 规则 2：`exhaustive-deps` - 检查依赖项是否完整

建议项目中一定要配置这个插件。"

---

### 追问 5：为什么类组件不需要遵守这个规则？

"因为类组件的 state 存储方式不同：

```javascript
class Counter extends React.Component {
  state = { count: 0, name: "Kai" }; // 存在 this.state 对象上

  render() {
    return <div>{this.state.count}</div>; // 通过属性名访问
  }
}
```

- State 存在 `this.state` 对象上
- 通过**属性名**（`count`、`name`）访问，不依赖顺序
- `this` 对象在组件生命周期内一直存在

函数组件：

```javascript
function Counter() {
  const [count, setCount] = useState(0); // 没有 this，怎么办？
  return <div>{count}</div>;
}
```

- 没有 `this` 可以挂载 state
- 每次执行，所有局部变量都是新的
- 只能通过**外部链表 + 调用顺序**来关联

所以函数组件的限制是技术实现导致的，而类组件天然有 `this` 对象可以用属性名访问。"

---

### 追问 6：自定义 Hook 也要遵守这个规则吗？

是的，自定义 Hook 本质就是普通函数，内部调用了内置 Hooks：

```javascript
function useCounter(initialValue) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(count + 1);
  return { count, increment };
}

// 使用
function App() {
  const counter = useCounter(0); // 这里调用了 useState
  return <div>{counter.count}</div>;
}
```

自定义 Hook 的调用，最终会展开成内置 Hooks 的调用：

- `useCounter` 内部调用 `useState`
- 这个 `useState` 会被加入链表
- 所以 `useCounter` 也不能放在条件语句中

**命名规范：**

- 自定义 Hook 必须以 `use` 开头
- ESLint 插件会根据这个规范检查规则"

---

## 补充

这个设计体现了 React 的权衡：

- **优点**：开发者无需手动管理状态标识，API 简洁
- **代价**：必须遵守调用规则，增加了心智负担
- **未来**：React Forget（自动优化编译器）可能会改变这些规则

**这也是为什么 React 团队强调：**

> Hooks 是一种约定，而不是魔法。遵守规则，就能获得强大的能力。"

---
