// Frontend/src/components/debug/AuthDebugger.jsx
import React from 'react';
import { authStorage } from '../../api/apiClient';

const AuthDebugger = () => {
  const checkAllAuth = () => {
    console.log('🔍 AUTH DEBUGGER - Checking all storage:');
    
    // Check localStorage
    console.log('\n📦 localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`   ${key}:`, value ? `${value.substring(0, 50)}...` : 'null');
    }
    
    // Check sessionStorage
    console.log('\n📋 sessionStorage:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      console.log(`   ${key}:`, value ? `${value.substring(0, 50)}...` : 'null');
    }
    
    // Check authStorage for each type
    console.log('\n🔐 authStorage.getAuth():');
    ['admin', 'pandit', 'user'].forEach(type => {
      const auth = authStorage.getAuth(type);
      
    });
  };

  const clearAll = () => {
    authStorage.clearAllAuth();
    console.log('✅ All auth cleared');
    checkAllAuth();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      zIndex: 9999
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔧 Auth Debugger</h4>
      <button 
        onClick={checkAllAuth}
        style={{ marginRight: '5px', padding: '5px 10px' }}
      >
        Check Auth
      </button>
      <button 
        onClick={clearAll}
        style={{ padding: '5px 10px', background: '#ff4444', color: 'white' }}
      >
        Clear All
      </button>
    </div>
  );
};

export default AuthDebugger;