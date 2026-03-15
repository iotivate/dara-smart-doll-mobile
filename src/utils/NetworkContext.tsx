import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from 'react';
import NetInfo from '@react-native-community/netinfo';

type RetryCallback = () => void | Promise<void>;

type NetworkContextType = {
  isConnected: boolean | null;
  registerRetryCallback: (cb: RetryCallback) => void;
  unregisterRetryCallback: (cb: RetryCallback) => void;
};

const NetworkContext = createContext<NetworkContextType>({
  isConnected: null,
  registerRetryCallback: () => {},
  unregisterRetryCallback: () => {},
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const retryCallbacks = useRef<RetryCallback[]>([]);

  // Fetch and subscribe to connection changes
  useEffect(() => {
    const fetchStatus = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
    };
    fetchStatus();

    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isConnected === false;
      const nowOnline = state.isConnected;

      setIsConnected(nowOnline);

      // 🔁 When we come back online, retry all registered callbacks
      if (wasOffline && nowOnline) {
        retryCallbacks.current.forEach(cb => cb());
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  const registerRetryCallback = (cb: RetryCallback) => {
    if (!retryCallbacks.current.includes(cb)) {
      retryCallbacks.current.push(cb);
    }
  };

  const unregisterRetryCallback = (cb: RetryCallback) => {
    retryCallbacks.current = retryCallbacks.current.filter(fn => fn !== cb);
  };

  return (
    <NetworkContext.Provider
      value={{ isConnected, registerRetryCallback, unregisterRetryCallback }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
