export interface Workspace {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    pivot?: {
        role: 'owner' | 'admin' | 'member'
    }
}