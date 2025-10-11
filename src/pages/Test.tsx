import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Test = () => {

  const params = useParams();
  console.log('params', params);
  useEffect(() => {
    setName('Trainer 2')
    console.log('generate UI 2')
  }, []);
  // const [formData, setFormData] = useState({
  //   name: 'Trainer',
  //   password: '',
  //   sex: ''
  // });
  const [name, setName] = useState('Trainer');
  // const [password, setPassword] = useState('');
  // const [sex, setSex] = useState('');

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   console.log(name, value);
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };
  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e)
    setName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  const handleClickForm = () => {
    console.log('Click form');
  };

  console.log('generate UI 1')
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600'
        }}>
          User Registration
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="name" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#555',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              // value={formData.name}
              value={name}
              onChange={(e) => onChangeName(e)}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '12px 16px',
                boxSizing: 'border-box',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#555',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              // value={formData.password}
              // onChange={handleChange}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                boxSizing: 'border-box',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="sex" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#555',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Gender
            </label>
            <select
              id="sex"
              name="sex"
              // value={formData.sex}
              // onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                boxSizing: 'border-box',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.3s ease',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            // onMouseOver={(e) => {
            //   e.currentTarget.style.transform = 'translateY(-2px)';
            //   e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            // }}
            // onMouseOut={(e) => {
            //   e.currentTarget.style.transform = 'translateY(0)';
            //   e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            // }}
            onClick={handleClickForm()}
          >
            Register Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Test;
