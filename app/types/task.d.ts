export interface Task {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    status: 'todo' | 'in_progress' | 'done';
    assignee_id: number | null;
    created_at: string;
    updated_at: string;
    assignee?: {
        id: number;
        name: string;
        email: string;
    };
}