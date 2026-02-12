import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { sessionsApi, reportsApi } from '../api/endpoints';
import { format } from 'date-fns';
import {
    UserGroupIcon,
    ClockIcon,
    ChartBarIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
    const { user, token } = useAuthStore();
    const socket = useSocket(token);
    const [onlineUsers, setOnlineUsers] = useState(0);

    // Fetch active sessions
    const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
        queryKey: ['sessions', 'active'],
        queryFn: sessionsApi.getActive,
    });

    // Fetch today's summary
    const { data: todaySummary, isLoading: summaryLoading } = useQuery({
        queryKey: ['summary', 'today', user?.id],
        queryFn: () => reportsApi.getDaily(format(new Date(), 'yyyy-MM-dd')),
        enabled: !!user,
    });

    // Listen to WebSocket events
    useEffect(() => {
        if (!socket) return;

        socket.on('USER_ONLINE', () => {
            setOnlineUsers((prev) => prev + 1);
        });

        socket.on('USER_OFFLINE', () => {
            setOnlineUsers((prev) => Math.max(0, prev - 1));
        });

        socket.on('SESSION_UPDATE', (data) => {
            console.log('Session updated:', data);
        });

        socket.on('INACTIVE_ALERT', (data) => {
            console.log('User inactive:', data);
        });

        socket.on('OVERTIME_ALERT', (data) => {
            console.log('User overtime:', data);
        });
    }, [socket]);

    const stats = [
        {
            name: 'Online Team',
            value: onlineUsers,
            icon: UserGroupIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            name: 'Active Sessions',
            value: sessions.length,
            icon: ClockIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            name: "Today's Work",
            value: todaySummary
                ? `${Math.floor(todaySummary.total_work_seconds / 3600)}h ${Math.floor((todaySummary.total_work_seconds % 3600) / 60)}m`
                : '0h 0m',
            icon: CpuChipIcon,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            name: 'Productivity',
            value: todaySummary ? `${todaySummary.productivity_score}%` : '0%',
            icon: ChartBarIcon,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    const isLoading = sessionsLoading || summaryLoading;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome back, {user?.name}! Here's what's happening today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {isLoading ? '...' : stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Active Work Sessions
                </h2>
                {sessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        No active sessions right now
                    </p>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session: any) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">Session ID: {session.id.slice(0, 8)}...</p>
                                    <p className="text-sm text-gray-600">
                                        Started: {new Date(session.start_time).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {Math.floor(session.total_active_seconds / 60)} min active
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {Math.floor(session.total_idle_seconds / 60)} min idle
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
