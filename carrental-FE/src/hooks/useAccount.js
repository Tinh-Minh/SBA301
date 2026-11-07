import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { bankAccountService, getMyProfile, getMyKyc, driverService, userDocumentService } from "@/services/accountService.js";

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

export function useDriverProfile() {
    const load = useCallback(async () => {
        const [driver, eligibility] = await Promise.all([driverService.me(), driverService.eligibility().catch(() => null)]);
        return { driver, eligibility };
    }, []);
    const detail = useApiQuery(["account", "driver"], load);
    return detail;
}

export function useDocuments() {
    const load = useCallback(() => userDocumentService.listMine(), []);
    const list = useApiQuery(["account", "documents"], load);
    return list;
}
