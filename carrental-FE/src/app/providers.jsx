import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/shared/context/AuthProvider.jsx";
import { QueryClient } from "@tanstack/react-query";

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
    return <QueryClientProvider client={queryClient}><AuthProvider>{children}</AuthProvider></QueryClientProvider>;
}
