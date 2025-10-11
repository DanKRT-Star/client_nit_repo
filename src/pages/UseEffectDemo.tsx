import React, { useState, useEffect } from 'react';

const UseEffectDemo = () => {
  // Example 1: useEffect chạy sau mỗi lần render
  const [count, setCount] = useState(0);

  // Example 2: useEffect với dependency array rỗng (chỉ chạy 1 lần khi mount)
  const [message, setMessage] = useState('');

  // Example 3: useEffect với dependencies (chạy khi dependencies thay đổi)
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Example 4: useEffect với cleanup function
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Example 5: Fetch data với useEffect
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. useEffect chạy sau MỌI lần render (không có dependency array)
  useEffect(() => {
    console.log('🔄 Component đã render! Count hiện tại:', count);
    // Cẩn thận: useEffect này chạy rất nhiều lần!
  });

  // 2. useEffect chỉ chạy 1 lần khi component mount (dependency array rỗng [])
  useEffect(() => {
    console.log('🎉 Component được mount lần đầu tiên!');
    setMessage('Welcome to useEffect Demo!');

    // Cleanup function: chạy khi component unmount
    return () => {
      console.log('👋 Component bị unmount!');
    };
  }, []);

  // 3. useEffect chạy khi isRunning hoặc seconds thay đổi
  useEffect(() => {
    let interval: number | undefined;

    if (isRunning) {
      interval = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    // Cleanup: clear interval khi component unmount hoặc isRunning thay đổi
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  // 4. useEffect với event listener (cần cleanup)
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: remove event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 5. Fetch data với useEffect
  const fetchUser = () => {
    setLoading(true);
    setUser(null);

    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then(response => response.json())
      .then(data => {
        console.log('data', data);
        setUser(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: 'white',
          marginBottom: '40px',
          fontSize: '36px',
          fontWeight: '700'
        }}>
          🎯 useEffect Hook Demo
        </h1>

        {message && (
          <div style={{
            backgroundColor: '#4ade80',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '30px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {message}
          </div>
        )}

        {/* Example 1: Basic Counter */}
        {/* <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ color: '#667eea', marginBottom: '16px' }}>
            1️⃣ useEffect chạy sau mỗi lần render
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            useEffect này KHÔNG có dependency array, nên nó chạy sau MỌI lần component render.
            <br />
            <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
              useEffect(() =&gt; {'{}'})
            </code>
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#667eea',
              minWidth: '80px',
              textAlign: 'center'
            }}>
              {count}
            </div>
            <button
              onClick={() => setCount(count + 1)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Tăng Count (xem console)
            </button>
          </div>
        </div> */}

        {/* Example 2: Timer with Cleanup */}
        {/* <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ color: '#667eea', marginBottom: '16px' }}>
            2️⃣ useEffect với dependencies + Cleanup
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            useEffect này chạy khi <strong>isRunning</strong> thay đổi. Nó tạo interval và cleanup khi unmount.
            <br />
            <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
              useEffect(() =&gt; {'{ return () => {} }'}, [isRunning])
            </code>
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: isRunning ? '#10b981' : '#ef4444',
              minWidth: '100px',
              textAlign: 'center'
            }}>
              {seconds}s
            </div>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                padding: '12px 24px',
                backgroundColor: isRunning ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isRunning ? 'Stop' : 'Start'} Timer
            </button>
            <button
              onClick={() => setSeconds(0)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        </div> */}

        {/* Example 3: Window Width */}
        {/* <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ color: '#667eea', marginBottom: '16px' }}>
            3️⃣ useEffect với Event Listener
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            useEffect này chỉ chạy 1 lần khi mount (dependency array rỗng []),
            thêm event listener và cleanup khi unmount.
            <br />
            <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
              useEffect(() =&gt; {'{ return () => {} }'}, [])
            </code>
          </p>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#667eea',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px'
          }}>
            Window Width: {windowWidth}px
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              (Thử resize cửa sổ browser!)
            </div>
          </div>
        </div> */}

        {/* Example 4: Fetch Data */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ color: '#667eea', marginBottom: '16px' }}>
            4️⃣ Fetch Data với useEffect
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Sử dụng useEffect để fetch data từ API. Thường dùng với dependency array rỗng [] để fetch 1 lần khi mount.
          </p>
          <button
            onClick={fetchUser}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Loading...' : 'Fetch User Data'}
          </button>

          {user && (
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '20px',
              borderRadius: '8px',
              borderLeft: '4px solid #667eea'
            }}>
              <h3 style={{ marginBottom: '12px', color: '#333' }}>User Info:</h3>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Website:</strong> {user.website}</p>
            </div>
          )}
        </div>

        {/* Cheat Sheet */}
        {/* <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
            📝 useEffect Cheat Sheet
          </h2>
          <div style={{ color: '#333', lineHeight: '1.8' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>1. Chạy sau mỗi lần render:</strong>
              <pre style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', marginTop: '8px', overflow: 'auto' }}>
{`useEffect(() => {
  // Code chạy sau MỖI lần render
});`}
              </pre>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>2. Chỉ chạy 1 lần khi mount:</strong>
              <pre style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', marginTop: '8px', overflow: 'auto' }}>
{`useEffect(() => {
  // Code chỉ chạy 1 lần khi component mount
  return () => {
    // Cleanup khi unmount
  };
}, []);`}
              </pre>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>3. Chạy khi dependencies thay đổi:</strong>
              <pre style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', marginTop: '8px', overflow: 'auto' }}>
{`useEffect(() => {
  // Code chạy khi count thay đổi
  return () => {
    // Cleanup trước khi chạy lại effect
  };
}, [count]);`}
              </pre>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <strong>⚠️ Lưu ý quan trọng:</strong>
              <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                <li>useEffect chạy SAU khi component đã render</li>
                <li>Cleanup function chạy TRƯỚC khi component unmount hoặc trước khi effect chạy lại</li>
                <li>Luôn cleanup event listeners, timers, subscriptions để tránh memory leak</li>
                <li>Đặt đúng dependencies để tránh infinite loop</li>
              </ul>
            </div>
          </div>
        </div> */}

        {/* <div style={{
          textAlign: 'center',
          color: 'white',
          marginTop: '40px',
          fontSize: '14px'
        }}>
          💡 Mở Console (F12) để xem useEffect logs!
        </div> */}
      </div>
    </div>
  );
};

export default UseEffectDemo;
