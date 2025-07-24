import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { EntryRoomPage } from './pages/EntryRoomPage';
import { ChatRoomPage } from './pages/ChatRoomPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { useEffect, useState } from 'react';
import { socket } from './websocket';

interface ProtectedRouteProps {
  redirectPath: string;
}

export function ProtectedRoute({ redirectPath = '' }: ProtectedRouteProps) {
  const user = useSelector((state: RootState) => state.user);
  if (!(user.email && user.room)) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />;
}

function App() {
  const [connectionError, setConnectionError] = useState(false);

  const retryConnection = () => {
    socket.connect();
  };

  useEffect(() => {
    socket.on('connect_error', () => {
      console.warn('Socket connect error');
      setConnectionError(true);
    });

    socket.on('disconnect', () => {
      console.warn('Socket disconnected');
      setConnectionError(true);
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setConnectionError(false);
    });

    return () => {
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('connect');
    };
  }, []);

  return (
    <div>
      {/* Error Banner */}
      {connectionError && (
        <div
          className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md shadow-md flex justify-between items-center"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm">
            ⚠️ Connection lost. Please check your network or click Retry.
          </p>
          <button
            onClick={retryConnection}
            className="ml-4 bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Routes */}
      <BrowserRouter>
        <Routes>
          <Route path="" element={<EntryRoomPage />} />
          <Route element={<ProtectedRoute redirectPath="" />}>
            <Route path="room" element={<ChatRoomPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
