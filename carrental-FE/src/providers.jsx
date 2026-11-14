import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthProvider.jsx";
import { NoticeProvider } from "@/context/NoticeProvider.jsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: false,
            refetchOnWindowFocus: false,
            networkMode: "always",
        },
        mutations: { retry: false, networkMode: "always" },
    },
});

export function AppProviders({ children }) {
    return <QueryClientProvider client={queryClient}><NoticeProvider><AuthProvider>{children}</AuthProvider></NoticeProvider></QueryClientProvider>;
}
