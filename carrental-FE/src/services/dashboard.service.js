import { isApprovedCar } from "@/lib/owner/format";
import { formatVnd, sumAmounts } from "@/lib/owner/finance";
import { isOrderExpired } from "@/lib/owner/rules";
import { mockResponse, request, USE_MOCK_API } from "./http";
import { ownerDb, toOrderView, toPayoutView } from "./mock/owner-db";
function buildActivities() {
    const items = [];
    for (const rentalOrder of ownerDb.orders.filter(order => order.status === "PENDING" && !isOrderExpired(order))) {
        const car = ownerDb.cars.find(item => item.id === rentalOrder.carId);
        const renter = ownerDb.renters.find(item => item.id === rentalOrder.customerId);
        items.push({
            id: `req-${rentalOrder.id}`,
            icon: "pending_actions",
            tone: "warning",
            title: `Yêu cầu thuê mới (${car.brand} ${car.model})`,
            subtitle: renter.fullName,
            at: rentalOrder.startTime,
        });
    }
    for (const handover of ownerDb.handovers.filter(item => item.ownerConfirmedAt && item.renterConfirmedAt && item.handoverType === "RETURN")) {
        const rentalOrder = ownerDb.orders.find(item => item.id === handover.orderId);
        const car = ownerDb.cars.find(item => item.id === rentalOrder.carId);
        const renter = ownerDb.renters.find(item => item.id === rentalOrder.customerId);
        items.push({
            id: `handover-${handover.id}`,
            icon: "assignment_turned_in",
            tone: "success",
            title: `Hoàn tất biên bản bàn giao (${car.model})`,
            subtitle: renter.fullName,
            at: handover.handedAt,
        });
    }
    for (const rentalOrder of ownerDb.orders.filter(order => order.paymentStatus === "PAID")) {
        items.push({
            id: `pay-${rentalOrder.id}`,
            icon: "payments",
            tone: "payment",
            title: "Nhận thanh toán",
            highlight: formatVnd(rentalOrder.totalAmount),
            orderCode: rentalOrder.orderCode,
            at: rentalOrder.startTime,
        });
    }
    return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 6);
}
function buildManagedCars() {
    const rank = (status) => (status === "ACTIVE" ? 0 : status === "PENDING_APPROVAL" ? 1 : 2);
    return ownerDb.cars
        .slice()
        .sort((a, b) => rank(a.status) - rank(b.status))
        .slice(0, 3)
        .map(car => ({
        car,
        openSlots: ownerDb.slots.filter(slot => slot.carId === car.id && slot.status === "OPEN").length,
    }));
}
export const dashboardService = {
    async getSummary() {
        if (USE_MOCK_API) {
            const { owner, cars, orders, payouts, bankAccounts } = ownerDb;
            const held = payouts.filter(item => item.status === "PENDING" || item.status === "PROCESSING");
            const paid = payouts.filter(item => item.status === "PAID");
            const pendingRequests = orders.filter(order => order.status === "PENDING" && !isOrderExpired(order)).map(toOrderView);
            return mockResponse({
                owner,
                activeCars: cars.filter(car => car.status === "ACTIVE").length,
                approvedCars: cars.filter(car => isApprovedCar(car.status)).length,
                totalCars: cars.length,
                pendingOrders: pendingRequests.length,
                ongoingTrips: orders.filter(order => order.status === "ONGOING").length,
                recognizedGross: sumAmounts(payouts, item => item.grossAmount),
                escrowNet: sumAmounts(held, item => item.netAmount),
                paidNet: sumAmounts(paid, item => item.netAmount),
                defaultBankAccount: bankAccounts.find(account => account.isDefault),
                pendingRequests,
                managedCars: buildManagedCars(),
                activities: buildActivities(),
                recentPayouts: payouts.map(toPayoutView).sort((a, b) => Date.parse(b.order.startTime) - Date.parse(a.order.startTime)).slice(0, 5),
            });
        }
        return request("/api/owner/dashboard");
    },
};
