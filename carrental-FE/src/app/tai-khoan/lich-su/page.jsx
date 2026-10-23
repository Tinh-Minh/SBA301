import MyRentals from "@/views/live/MyRentals";

export const metadata = { title: "Lịch sử chuyến đi" };

export default function Page() {
    return <MyRentals mode="history" />;
}
