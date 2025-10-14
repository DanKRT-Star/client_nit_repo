# Hướng Dẫn React Component Lifecycle

## Mục Lục
1. [Giới thiệu về Lifecycle](#giới-thiệu)
2. [Class Component Lifecycle](#class-component-lifecycle)
3. [Functional Component với Hooks](#functional-component-với-hooks)
4. [So sánh Class vs Hooks](#so-sánh-class-vs-hooks)
5. [Best Practices](#best-practices)
6. [Bài tập thực hành](#bài-tập-thực-hành)

## Giới Thiệu

### Lifecycle là gì?
Component Lifecycle (vòng đời component) là các giai đoạn mà một React component trải qua từ khi được tạo ra đến khi bị hủy. Hiểu rõ lifecycle giúp bạn:
- Kiểm soát khi nào code được thực thi
- Tối ưu performance
- Quản lý side effects hiệu quả
- Cleanup resources đúng cách

### Ba giai đoạn chính của Lifecycle

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│  MOUNTING   │ ---> │  UPDATING   │ ---> │ UNMOUNTING   │
│  (Khởi tạo) │      │ (Cập nhật)  │      │   (Hủy)      │
└─────────────┘      └─────────────┘      └──────────────┘
```

## Class Component Lifecycle

### 1. Mounting Phase (Giai đoạn khởi tạo)

```javascript
class LifecycleDemo extends React.Component {
  // 1. Constructor - Chạy đầu tiên
  constructor(props) {
    super(props);
    console.log('1. Constructor');

    // Khởi tạo state
    this.state = {
      count: 0,
      data: null
    };

    // Bind methods (nếu cần)
    this.handleClick = this.handleClick.bind(this);
  }

  // 2. getDerivedStateFromProps - Chạy trước render
  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps');

    // Cập nhật state dựa trên props
    if (props.defaultCount !== state.count) {
      return { count: props.defaultCount };
    }
    return null; // Không thay đổi state
  }

  // 3. render - Bắt buộc phải có
  render() {
    console.log('3. Render');

    return (
      <div>
        <h1>Count: {this.state.count}</h1>
        <button onClick={this.handleClick}>Increment</button>
      </div>
    );
  }

  // 4. componentDidMount - Chạy sau khi render xong
  componentDidMount() {
    console.log('4. ComponentDidMount');

    // Nơi thực hiện:
    // - API calls
    // - DOM manipulations
    // - Subscriptions
    // - Timers

    this.fetchData();
    this.timer = setInterval(() => {
      console.log('Timer running...');
    }, 1000);
  }

  // Helper methods
  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  async fetchData() {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      this.setState({ data });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
```

### 2. Updating Phase (Giai đoạn cập nhật)

```javascript
class UpdateLifecycle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      prevCount: 0
    };
  }

  // 1. getDerivedStateFromProps - Chạy trước mỗi lần render
  static getDerivedStateFromProps(props, state) {
    console.log('Update 1: getDerivedStateFromProps');
    // Có thể update state dựa trên props mới
    return null;
  }

  // 2. shouldComponentUpdate - Quyết định có render lại không
  shouldComponentUpdate(nextProps, nextState) {
    console.log('Update 2: shouldComponentUpdate');

    // Return false để ngăn re-render (optimization)
    if (nextState.count === this.state.count) {
      return false;
    }
    return true;
  }

  // 3. render
  render() {
    console.log('Update 3: Render');

    return (
      <div>
        <h2>Current: {this.state.count}</h2>
        <h3>Previous: {this.state.prevCount}</h3>
        <button onClick={() => this.increment()}>+1</button>
        <button onClick={() => this.incrementBy5()}>+5</button>
      </div>
    );
  }

  // 4. getSnapshotBeforeUpdate - Chạy trước khi DOM update
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('Update 4: getSnapshotBeforeUpdate');

    // Capture một số thông tin từ DOM (scroll position, etc.)
    if (prevState.count < this.state.count) {
      return { message: 'Count increased!' };
    }
    return null;
  }

  // 5. componentDidUpdate - Chạy sau khi DOM update
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('Update 5: componentDidUpdate');
    console.log('Snapshot:', snapshot);

    // Nơi thực hiện side effects sau khi update
    if (prevState.count !== this.state.count) {
      console.log(`Count changed from ${prevState.count} to ${this.state.count}`);

      // Có thể gọi API với data mới
      // this.fetchDataForCount(this.state.count);
    }

    // Cẩn thận: Đừng setState không điều kiện ở đây -> infinite loop!
    // ❌ this.setState({ something: 'new' }); // Infinite loop!

    // ✅ Luôn có điều kiện
    if (this.state.count > 10 && !this.state.showWarning) {
      this.setState({ showWarning: true });
    }
  }

  increment() {
    this.setState(prevState => ({
      count: prevState.count + 1,
      prevCount: prevState.count
    }));
  }

  incrementBy5() {
    this.setState(prevState => ({
      count: prevState.count + 5,
      prevCount: prevState.count
    }));
  }
}
```

### 3. Unmounting Phase (Giai đoạn hủy)

```javascript
class UnmountLifecycle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 0
    };
  }

  componentDidMount() {
    // Setup timer
    this.timer = setInterval(() => {
      this.setState({ seconds: this.state.seconds + 1 });
    }, 1000);

    // Event listeners
    window.addEventListener('resize', this.handleResize);

    // Subscriptions
    this.subscription = someEventEmitter.subscribe(this.handleEvent);
  }

  // componentWillUnmount - Cleanup trước khi component bị hủy
  componentWillUnmount() {
    console.log('Component will unmount - Cleaning up...');

    // QUAN TRỌNG: Cleanup để tránh memory leaks

    // Clear timers
    if (this.timer) {
      clearInterval(this.timer);
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Cancel subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Cancel pending API requests
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  handleResize = () => {
    console.log('Window resized');
  }

  handleEvent = (data) => {
    console.log('Event received:', data);
  }

  render() {
    return (
      <div>
        <h2>Timer: {this.state.seconds} seconds</h2>
      </div>
    );
  }
}
```

### 4. Error Handling Lifecycle

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  // 1. getDerivedStateFromError - Update state khi có lỗi
  static getDerivedStateFromError(error) {
    console.log('getDerivedStateFromError:', error);

    // Update state để render UI fallback
    return { hasError: true };
  }

  // 2. componentDidCatch - Log error, send to service
  componentDidCatch(error, errorInfo) {
    console.log('componentDidCatch');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);

    // Log error to error reporting service
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Oops! Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Sử dụng Error Boundary
function App() {
  return (
    <ErrorBoundary>
      <ComponentThatMightError />
    </ErrorBoundary>
  );
}
```

## Functional Component với Hooks

### Hook tương ứng với Lifecycle Methods

| Class Lifecycle | Hook Equivalent | Purpose |
|----------------|-----------------|---------|
| constructor | useState | Khởi tạo state |
| componentDidMount | useEffect(() => {}, []) | Side effects khi mount |
| componentDidUpdate | useEffect(() => {}) | Side effects khi update |
| componentWillUnmount | useEffect(() => { return () => {} }, []) | Cleanup |
| shouldComponentUpdate | React.memo | Optimization |
| getDerivedStateFromProps | useState + useEffect | Sync state với props |

### 1. useState - Thay thế constructor

```javascript
// Class Component
class ClassCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      name: 'User'
    };
  }

  render() {
    return <div>{this.state.count}</div>;
  }
}

// Functional Component với Hook
function HookCounter() {
  // Mỗi useState cho một giá trị state
  const [count, setCount] = useState(0);
  const [name, setName] = useState('User');

  // Hoặc dùng object (ít phổ biến hơn)
  const [state, setState] = useState({
    count: 0,
    name: 'User'
  });

  // Lazy initialization - chỉ chạy 1 lần
  const [expensiveValue, setExpensiveValue] = useState(() => {
    return computeExpensiveValue();
  });

  return <div>{count}</div>;
}
```

### 2. useEffect - Thay thế lifecycle methods

```javascript
import React, { useState, useEffect } from 'react';

function LifecycleHooks() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  // 1. componentDidMount equivalent
  useEffect(() => {
    console.log('Component mounted');

    // Fetch initial data
    fetchData();

    // Setup subscriptions
    const subscription = subscribeToSomething();

    // Cleanup function (componentWillUnmount)
    return () => {
      console.log('Component will unmount');
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array = chỉ chạy 1 lần

  // 2. componentDidUpdate equivalent
  useEffect(() => {
    console.log('Count updated:', count);

    // Side effect khi count thay đổi
    document.title = `Count: ${count}`;

  }, [count]); // Chạy khi count thay đổi

  // 3. Multiple effects cho different concerns
  useEffect(() => {
    console.log('Data changed');
    // Process data
  }, [data]);

  // 4. Effect với cleanup cho mỗi update
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`Count is ${count}`);
    }, 1000);

    // Cleanup chạy trước effect tiếp theo và khi unmount
    return () => {
      clearTimeout(timer);
    };
  }, [count]);

  // 5. Conditional effects
  useEffect(() => {
    if (count > 5) {
      console.log('Count is greater than 5');
      // Do something special
    }
  }, [count]);

  async function fetchData() {
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      {data && <div>Data: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

### 3. useLayoutEffect - Synchronous DOM updates

```javascript
import React, { useState, useLayoutEffect, useRef } from 'react';

function LayoutEffectExample() {
  const [width, setWidth] = useState(0);
  const elementRef = useRef(null);

  // useLayoutEffect chạy đồng bộ sau DOM mutations
  // Dùng khi cần đọc/ghi DOM trước khi browser paint
  useLayoutEffect(() => {
    if (elementRef.current) {
      const { width } = elementRef.current.getBoundingClientRect();
      setWidth(width);
    }
  }, []);

  // So sánh với useEffect (có thể gây flicker)
  // useEffect(() => {
  //   // Chạy sau khi browser paint -> có thể thấy flicker
  // }, []);

  return (
    <div ref={elementRef}>
      Element width: {width}px
    </div>
  );
}
```

### 4. Custom Hooks với Lifecycle Logic

```javascript
// Custom hook for component lifecycle
function useLifecycle(onMount, onUnmount) {
  useEffect(() => {
    if (onMount) onMount();

    return () => {
      if (onUnmount) onUnmount();
    };
  }, []); // Empty deps = mount/unmount only
}

// Custom hook for previous value
function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Custom hook for component update
function useUpdate(callback, dependencies) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      callback();
    } else {
      mounted.current = true;
    }
  }, dependencies);
}

