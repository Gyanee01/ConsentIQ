import React from 'react';

export default function Settings() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <h1>My Web App</h1>
      <p>Welcome! Start building your application here.</p>
      <button onClick={() => alert('Hello from your web app!')}>Click Me</button>
    </div>
  );
}
