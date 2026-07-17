export type UserRole = 'user' | 'moderator' | 'administrator';

export type User = {
    id: number;
    name: string;
    username: string | null;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    interests: string[] | null;
    role: UserRole;
    terms_accepted_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type ActiveSession = {
    id: string;
    ip_address: string | null;
    user_agent: string | null;
    is_current: boolean;
    last_active_at: string;
    last_active_human: string;
};

export type Auth = {
    user: User | null;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
