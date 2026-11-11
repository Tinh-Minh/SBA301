import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { bankAccountService, getMyProfile, getMyKyc, userDocumentService } from "@/services/accountService.js";

export function useProfile() {
    const load = useCallback(async () => {
        const [profile, kyc] = await Promise.all([getMyProfile(), getMyKyc().catch(() => null)]);
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
    const load = useCallback(() => getMyKyc().catch(() => null), []);
    return useApiQuery(["account", "kyc"], load);
}
