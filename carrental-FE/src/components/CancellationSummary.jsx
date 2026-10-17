export function CancellationSummary() {
    return <ul data-cancellation-summary className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-secondary">
      <li>Chuyến đi sẽ bị hủy và chuyển vào Lịch sử.</li>
      <li>Phí hủy: <strong className="text-text-primary">0 đ</strong>.</li>
    </ul>;
}
