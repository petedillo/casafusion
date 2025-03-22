'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Household {
  id: string;
  name: string;
  description: string | null;
  members: Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    isAdmin: boolean;
  }>;
  joinRequests: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export default function HouseholdDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [household, setHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const fetchHousehold = useCallback(async () => {
    try {
      const response = await fetch(`/api/households/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch household');
      }
      const data = await response.json();
      setHousehold(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchHousehold();
    }
  }, [status, router, fetchHousehold]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError('');

    try {
      const response = await fetch(`/api/households/${params.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invitation');
      }

      setInviteEmail('');
      fetchHousehold(); // Refresh the household data to show the new join request
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsInviting(false);
    }
  };

  const handleJoinRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/households/${params.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} join request`);
      }

      fetchHousehold(); // Refresh the household data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (!household) {
    return <div>Household not found</div>;
  }

  // Check if user is a member of the household
  const isMember = household.members.some(
    member => member.user.email === session?.user?.email
  );

  if (!isMember) {
    return <div>You are not a member of this household</div>;
  }

  // Check if user is an admin
  const isAdmin = household.members.some(
    member => member.user.email === session?.user?.email && member.isAdmin
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{household.name}</h1>
        {isAdmin && (
          <Link
            href={`/dashboard/households/${params.id}/edit`}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Household
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Description</h2>
        <p className="text-gray-600">
          {household.description || 'No description provided'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Members</h2>
        <ul className="space-y-2">
          {household.members.map(member => (
            <li key={member.id} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{member.user.name || member.user.email}</span>
                {member.isAdmin && (
                  <span className="ml-2 text-sm text-indigo-600">(Admin)</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Invite New Member</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {inviteError && (
              <div className="text-red-600 text-sm">{inviteError}</div>
            )}
            <button
              type="submit"
              disabled={isInviting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isInviting ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      )}

      {isAdmin && household.joinRequests.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Pending Join Requests</h2>
          <ul className="space-y-4">
            {household.joinRequests.map(request => (
              <li key={request.id} className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{request.user.name || request.user.email}</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleJoinRequest(request.id, 'accept')}
                    className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleJoinRequest(request.id, 'decline')}
                    className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 