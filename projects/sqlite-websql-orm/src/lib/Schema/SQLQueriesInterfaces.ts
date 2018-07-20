export interface SelectOption {
    conditions: Array<string>;
    fields?: string;
    limit?: string;
    order?: string;
}

export interface UpdateOption {
    id?: number;
    affectations: Array<string>;
    conditions?: Array<string>;
}

export interface DeleteOption {
    id?: number;
    conditions?: Array<string>;
}
