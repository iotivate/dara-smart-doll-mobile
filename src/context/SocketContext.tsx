import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '@services/ApiConstants';
import { getData } from '@utils/CustomAsyncStorage';
import { useDispatch } from 'react-redux';
import { showSocketContent } from '@redux/dataSlice';

const SocketContext = createContext<any>(null);

export const SocketProvider = ({ children }: any) => {
  const socketRef = useRef<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const initSocket = async () => {
      const token = await getData('token');
      if (!token) return;

      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token: `Bearer ${token}` },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 5000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('🌐 GLOBAL SOCKET CONNECTED', socket.id);

        socket.emit('notification_connected');
      });

      socket.on('disconnect', () => {
        console.log('❌ GLOBAL SOCKET DISCONNECTED');
      });

      // socket.on('notification_connected', data => {
      //   console.log('🔔 NOTIFICATION CONNECTED ACK', data);
      //   if (data.event === 'SCHEDULED_SESSION_STARTED') {
      //     navigation.navigate('CartoonVideoScreen', {
      //       contentId: data.contentId,
      //     });
      //   }
      // });
      socket.on('notification_custom', ({ event, data }) => {
        if (event === 'SCHEDULED_SESSION_STARTED') {
          dispatch(showSocketContent(data.contentId));
        }
      });

      // 🔔 GLOBAL EVENTS (Dashboard level)
      socket.on('ticket-message', data => {
        console.log('🔔 Ticket message received', data);
      });

      socket.on('notification_custom', ({ event, data }) => {
        console.log('event, data', event, data);
      });
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
