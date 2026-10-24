import { isApprovedCar, formatVnd, sumAmounts, isOrderExpired } from "@/shared/utils/owner.js";

import { readSession } from "@/shared/storage/session.js";
import { fetchAllPages } from "./http";
import { normalizePayout } from "./adapters";
import { bankAccountService } from "./bank-account.service";
import { carService } from "./car.service";
import { toOwnerViews } from "./order.service";
import { toPayoutRows } from "./payout.service";
import { slotService } from "./slot.service";

function buildActivities(views) {
    const items = [];
    for (const { order, car } of views) {
        const name = `${car.brand} ${car.model}`.trim();
        if (order.status === "PENDING" && !isOrderExpired(order))
            items.push({ id: `req-${order.id}`, icon: "pending_actions", tone: "warning", title: `Yêu cầu thuê mới (${name})`, subtitle: order.customerName, at: order.createdAt ?? order.startTime });
        if (order.paymentStatus === "PAID")
            items.push({ id: `pay-${order.id}`, icon: "payments", tone: "payment", title: "Nhận thanh toán", highlight: formatVnd(order.totalAmount), orderCode: order.orderCode, at: order.updatedAt ?? order.startTime });
        if (order.status === "COMPLETED")
            items.push({ id: `done-${order.id}`, icon: "assignment_turned_in", tone: "success", title: `Hoàn tất chuyến (${car.model})`, subtitle: order.customerName, at: order.actualEndTime ?? order.endTime });
    }
    return items.filter(item => item.at).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 6);
}

export const dashboardService = {
    async getSummary() {
        const session = readSession();
        const [cars, orders, payouts, defaultBankAccount] = await Promise.all([
            carService.listMine(),
            fetchAllPages("/api/orders/my-cars", { sortBy: "createdAt", direction: "desc" }),
            session ? fetchAllPages("/api/payouts", { recipientId: session.account.id, sort: "id,desc" }).then(list => list.map(normalizePayout)).catch(() => []) : [],
            bankAccountService.getDefault().catch(() => null),
        ]);
        const views = await toOwnerViews(orders);
        const pendingRequests = views.filter(view => view.order.status === "PENDING" && !isOrderExpired(view.order));
        const held = payouts.filter(item => item.status === "PENDING" || item.status === "PROCESSING");
        const paid = payouts.filter(item => item.status === "PAID");
        const rank = (status) => (status === "ACTIVE" ? 0 : status === "PENDING_APPROVAL" ? 1 : 2);
        const featured = cars.slice().sort((a, b) => rank(a.status) - rank(b.status)).slice(0, 3);
        const managedCars = await Promise.all(featured.map(async car => ({
            car,
            openSlots: (await slotService.listByCar(car.id).catch(() => [])).filter(slot => slot.status === "OPEN").length,
        })));
        return {
            owner: { id: session?.account.id, fullName: session?.account.fullName ?? "Chủ xe" },
            activeCars: cars.filter(car => car.status === "ACTIVE").length,
            approvedCars: cars.filter(car => isApprovedCar(car.status)).length,
            totalCars: cars.length,
            pendingOrders: pendingRequests.length,
            ongoingTrips: views.filter(view => view.order.status === "ONGOING").length,
            recognizedGross: sumAmounts(payouts, item => item.grossAmount),
            escrowNet: sumAmounts(held, item => item.netAmount),
            paidNet: sumAmounts(paid, item => item.netAmount),
            defaultBankAccount,
            pendingRequests,
            managedCars,
            activities: buildActivities(views),
            recentPayouts: await toPayoutRows(payouts.slice(0, 5)),
        };
    },
};
