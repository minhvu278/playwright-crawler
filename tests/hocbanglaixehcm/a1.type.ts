export type A1Answer = {
    id: number;
    isCorrect: boolean;
    content: string;
}

export type A1Record = {
    question?: string | null;
    isImportant?: boolean;
    image?: string;
    answers?: A1Answer[];
    explain?: string | null;
}