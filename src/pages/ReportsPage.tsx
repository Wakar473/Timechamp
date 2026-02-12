import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/endpoints';
import { useAuthStore } from '../store/authStore';
import { format, subDays } from 'date-fns';

export default function ReportsPage() {
    const { user } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const { data: dailyReport, isLoading: dailyLoading } = useQuery({
        queryKey: ['report', 'daily', selectedDate],
        queryFn: () => reportsApi.getDaily(selectedDate),
    });

    const { data: userReport, isLoading: userLoading } = useQuery({
        queryKey: ['report', 'user', user?.id, startDate, endDate],
        queryFn: () => reportsApi.getUserReport(user!.id, startDate, endDate),
        enabled: !!user,
    });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Report */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Daily Summary</h2>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    {dailyLoading ? (
                        <p>Loading...</p>
                    ) : dailyReport ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Work Time:</span>
                                <span className="font-semibold">
                                    {Math.floor(dailyReport.total_work_seconds / 3600)}h{' '}
                                    {Math.floor((dailyReport.total_work_seconds % 3600) / 60)}m
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Time:</span>
                                <span className="font-semibold text-green-600">
                                    {Math.floor(dailyReport.active_seconds / 3600)}h{' '}
                                    {Math.floor((dailyReport.active_seconds % 3600) / 60)}m
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Idle Time:</span>
                                <span className="font-semibold text-orange-600">
                                    {Math.floor(dailyReport.idle_seconds / 3600)}h{' '}
                                    {Math.floor((dailyReport.idle_seconds % 3600) / 60)}m
                                </span>
                            </div>
                            <div className="flex justify-between pt-3 border-t">
                                <span className="text-gray-600">Productivity Score:</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    {dailyReport.productivity_score}%
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No data for this date</p>
                    )}
                </div>

                {/* User Report */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Period Summary</h2>
                    <div className="flex gap-3 mb-4">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    {userLoading ? (
                        <p>Loading...</p>
                    ) : userReport ? (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Days Worked:</span>
                                <span className="font-semibold">{userReport.days_worked}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Work Time:</span>
                                <span className="font-semibold">
                                    {Math.floor(userReport.total_work_seconds / 3600)}h{' '}
                                    {Math.floor((userReport.total_work_seconds % 3600) / 60)}m
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Avg. Productivity:</span>
                                <span className="text-2xl font-bold text-primary-600">
                                    {userReport.average_productivity_score}%
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No data for this period</p>
                    )}
                </div>
            </div>
        </div>
    );
}
