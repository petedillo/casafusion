'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Household {
  id: string;
  name: string;
  description: string | null;
  members: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    isAdmin: boolean;
  }[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchHouseholds();
    }
  }, [status, router]);

  const fetchHouseholds = async () => {
    try {
      const response = await fetch('/api/households');
      if (!response.ok) {
        throw new Error('Failed to fetch households');
      }
      const data = await response.json();
      setHouseholds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHousehold = async (id: string) => {
    if (!confirm('Are you sure you want to delete this household?')) {
      return;
    }

    try {
      const response = await fetch(`/api/households/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete household');
      }

      setHouseholds(households.filter(h => h.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Households</h1>
          <Link
            href="/dashboard/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Household
          </Link>
        </div>

        {households.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No households yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating a new household.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Household
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {households.map((household) => (
              <div
                key={household.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {household.name}
                  </h3>
                  {household.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {household.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Members</h4>
                    <ul className="mt-2 space-y-1">
                      {household.members.map((member) => (
                        <li
                          key={member.user.id}
                          className="flex items-center text-sm text-gray-500"
                        >
                          <span className="mr-2">{member.user.name}</span>
                          {member.isAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="flex justify-end space-x-3">
                    <Link
                      href={`/dashboard/households/${household.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                    {household.members.some(
                      (member) =>
                        member.user.email === session?.user?.email &&
                        member.isAdmin
                    ) && (
                      <button
                        onClick={() => handleDeleteHousehold(household.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 