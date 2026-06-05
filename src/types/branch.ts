export interface PincodeRange {
    id?: string; // Optional for creation
    pincode_from: string;
    pincode_to: string;
}

export interface Branch {
    id: string;
    branch_code: string;
    branch_name: string;
    address: string;
    contact_person: string | null;
    contact_mobile: string | null;
    contact_email: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
    employee_count?: number;
    machine_count?: number;
    open_ticket_count?: number;
    stock_item_count?: number;
    pincode_ranges: PincodeRange[];
}

export interface BranchDependencies {
    employees: number;
    machines: number;
    open_tickets: number;
    stock_items: number;
    zones: number;
}

export interface BranchDependencyResponse {
    branch_id: string;
    branch_name: string;
    can_delete: boolean;
    dependencies: BranchDependencies;
}

export interface PaginatedBranchResponse {
    data: Branch[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface BranchFilters {
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
    sort_by?: 'branch_name' | 'created_at' | 'employee_count';
    sort_dir?: 'ASC' | 'DESC';
    page: number;
    limit: number;
}
