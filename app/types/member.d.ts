import type { User } from './user'

export interface WorkspaceMember extends User {
    pivot: {
        workspace_id: number;
        user_id: number;
        role: 'owner' | 'admin' | 'member';
    }
}