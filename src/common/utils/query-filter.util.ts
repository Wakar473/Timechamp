import { SelectQueryBuilder } from 'typeorm';
import { UserRole } from '../enums';

/**
 * Utility functions for applying role-based filters to database queries
 */

/**
 * Apply organization filter to a query
 */
export function applyOrganizationFilter<T>(
    query: SelectQueryBuilder<T>,
    alias: string,
    organizationId: string,
): SelectQueryBuilder<T> {
    return query.andWhere(`${alias}.organization_id = :organizationId`, { organizationId });
}

/**
 * Apply team filter for managers
 * Filters users to only those managed by the specified manager
 */
export function applyTeamFilter<T>(
    query: SelectQueryBuilder<T>,
    alias: string,
    managerId: string,
): SelectQueryBuilder<T> {
    return query.andWhere(`${alias}.manager_id = :managerId`, { managerId });
}

/**
 * Apply user-specific filter for employees
 */
export function applyUserFilter<T>(
    query: SelectQueryBuilder<T>,
    alias: string,
    userId: string,
): SelectQueryBuilder<T> {
    return query.andWhere(`${alias}.user_id = :userId`, { userId });
}

/**
 * Apply role-based filtering to a query
 * This is a convenience function that applies the appropriate filter based on user role
 */
export function applyRoleBasedFilter<T>(
    query: SelectQueryBuilder<T>,
    alias: string,
    userId: string,
    userRole: UserRole,
    organizationId: string,
): SelectQueryBuilder<T> {
    // Always apply organization filter
    query = applyOrganizationFilter(query, alias, organizationId);

    // Apply additional filters based on role
    switch (userRole) {
        case UserRole.ADMIN:
            // Admins see everything in their organization (no additional filter)
            break;
        case UserRole.MANAGER:
            // Managers see only their team
            query = applyTeamFilter(query, alias, userId);
            break;
        case UserRole.EMPLOYEE:
            // Employees see only their own data
            query = applyUserFilter(query, alias, userId);
            break;
    }

    return query;
}
