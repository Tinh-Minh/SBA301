import { parseDate } from "@/utils/datetime.js";
import { readSession } from "@/utils/session.js";
import { carService } from "@/services/vehicleService.js";
import { subscriptionService } from "@/services/subscriptionService.js";
import { transactionService } from "@/services/paymentService.js";

const money = (value) => Number(value) || 0;

export const dashboardService = {
    async getSummary() {
        const session = readSession();
        const [cars, subscriptions, transactions] = await Promise.all([
            carService.listMine(),
            subscriptionService.listMine().catch(() => []),
            transactionService.listRecent().catch(() => []),
        ]);
        const activeListings = subscriptions.filter(item => item.status === "ACTIVE");
        const pendingPayments = subscriptions.filter(item => item.status === "PENDING_PAYMENT");
        const paid = transactions.filter(item => item.status === "SUCCESS");
        const activities = [
            ...subscriptions.map(item => ({ id: `sub-${item.id}`, at: item.createdAt, title: `${item.packageName} • ${item.carName}`, subtitle: item.subscriptionCode })),
            ...transactions.map(item => ({ id: `tx-${item.id}`, at: item.createdAt, title: `Giao dịch ${item.packageName ?? ""}`.trim(), subtitle: item.subscriptionCode })),
        ].filter(item => item.at).sort((a, b) => (parseDate(b.at)?.getTime() ?? 0) - (parseDate(a.at)?.getTime() ?? 0)).slice(0, 6);
        return {
            ownerName: session?.account.fullName ?? "Chủ xe",
            totalCars: cars.length,
            approvedCars: cars.filter(car => car.status === "ACTIVE").length,
            listedCars: cars.filter(car => car.listingStatus === "LISTED").length,
            activeListings: activeListings.length,
            pendingPayments: pendingPayments.length,
            paidTotal: paid.reduce((sum, item) => sum + money(item.amount), 0),
            pendingPaymentsList: pendingPayments.slice(0, 5),
            cars: cars.slice(0, 4),
            activities,
        };
    },
};
