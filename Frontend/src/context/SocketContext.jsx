// frontend/src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { authStorage } from '../api/apiClient';
import API_CONFIG from '../config';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const { token, data } = authStorage.getAuth('pandit');

    if (token && data) {
      const serverUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');
      
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        auth: { token },
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        setIsConnected(true);

        newSocket.emit('register', {
          userId: data.id,
          role: 'pandit'
        });
      });

      newSocket.on('connect_error', (error) => {
        console.log('⚠️ Socket connection error:', error.message);
        setIsConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔴 Socket disconnected:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        
        if (data?.id) {
          newSocket.emit('register', {
            userId: data.id,
            role: 'pandit'
          });
        }
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// ✅ Export both
export { SocketContext };
export default SocketProvider;