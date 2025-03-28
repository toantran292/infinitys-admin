import { cn } from "@/lib/utils"

export enum RoleTypePage {
    MEMBER = 'MEMBER',
    OPERATOR = 'OPERATOR',
    ADMIN = 'ADMIN',
}

interface RoleBadgeProps {
    role: RoleTypePage
}

export function RoleBadge({ role }: RoleBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                {
                    "bg-blue-50 text-blue-700": role === RoleTypePage.MEMBER,
                    "bg-yellow-50 text-yellow-700": role === RoleTypePage.OPERATOR,
                    "bg-red-50 text-red-700": role === RoleTypePage.ADMIN,
                }
            )}
        >
            {role.charAt(0) + role.slice(1).toLowerCase()}
        </span>
    )
} 