// Sử dụng custom hooks
function MyComponent({ value }) {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  const prevValue = usePrevious(value);

  // Component lifecycle
  useLifecycle(
    () => console.log('Component mounted'),
    () => console.log('Component will unmount')
  );

  // Update effect (skip initial render)
  useUpdate(() => {
    console.log('Count updated from', prevCount, 'to', count);
  }, [count]);

  return (
    <div>
      <p>Current: {count}, Previous: {prevCount}</p>
      <p>Prop changed: {prevValue !== value ? 'Yes' : 'No'}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## So Sánh Class vs Hooks

### Lifecycle Flow Comparison

```javascript
// CLASS COMPONENT FLOW
class ClassFlow extends React.Component {
  constructor(props) {
    // 1. Initialize
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    // 2. After first render
    console.log('Mounted');
  }

  componentDidUpdate(prevProps, prevState) {
    // 3. After updates
    if (prevState.count !== this.state.count) {
      console.log('Count changed');
    }
  }

  componentWillUnmount() {
    // 4. Before destroy
    console.log('Unmounting');
  }

  render() {
    return <div>{this.state.count}</div>;
  }
}

// FUNCTIONAL COMPONENT FLOW
function HooksFlow() {
  // 1. Initialize (runs every render)
  const [count, setCount] = useState(0);

  // 2. Effects (after render)
  useEffect(() => {
    console.log('Mounted');

    // 4. Cleanup
    return () => {
      console.log('Unmounting');
    };
  }, []);

  // 3. Update effects
  useEffect(() => {
    console.log('Count changed');
  }, [count]);

  return <div>{count}</div>;
}
```

### Key Differences

| Aspect | Class Components | Functional Components |
|--------|-----------------|----------------------|
| Syntax | Class-based, `this` keyword | Function-based, no `this` |
| State | Single state object | Multiple useState calls |
| Side Effects | Multiple lifecycle methods | useEffect hook |
| Code Reuse | HOCs, render props | Custom hooks |
| Performance | PureComponent | React.memo |
| Readability | More verbose | More concise |
| Testing | More complex | Easier to test |

## Best Practices

### 1. Cleanup is Critical

```javascript
function ProperCleanup() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    async function fetchData() {
      try {
        const response = await fetch('/api/data', {
          signal: abortController.signal
        });
        const result = await response.json();

        // Check if component is still mounted
        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          console.error('Fetch error:', error);
        }
      }
    }

    fetchData();

    // Cleanup function
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, []);

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
```

### 2. Optimize Re-renders

```javascript
import React, { memo, useCallback, useMemo } from 'react';

// Memoized component
const ExpensiveChild = memo(({ onClick, data }) => {
  console.log('ExpensiveChild rendered');

  return (
    <div onClick={onClick}>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]);

  // Memoize callback to prevent re-creating function
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // Empty deps = never recreate

  // Memoize expensive computation
  const processedData = useMemo(() => {
    console.log('Processing data...');
    return items.map(item => ({
      ...item,
      processed: true
    }));
  }, [items]); // Recompute only when items change

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <ExpensiveChild onClick={handleClick} data={processedData} />
    </div>
  );
}
```

### 3. Handle Errors Gracefully

```javascript
// Custom hook for error handling
function useErrorHandler() {
  const [error, setError] = useState(null);

  const resetError = () => setError(null);

  const captureError = useCallback((error) => {
    setError(error);
    console.error('Error captured:', error);
  }, []);

  useEffect(() => {
    if (error) {
      // Log to error service
      // logErrorToService(error);
    }
  }, [error]);

  return { error, resetError, captureError };
}

// Error Boundary for Hooks
function ErrorFallback({ error, resetError }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetError}>Try again</button>
    </div>
  );
}

// Using react-error-boundary package
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <ComponentThatMightError />
    </ErrorBoundary>
  );
}
```

### 4. Debug Lifecycle

```javascript
// Custom hook for debugging lifecycle
function useLifecycleDebug(componentName, props) {
  const prevProps = useRef();

  useEffect(() => {
    console.log(`${componentName} mounted`);

    return () => {
      console.log(`${componentName} will unmount`);
    };
  }, [componentName]);

  useEffect(() => {
    if (prevProps.current) {
      const changedProps = Object.entries(props).filter(
        ([key, val]) => prevProps.current[key] !== val
      );

      if (changedProps.length > 0) {
        console.log(`${componentName} updated:`, changedProps);
      }
    }

    prevProps.current = props;
  });
}

// Usage
function MyComponent(props) {
  useLifecycleDebug('MyComponent', props);

  return <div>{props.content}</div>;
}
```

## Common Patterns

### 1. Data Fetching Pattern

```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 2. Subscription Pattern

```javascript
function useSubscription(eventName, handler) {
  const savedHandler = useRef();

  // Update ref when handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Create event listener that calls handler
    const eventListener = (event) => savedHandler.current(event);

    // Subscribe
    EventBus.on(eventName, eventListener);

    // Cleanup
    return () => {
      EventBus.off(eventName, eventListener);
    };
  }, [eventName]);
}

