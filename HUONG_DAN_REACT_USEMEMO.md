# Hướng Dẫn Chi Tiết về useMemo trong React

## Mục Lục
1. [Giới thiệu về useMemo](#giới-thiệu)
2. [Khi nào cần dùng useMemo](#khi-nào-cần-dùng-usememo)
3. [Cú pháp và cách sử dụng](#cú-pháp-và-cách-sử-dụng)
4. [Các ví dụ thực tế](#các-ví-dụ-thực-tế)
5. [So sánh với useCallback và React.memo](#so-sánh-với-usecallback-và-reactmemo)
6. [Best Practices](#best-practices)
7. [Anti-patterns và cạm bẫy](#anti-patterns-và-cạm-bẫy)
8. [Performance Optimization](#performance-optimization)
9. [Bài tập thực hành](#bài-tập-thực-hành)

## Giới Thiệu

### useMemo là gì?
`useMemo` là một React Hook giúp **memoize** (ghi nhớ) kết quả của một computation (tính toán) phức tạp. Nó chỉ tính toán lại khi dependencies thay đổi, giúp tối ưu performance.

### Mục đích chính
- **Tránh tính toán lại không cần thiết** trong mỗi lần render
- **Cache kết quả** của expensive calculations
- **Optimize performance** cho ứng dụng React

### Cách hoạt động
```
Lần render đầu:
  useMemo tính toán → Lưu kết quả → Return kết quả

Lần render sau:
  Dependencies thay đổi?
    ├─ Có → Tính toán lại → Lưu kết quả mới → Return kết quả mới
    └─ Không → Return kết quả đã lưu (không tính toán lại)
```

## Khi Nào Cần Dùng useMemo

### ✅ NÊN dùng useMemo khi:

1. **Expensive Calculations** - Tính toán phức tạp, tốn resources
2. **Heavy Data Processing** - Xử lý data lớn (filter, sort, map)
3. **Referential Equality** - Cần giữ reference của object/array
4. **Prevent Re-renders** - Tránh re-render không cần thiết của child components

### ❌ KHÔNG nên dùng useMemo khi:

1. **Simple Calculations** - Tính toán đơn giản (cộng, trừ, string concat)
2. **Primitive Values** - Với giá trị primitive đơn giản
3. **Premature Optimization** - Tối ưu quá sớm khi chưa có vấn đề performance
4. **Every Value** - Không wrap mọi thứ trong useMemo

## Cú Pháp và Cách Sử Dụng

### Cú pháp cơ bản
```javascript
const memoizedValue = useMemo(() => {
  // Expensive calculation
  return computedValue;
}, [dependency1, dependency2]);
```

### Ví dụ đơn giản
```javascript
import React, { useState, useMemo } from 'react';

function SimpleExample() {
  const [count, setCount] = useState(0);
  const [input, setInput] = useState('');

  // ❌ Không dùng useMemo - Tính toán đơn giản
  const doubled = count * 2;

  // ✅ Dùng useMemo - Tính toán phức tạp
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value...');
    let result = 0;
    for (let i = 0; i < count * 1000000; i++) {
      result += i;
    }
    return result;
  }, [count]); // Chỉ tính lại khi count thay đổi

  return (
    <div>
      <h2>Count: {count}</h2>
      <h3>Doubled: {doubled}</h3>
      <h3>Expensive: {expensiveValue}</h3>

      <button onClick={() => setCount(count + 1)}>Increment Count</button>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type something..."
      />
      <p>Input không ảnh hưởng đến expensive calculation</p>
    </div>
  );
}
```

## Các Ví Dụ Thực Tế

### 1. Filtering và Sorting Data

```javascript
function ProductList({ products, searchTerm, sortBy }) {
  // ✅ GOOD: Memoize filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    console.log('Filtering and sorting products...');

    // Filter products
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, sortBy]); // Dependencies

  return (
    <div>
      <h2>Products ({filteredAndSortedProducts.length})</h2>
      {filteredAndSortedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 2. Complex Calculations với Charts

```javascript
function SalesChart({ salesData, dateRange }) {
  // Calculate chart data
  const chartData = useMemo(() => {
    console.log('Processing chart data...');

    const { startDate, endDate } = dateRange;

    // Filter data by date range
    const filteredData = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Group by month
    const groupedByMonth = filteredData.reduce((acc, sale) => {
      const month = new Date(sale.date).toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      });

      if (!acc[month]) {
        acc[month] = {
          month,
          total: 0,
          count: 0,
          average: 0
        };
      }

      acc[month].total += sale.amount;
      acc[month].count += 1;
      acc[month].average = acc[month].total / acc[month].count;

      return acc;
    }, {});

    // Convert to array for chart
    return Object.values(groupedByMonth).map(item => ({
      x: item.month,
      y: item.total,
      average: item.average,
      count: item.count
    }));
  }, [salesData, dateRange]);

  return (
    <div>
      <h3>Sales Analytics</h3>
      <LineChart data={chartData} />
      <div>
        Total Months: {chartData.length}
      </div>
    </div>
  );
}
```

### 3. Pagination với useMemo

```javascript
function PaginatedTable({ data, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Memoize sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    console.log('Sorting data...');
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  // Memoize pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = sortedData.slice(startIndex, endIndex);

    return {
      currentData,
      totalPages,
      startIndex,
      endIndex,
      totalItems: sortedData.length,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    };
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('age')}>
              Age {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginationInfo.currentData.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.age}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={!paginationInfo.hasPrev}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {paginationInfo.totalPages}
          (Items {paginationInfo.startIndex + 1}-{Math.min(paginationInfo.endIndex, paginationInfo.totalItems)} of {paginationInfo.totalItems})
        </span>

        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={!paginationInfo.hasNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 4. Form Validation với useMemo

```javascript
function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    acceptTerms: false
  });

  // Memoize validation results
  const validationErrors = useMemo(() => {
    console.log('Validating form...');
    const errors = {};

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age) {
      errors.age = 'Age is required';
    } else if (isNaN(age) || age < 18 || age > 120) {
      errors.age = 'Age must be between 18 and 120';
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    return errors;
  }, [formData]);

  // Memoize form validity
  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0 &&
           Object.values(formData).every(value =>
             typeof value === 'boolean' ? true : value !== ''
           );
  }, [validationErrors, formData]);

  // Memoize password strength
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { level: 0, text: 'No password' };

    let strength = 0;
    const checks = [
      password.length >= 8,
      password.length >= 12,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^a-zA-Z\d]/.test(password)
    ];

    strength = checks.filter(Boolean).length;

    const levels = [
      { level: 0, text: 'Very Weak', color: 'red' },
      { level: 1, text: 'Weak', color: 'orange' },
      { level: 2, text: 'Fair', color: 'yellow' },
      { level: 3, text: 'Good', color: 'lightgreen' },
      { level: 4, text: 'Strong', color: 'green' },
      { level: 5, text: 'Very Strong', color: 'darkgreen' }
    ];

    return levels[Math.min(strength - 1, 5)] || levels[0];
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form>
      <div>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />
        {validationErrors.username && (
          <span className="error">{validationErrors.username}</span>
        )}
      </div>

      <div>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {formData.password && (
          <div style={{ color: passwordStrength.color }}>
            Strength: {passwordStrength.text}
          </div>
        )}
        {validationErrors.password && (
          <span className="error">{validationErrors.password}</span>
        )}
      </div>

      <button type="submit" disabled={!isFormValid}>
        Register
      </button>
    </form>
  );
}
```

### 5. Expensive Component Props

```javascript
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ BAD: Object được tạo mới mỗi lần render
  // const config = {
  //   theme: 'dark',
  //   showHeader: true,
  //   itemsPerPage: 10
  // };

  // ✅ GOOD: Memoize object để giữ reference
  const config = useMemo(() => ({
    theme: 'dark',
    showHeader: true,
    itemsPerPage: 10
  }), []); // Empty deps = never changes

  // Memoize array of items
  const items = useMemo(() => {
    console.log('Creating items array...');
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 100
    }));
  }, []); // Create once

  // Memoize filtered items based on text
  const filteredItems = useMemo(() => {
    if (!text) return items;

    return items.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );
  }, [items, text]);

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Filter items..."
      />

      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>

      {/* ChildComponent won't re-render unnecessarily */}
      <ExpensiveChildComponent
        config={config}
        items={filteredItems}
      />
    </div>
  );
}

// Child component with React.memo
const ExpensiveChildComponent = React.memo(({ config, items }) => {
  console.log('ExpensiveChildComponent rendered');

  return (
    <div>
      <h3>Config: {config.theme}</h3>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}: {item.value.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
});
```

## So Sánh với useCallback và React.memo

### Comparison Table

| Feature | useMemo | useCallback | React.memo |
|---------|---------|-------------|------------|
| **Mục đích** | Memoize giá trị | Memoize function | Memoize component |
| **Return** | Computed value | Function reference | Component |
| **Sử dụng** | Expensive calculations | Event handlers, callbacks | Pure components |
| **Re-compute** | Khi deps thay đổi | Khi deps thay đổi | Khi props thay đổi |

### Ví dụ so sánh

```javascript
function ComparisonExample() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 1. useMemo - Memoize VALUE
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value');
    return count * 1000;
  }, [count]);

  // 2. useCallback - Memoize FUNCTION
  const handleClick = useCallback(() => {
    console.log('Button clicked, count:', count);
    setCount(count + 1);
  }, [count]);

  // 3. Without memoization
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div>
      <div>Expensive Value: {expensiveValue}</div>

      {/* useCallback prevents creating new function reference */}
      <MemoizedButton onClick={handleClick} />

      {/* Regular function - creates new reference each render */}
      <input onChange={handleTextChange} value={text} />
    </div>
  );
}

// 3. React.memo - Memoize COMPONENT
const MemoizedButton = React.memo(({ onClick }) => {
  console.log('MemoizedButton rendered');
  return <button onClick={onClick}>Click Me</button>;
});

// Custom comparison function
const CustomMemoComponent = React.memo(
  ({ data, onClick }) => {
    return <div onClick={onClick}>{data.name}</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    // Return false if props are different (re-render)
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### Khi nào dùng cái nào?

```javascript
function WhenToUseWhat() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  // Use useMemo for:
  // 1. Expensive calculations
  const primeNumbers = useMemo(() => {
    return calculatePrimesUpTo(count * 1000);
  }, [count]);

  // 2. Object/Array references for dependencies
  const filterConfig = useMemo(() => ({
    minPrice: 100,
    maxPrice: 1000,
    inStock: true
  }), []);

  // Use useCallback for:
  // 1. Functions passed to memoized components
  const handleItemClick = useCallback((id) => {
    console.log('Item clicked:', id);
  }, []);

  // 2. Functions in dependency arrays
  const fetchData = useCallback(async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    setItems(data);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Safe dependency

  // Use React.memo for:
  // Components that receive same props frequently
  return (
    <div>
      <ItemList
        items={items}
        onItemClick={handleItemClick}
        config={filterConfig}
      />
    </div>
  );
}

const ItemList = React.memo(({ items, onItemClick, config }) => {
  console.log('ItemList rendered');
  // Component implementation
});
```

## Best Practices

### 1. Measure Before Optimizing

```javascript
function MeasurePerformance() {
  const [renderTime, setRenderTime] = useState(0);

  // Measure without useMemo
  const withoutMemo = () => {
    const start = performance.now();

    // Expensive operation
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += i;
    }

    const end = performance.now();
    return { result, time: end - start };
  };

  // Measure with useMemo
  const withMemo = useMemo(() => {
    const start = performance.now();

    // Same expensive operation
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += i;
    }

    const end = performance.now();
    setRenderTime(end - start);
    return result;
  }, []);

  return (
    <div>
      <h3>Performance Comparison</h3>
      <p>With useMemo: {renderTime.toFixed(2)}ms (first time only)</p>
      <p>Without memo: Calculates every render</p>
    </div>
  );
}
```

### 2. Correct Dependencies

```javascript
function DependencyExamples() {
  const [user, setUser] = useState({ id: 1, name: 'John' });
  const [filter, setFilter] = useState('');

  // ❌ BAD: Missing dependency
  const filtered1 = useMemo(() => {
    return data.filter(item => item.includes(filter));
  }, []); // Missing 'filter' dependency

  // ❌ BAD: Unnecessary dependency
  const filtered2 = useMemo(() => {
    return staticData.filter(item => item.active);
  }, [Math.random()]); // Will recalculate every render

  // ✅ GOOD: Correct dependencies
  const filtered3 = useMemo(() => {
    return data.filter(item =>
      item.userId === user.id &&
      item.name.includes(filter)
    );
  }, [user.id, filter]); // Only necessary deps

  // ✅ GOOD: Use specific properties
  const userDisplay = useMemo(() => {
    return `${user.name} (${user.id})`;
  }, [user.name, user.id]); // Not entire user object
}
```

### 3. Avoid Over-Memoization

```javascript
function AvoidOverMemoization() {
  const [count, setCount] = useState(0);

  // ❌ BAD: Over-memoizing simple calculations
  const doubled = useMemo(() => count * 2, [count]);
  const isEven = useMemo(() => count % 2 === 0, [count]);
  const message = useMemo(() => `Count: ${count}`, [count]);

  // ✅ GOOD: Simple calculations don't need memoization
  const doubled2 = count * 2;
  const isEven2 = count % 2 === 0;
  const message2 = `Count: ${count}`;

  // ✅ GOOD: Memoize only expensive operations
  const fibonacci = useMemo(() => {
    const fib = (n) => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    return fib(count);
  }, [count]);

  return (
    <div>
      <p>Doubled: {doubled2}</p>
      <p>Is Even: {isEven2 ? 'Yes' : 'No'}</p>
      <p>Message: {message2}</p>
      <p>Fibonacci: {fibonacci}</p>
    </div>
  );
}
```

## Anti-patterns và Cạm Bẫy

### 1. Inline Object/Array trong Dependencies

```javascript
function AntiPattern1() {
  // ❌ BAD: Inline object in dependency array
  const result = useMemo(() => {
    return computeSomething();
  }, [{ key: 'value' }]); // New object every render!

  // ✅ GOOD: Stable dependency
  const config = { key: 'value' };
  const result2 = useMemo(() => {
    return computeSomething(config);
  }, [config.key]); // Use primitive value
}
```

### 2. Memoizing Với Non-Deterministic Values

```javascript
function AntiPattern2() {
  // ❌ BAD: Using random values
  const randomList = useMemo(() => {
    return Array.from({ length: 10 }, () => Math.random());
  }, []); // Will be different on server/client (SSR issue)

  // ✅ GOOD: Deterministic values
  const [seed] = useState(() => Math.random());
  const seededList = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => seed * (i + 1));
  }, [seed]);
}
```

### 3. Side Effects trong useMemo

```javascript
function AntiPattern3() {
  const [count, setCount] = useState(0);

  // ❌ BAD: Side effects in useMemo
  const result = useMemo(() => {
    console.log('Computing...'); // Side effect
    localStorage.setItem('count', count); // Side effect
    document.title = `Count: ${count}`; // Side effect
    return count * 2;
  }, [count]);

  // ✅ GOOD: Use useEffect for side effects
  const result2 = useMemo(() => count * 2, [count]);

  useEffect(() => {
    console.log('Count changed:', count);
    localStorage.setItem('count', count);
    document.title = `Count: ${count}`;
  }, [count]);
}
```

## Performance Optimization

### 1. Profiling với React DevTools

```javascript
function ProfilingExample() {
  const [search, setSearch] = useState('');
  const [data] = useState(generateLargeDataset());

  // Wrap in Profiler to measure
  return (
    <React.Profiler id="search" onRender={onRenderCallback}>
      <SearchableList data={data} search={search} />
    </React.Profiler>
  );
}

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}
```

### 2. Lazy Initialization Pattern

```javascript
function LazyInitialization() {
  const [query, setQuery] = useState('');

  // ✅ Lazy initialization for expensive initial value
  const [expensiveData] = useState(() => {
    console.log('Expensive initialization - runs once');
    return processLargeDataset();
  });

  // Combine with useMemo for derived state
  const filteredData = useMemo(() => {
    if (!query) return expensiveData;

    return expensiveData.filter(item =>
      item.searchableText.includes(query)
    );
  }, [expensiveData, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <DataList data={filteredData} />
    </div>
  );
}
```

### 3. Virtual Scrolling với useMemo

```javascript
function VirtualScrollList({ items, itemHeight = 50, containerHeight = 500 }) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      offsetY: startIndex * itemHeight
    };
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${visibleItems.offsetY}px)` }}>
          {visibleItems.items.map((item, index) => (
            <div
              key={visibleItems.startIndex + index}
              style={{ height: itemHeight }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Custom Hooks với useMemo

### 1. useDebounce Hook

```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage with useMemo
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm) return [];

    console.log('Searching for:', debouncedSearchTerm);
    return performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <SearchResults results={searchResults} />
    </div>
  );
}
```

### 2. useMediaQuery Hook

```javascript
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Usage with useMemo
function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const layout = useMemo(() => {
    if (isMobile) return { columns: 1, spacing: 8 };
    if (isTablet) return { columns: 2, spacing: 16 };
    return { columns: 3, spacing: 24 };
  }, [isMobile, isTablet]);

  return (
    <Grid columns={layout.columns} spacing={layout.spacing}>
      {/* Grid items */}
    </Grid>
  );
}
```

## Bài Tập Thực Hành

### Bài 1: Shopping Cart Calculator
Tạo giỏ hàng với:
1. Tính tổng tiền với useMemo
2. Tính discount dựa trên rules
3. Tính shipping fee
4. Tính tax

### Bài 2: Data Table với Filtering
Implement bảng dữ liệu:
1. Multi-column filtering
2. Sorting với useMemo
3. Pagination
4. Export functionality

### Bài 3: Form với Dynamic Validation
Tạo form có:
1. Real-time validation với useMemo
2. Password strength meter
3. Field dependencies
4. Conditional fields

### Bài 4: Dashboard Analytics
Build dashboard với:
1. Chart data processing
2. Statistics calculation
3. Trend analysis
4. Performance metrics

### Bài 5: Search với Fuzzy Matching
Implement search:
1. Fuzzy search algorithm
2. Highlighting matches
3. Relevance scoring
4. Search suggestions

## Testing useMemo

```javascript
import { renderHook } from '@testing-library/react-hooks';

