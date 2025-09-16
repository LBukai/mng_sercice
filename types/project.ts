export interface Project {
    id?: string;
    name: string;
    workspacecountLimit?: number;
    usercountLimit?: number;
    costCenter?: string;
    projectNumber?: string;
    is_archgpt?: boolean;
}