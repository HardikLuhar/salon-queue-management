import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueueProvider } from './context/QueueContext';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import JoinScreen from './screens/JoinScreen';
import StatusScreen from './screens/StatusScreen';
import ReceptionScreen from './screens/ReceptionScreen';
import BarberScreen from './screens/BarberScreen';
import DisplayScreen from './screens/DisplayScreen';
import AdminScreen from './screens/AdminScreen';

export default function App() {
  return (
    <QueueProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans selection:bg-black selection:text-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/join" element={<JoinScreen />} />
              <Route path="/status/:id" element={<StatusScreen />} />
              <Route path="/reception" element={<ReceptionScreen />} />
              <Route path="/barber/:name" element={<BarberScreen />} />
              <Route path="/display" element={<DisplayScreen />} />
              <Route path="/admin" element={<AdminScreen />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueueProvider>
  );
}