// Test custom hook with useMemo
describe('useExpensiveCalculation', () => {
  it('should memoize expensive calculation', () => {
    const { result, rerender } = renderHook(
      ({ input }) => useExpensiveCalculation(input),
      { initialProps: { input: 5 } }
    );

    const firstResult = result.current;

    // Re-render with same input
    rerender({ input: 5 });
    expect(result.current).toBe(firstResult); // Same reference

    // Re-render with different input
    rerender({ input: 10 });
    expect(result.current).not.toBe(firstResult); // New calculation
  });
});
```

## Troubleshooting

### Common Issues và Solutions

1. **Dependencies không đúng**
   - Use ESLint rule: `exhaustive-deps`
   - Check React DevTools Profiler

2. **Memory leaks**
   - Clear large objects when unmounting
   - Use WeakMap for caching

3. **SSR issues**
   - Ensure deterministic calculations
   - Avoid window/document in initial render

## Tổng Kết

### Quy tắc vàng khi dùng useMemo

1. **Profile First**: Đo performance trước khi optimize
2. **Use Sparingly**: Không lạm dụng cho mọi value
3. **Correct Dependencies**: Luôn khai báo đầy đủ
4. **No Side Effects**: Chỉ pure calculations
5. **Consider Alternatives**: useCallback, React.memo, virtualization

### Performance Checklist

- [ ] Đã measure performance chưa?
- [ ] Calculation có thực sự expensive?
- [ ] Dependencies có chính xác?
- [ ] Có alternative solution không?
- [ ] Code có readable và maintainable?

Remember: **"Premature optimization is the root of all evil"** - Nhưng biết khi nào và cách dùng useMemo là skill quan trọng!

Happy Optimizing! 🚀