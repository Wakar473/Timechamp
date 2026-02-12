import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    HomeIcon,
    UsersIcon,
    FolderIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Layout() {
    const { user, logout } = useAuthStore();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: HomeIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
        { name: 'Projects', href: '/projects', icon: FolderIcon },
        { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-primary-600">WorkPulse</h1>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            end={item.href === '/'}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="ml-2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            title="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
}
