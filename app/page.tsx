'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthStatus {
  status: 'ok' | 'error';
  message?: string;
  timestamp?: string;
  database?: string;
}

interface StatusState {
  loading: boolean;
  status: HealthStatus | null;
}

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState<StatusState>({ loading: true, status: null });
  const [dbStatus, setDbStatus] = useState<StatusState>({ loading: true, status: null });

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealthStatus({ loading: false, status: data });
      } catch (error) {
        setHealthStatus({ 
          loading: false, 
          status: { 
            status: 'error', 
            message: 'Failed to check health status' 
          } 
        });
      }
    }

    async function checkDbHealth() {
      try {
        const response = await fetch('/api/health/db');
        const data = await response.json();
        setDbStatus({ loading: false, status: data });
      } catch (error) {
        setDbStatus({ 
          loading: false, 
          status: { 
            status: 'error', 
            message: 'Failed to check database status' 
          } 
        });
      }
    }

    checkHealth();
    checkDbHealth();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome to CasaFusión
      </h1>
      <p className="text-lg text-center mb-8">
        Your household services management platform
      </p>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        {healthStatus.loading ? (
          <p>Checking system status...</p>
        ) : (
          <div>
            <p className="mb-2">
              API Status: <span className={
                healthStatus.status?.status === 'ok' 
                  ? 'text-green-600 font-semibold' 
                  : 'text-red-600 font-semibold'
              }>
                {healthStatus.status?.status}
              </span>
            </p>
            {healthStatus.status?.message && (
              <p className="mb-2">Message: {healthStatus.status.message}</p>
            )}
          </div>
        )}
        
        <h2 className="text-xl font-semibold mt-6 mb-4">Database Status</h2>
        {dbStatus.loading ? (
          <p>Checking database status...</p>
        ) : (
          <div>
            <p className="mb-2">
              Status: <span className={
                dbStatus.status?.status === 'ok' 
                  ? 'text-green-600 font-semibold' 
                  : 'text-red-600 font-semibold'
              }>
                {dbStatus.status?.status}
              </span>
            </p>
            {dbStatus.status?.database && (
              <p className="mb-2">Database: {dbStatus.status.database}</p>
            )}
            {dbStatus.status?.timestamp && (
              <p className="mb-2">Timestamp: {dbStatus.status.timestamp}</p>
            )}
            {dbStatus.status?.message && (
              <p className="mb-2">Message: {dbStatus.status.message}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-4">
        <Link 
          href="/auth/signin" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Log In
        </Link>
        <Link 
          href="/auth/signup" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
} 