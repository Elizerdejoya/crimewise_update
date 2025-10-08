# Organization-Based Access Control

## Overview

This system implements multi-tenant organization-based access control where data is segregated by organization. Each organization can only access and manage their own data.

## Database Schema

### Organization Structure

- `organizations` - Contains organization information
- `subscriptions` - Contains subscription plans for organizations
- All major entities have an `organization_id` field that links them to their respective organization

### Entity Organization Mapping

- `users` - Linked to organization via `organization_id`
- `batches` - Linked to organization via `organization_id`
- `classes` - Linked to organization via `organization_id`
- `courses` - Linked to organization via `organization_id`
- `questions` - Linked to organization via `organization_id`
- `exams` - Linked to organization via `organization_id`

## Access Control Rules

### Role-Based Access

#### Super Admin (`super_admin`)

- Can access all organizations and all data
- No organization filtering applied
- Full system access

#### Organization Admin (`admin`)

- Can only access data from their own organization
- Can create, read, update, and delete:
  - Users (instructors, students) within their organization
  - Batches within their organization
  - Classes within their organization
  - Courses within their organization
  - Questions created by instructors in their organization
  - Relations between entities in their organization
- Cannot access data from other organizations
- Cannot edit/delete other admins (except themselves)
- Cannot edit/delete super admins

#### Instructors (`instructor`)

- Can only access data from their own organization
- Limited access based on their assignments
- Can view questions they created

#### Students (`student`)

- Can only access data from their own organization
- Limited to their assigned classes and courses

## Backend Implementation

### Middleware

- `authenticateToken` - Validates JWT tokens
- `requireRole` - Enforces role-based access
- `addOrganizationFilter` - Adds organization filtering helper to requests
- `getOrganizationFilter` - Returns filter conditions based on user's organization

### API Routes

All API routes now include:

1. Authentication check (`authenticateToken`)
2. Role-based authorization (`requireRole`)
3. Organization filtering (`addOrganizationFilter`)

### Organization Filtering Logic

```javascript
const orgFilter = req.getOrgFilter();

if (orgFilter.hasFilter) {
  // Apply organization filter
  rows =
    await db.sql`SELECT * FROM table WHERE organization_id = ${orgFilter.organizationId}`;
} else {
  // Super admin - no filter
  rows = await db.sql`SELECT * FROM table`;
}
```

## Frontend Implementation

### Authentication Headers

All API requests include proper authentication headers:

```javascript
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
```

### User Context

Frontend components extract user information from JWT tokens to determine:

- User's role
- User's organization
- What data they can access/modify

### Access Control in UI

- Organization admins only see data from their organization
- Edit/delete permissions are enforced based on organization membership
- UI elements are conditionally displayed based on user permissions

## Security Features

### Data Isolation

- Complete data segregation by organization
- No cross-organization data access
- Relations only possible within the same organization

### Validation

- Backend validates organization membership before allowing operations
- Frontend validates permissions before showing UI elements
- Database constraints ensure data integrity

### Authentication

- JWT-based authentication with role and organization information
- Token validation on every API request
- Proper error handling for authentication failures

## Usage Examples

### Creating a New User

When an organization admin creates a new user:

1. The system automatically assigns the user to the admin's organization
2. The user can only access data within that organization
3. The user cannot see or interact with users from other organizations

### Managing Relations

When creating relations (e.g., class-instructor):

1. System verifies both entities belong to the same organization
2. Only allows relations within the organization boundary
3. Prevents cross-organization data leakage

### Question Bank

- Instructors can only see questions from their organization
- Questions are automatically tagged with the creator's organization
- Admins can see all questions from their organization
- Super admins can see all questions from all organizations

## Migration Notes

The database migration script (`migrate.js`) includes:

- Organization table creation
- Addition of `organization_id` fields to all relevant tables
- Proper foreign key relationships
- Default values and constraints

## Best Practices

1. Always use the organization filter middleware in API routes
2. Include authentication headers in all frontend API calls
3. Validate user permissions before displaying UI elements
4. Handle authentication errors gracefully
5. Never bypass organization filtering except for super admins
6. Regularly audit access logs for security compliance
