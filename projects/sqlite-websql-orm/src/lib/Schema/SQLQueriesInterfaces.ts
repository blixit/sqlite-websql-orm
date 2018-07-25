export interface SwoTransaction {
    transactionObject?: any;
}

export interface InsertOption extends SwoTransaction {
    hash?: string;
}

export interface SelectOption extends SwoTransaction {
    conditions?: Array<string>;
    fields?: string;
    limit?: string;
    order?: string;
}

export interface UpdateOption extends SwoTransaction {
    id?: number;
    affectations: Array<string>;
    conditions?: Array<string>;
}

export interface DeleteOption extends SwoTransaction {
    id?: number;
    conditions?: Array<string>;
}
