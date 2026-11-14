# Góp ý mentor — bản trích tham khảo

Nguồn: người dùng trích lại trong chat ngày 2026-10-13 và nói rõ **“chỉ để tham khảo”**. Giữ cách viết trong bản trích; không sửa lỗi chính tả/thuật ngữ ngay trong lời dẫn để tránh nhầm với diễn giải.

> ProviderProductService đặt tên bị dư thừa. Phần quyền: 1 đơn hàng order sẽ đc lấy admin/staff/owner chỉ có tui mới lấy đơn hàng của chính tui ( sử dụng #list anotation ).
>
> Toàn bộ role nằm trong 1 controller.
>
> Đặt tên imp k cần services
>
> Đặt tên phải có nghĩa
>
> K fix cứmg các số trong code vd: set.list(2,4,6)
>
> K buider. ở services
>
> Trong dto tách request vs response
>
> Bắt buộc có createAt vs updateAt
>
> Trong enum nên giải thích chuyển trạng thái trong service phải có switch case
>
> Phải có enum status
>
> Chỉ có orderService k có orderItemService
>
> Có @Traditional
>
> Tất cả phải có try catch finally, trong catch phải có log.
>
> Service thông qua interface
>
> Account truyền theo form
>
> Role phải thêm động
>
> Ghi log phải có throw new exception vs function

Cách hiểu và quyết định áp dụng từng ý được tách riêng tại [quy ước đã đối chiếu](../05_BACKEND_CONVENTIONS.md). Phạm vi triển khai mới nhất vẫn chỉ là Function 1 của người dùng.
