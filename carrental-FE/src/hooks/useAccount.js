import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { bankAccountService, getMyProfile, getMyKyc, userDocumentService } from "@/services/accountService.js";
import { readSession, updateSessionAccount } from "@/utils/session.js";

export function useProfile() {
    const load = useCallback(async () => {
        const [profile, kyc] = await Promise.all([getMyProfile(), getMyKyc().catch(() => null)]);
        const current = readSession();
        if (profile && current?.account?.id === profile.id) {
            if (profile.avatarUrl !== current.account.avatarUrl || profile.fullName !== current.account.fullName) {
                updateSessionAccount({
                    fullName: profile.fullName ?? current.account.fullName,
                    avatarUrl: profile.avatarUrl ?? null,
                });
            }
        }
        return { profile, kyc };
    }, []);
    const detail = useApiQuery(["account", "profile"], load);
    return detail;
}

export function useBankAccounts() {
    const load = useCallback(() => bankAccountService.list(), []);
    const list = useApiQuery(["account", "banks"], load);
    return list;
}

export function useDocuments() {
    const load = useCallback(() => userDocumentService.listMine(), []);
    const list = useApiQuery(["account", "documents"], load);
    return list;
}

export function useMyKyc() {
    const load = useCallback(() => getMyKyc(), []);
    return useApiQuery(["account", "kyc"], load);
}