// Usage
function NotificationComponent() {
  const [notifications, setNotifications] = useState([]);

  useSubscription('new-notification', (notification) => {
    setNotifications(prev => [...prev, notification]);
  });

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.message}</div>
      ))}
    </div>
  );
}
```

### 3. Timer Pattern

```javascript
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Usage
function Timer() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(
    () => {
      setCount(count + 1);
    },
    isRunning ? 1000 : null
  );

  return (
    <div>
      <h1>Timer: {count}s</h1>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Resume'}
      </button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

## Bài Tập Thực Hành

### Bài 1: Counter với Full Lifecycle
Tạo một counter component có:
1. Log tất cả lifecycle events
2. Save count vào localStorage
3. Restore count khi mount
4. Cleanup khi unmount

### Bài 2: Data Fetcher
Tạo component:
1. Fetch data khi mount
2. Re-fetch khi props thay đổi
3. Cancel request khi unmount
4. Handle loading, error states

### Bài 3: Real-time Clock
Implement đồng hồ:
1. Update mỗi giây
2. Format multiple timezones
3. Pause/resume functionality
4. Proper cleanup

### Bài 4: Form với Validation
Tạo form có:
1. Validation realtime
2. Debounce input
3. Save draft vào localStorage
4. Cleanup on unmount

### Bài 5: Chat Component
Build chat interface:
1. Connect WebSocket on mount
2. Reconnect on disconnect
3. Send/receive messages
4. Cleanup on unmount

## Troubleshooting Common Issues

### 1. Infinite Loop
```javascript
// ❌ SAI - Infinite loop
useEffect(() => {
  setCount(count + 1); // Gây re-render vô hạn
});

// ✅ ĐÚNG - Có dependency array
useEffect(() => {
  // Chỉ chạy khi cần thiết
}, [specificDependency]);
```

### 2. Stale Closure
```javascript
// ❌ SAI - Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // Always adds to 0
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty deps = count always 0
}

// ✅ ĐÚNG - Use function update
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1); // Use previous value
    }, 1000);

    return () => clearInterval(timer);
  }, []);
}
```

### 3. Missing Dependencies
```javascript
// ❌ SAI - Missing dependency
useEffect(() => {
  fetchUser(userId); // userId not in deps
}, []); // ESLint warning

// ✅ ĐÚNG - Include all dependencies
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

## Tài Liệu Tham Khảo

- [React Lifecycle Methods Diagram](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [useEffect Complete Guide](https://overreacted.io/a-complete-guide-to-useeffect/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Tổng Kết

Understanding React Lifecycle giúp bạn:
- ✅ Viết code hiệu quả hơn
- ✅ Tránh memory leaks
- ✅ Debug dễ dàng hơn
- ✅ Optimize performance
- ✅ Handle side effects properly

Remember: **"Effects are an escape hatch from the React paradigm. Don't overuse them!"**

Happy Learning! 🚀