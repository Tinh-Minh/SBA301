# Quy ước code Backend – SBA301 Car Rental

Tài liệu này thống nhất cách viết code cho `carrental-BE` để cả nhóm viết giống nhau, dễ đọc và dễ review. Mọi thành viên đọc xong và làm theo trước khi viết code mới.

Stack: Spring Boot 4.0.8, Java 21, Maven, PostgreSQL (Supabase), Lombok.

---

## 1. Cấu trúc package

```
com.carrental
├── config        (Security, CORS, Swagger)
├── controller
├── service       (+ service/impl nếu dùng interface)
├── repository
├── entity        (+ BaseEntity)
├── dto
│   ├── request
│   └── response  (+ ApiResponse, PageResponse)
├── enums         (RentalType, BookingStatus, Role, ...)
└── exception     (AppException, GlobalExceptionHandler)
```

---

## 2. Gom phần chung, không viết lặp

Những thứ dùng ở nhiều nơi phải viết **một lần** rồi tái sử dụng:

- `BaseEntity`: chứa `id`, `createdAt`, `updatedAt`. Mọi entity kế thừa.
- `ApiResponse<T>`: bọc kết quả trả về cho mọi API (success, message, data).
- `PageResponse<T>`: bọc kết quả phân trang.
- `AppException` và `GlobalExceptionHandler`: xử lý lỗi một chỗ duy nhất.
- Không copy-paste đoạn kiểm tra giống nhau giữa các service, tách thành hàm dùng chung (ví dụ `findCarOrThrow(id)`).

```java
@MappedSuperclass
@Getter @Setter
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

```java
@Getter @Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder().success(true).message("OK").data(data).build();
    }
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder().success(false).message(message).build();
    }
}
```

---

## 3. Phân trang (page load)

Mọi API trả về danh sách **bắt buộc có phân trang**, không trả toàn bộ bảng.

- Controller nhận `page` (bắt đầu từ 0), `size`, `sort` qua `Pageable` hoặc `@RequestParam`.
- Repository trả `Page<Entity>`.
- Service đổi sang `PageResponse<Response>` rồi trả về.

```java
@Getter @Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public static <T> PageResponse<T> from(Page<T> p) {
        return PageResponse.<T>builder()
                .content(p.getContent())
                .page(p.getNumber())
                .size(p.getSize())
                .totalElements(p.getTotalElements())
                .totalPages(p.getTotalPages())
                .build();
    }
}
```

Dùng: `PageResponse.from(carRepository.findAll(pageable).map(CarResponse::from))`.

---

## 4. Enum cho mọi status và kiểm tra chuyển trạng thái

- **Mọi trạng thái đều là enum**, không dùng String hay số trực tiếp. Lưu DB bằng `@Enumerated(EnumType.STRING)`.
- Logic cho phép chuyển trạng thái nào sang trạng thái nào nằm **ngay trong enum** (dùng if else). Service chỉ gọi `validateTransitionTo(...)` **trước khi** làm bước tiếp theo.
- Không được gán thẳng `setStatus(...)` mà bỏ qua bước kiểm tra.

```java
public enum BookingStatus {
    PENDING, CONFIRMED, ONGOING, COMPLETED, CANCELLED;

    public boolean canTransitionTo(BookingStatus next) {
        if (this == PENDING)   return next == CONFIRMED || next == CANCELLED;
        if (this == CONFIRMED) return next == ONGOING   || next == CANCELLED;
        if (this == ONGOING)   return next == COMPLETED;
        return false; // COMPLETED, CANCELLED là trạng thái cuối
    }

    public void validateTransitionTo(BookingStatus next) {
        if (!canTransitionTo(next)) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể chuyển trạng thái từ " + this + " sang " + next);
        }
    }
}
```

Trong service:

```java
booking.getStatus().validateTransitionTo(BookingStatus.CONFIRMED);
booking.setStatus(BookingStatus.CONFIRMED);
```

Mỗi entity có status (Booking, Car, Payment, ...) có một enum riêng theo cách này.

---

## 5. Bảng con phụ thuộc không có service riêng

Bảng không đứng một mình được (ví dụ chi tiết của booking, như `OrderItem` trong đề tài bán hàng) thì:

- **Không tạo** `XxxItemService`, `XxxItemController`.
- Tạo/sửa/xóa thông qua service của bảng cha (Booking). Entity cha giữ danh sách con bằng `@OneToMany(cascade = ALL, orphanRemoval = true)`.
- Repository của bảng con chỉ tạo khi thật sự cần truy vấn riêng.

---

## 6. Xử lý lỗi và try catch ở tầng service

**Quy ước chung của nhóm:**

1. **Bắt buộc có try catch ở tầng service** cho các hàm nghiệp vụ.
2. Mọi lỗi dùng **`throw new AppException(...)`**. **Không dùng `throws`** trên chữ ký method.
3. `AppException` kế thừa `RuntimeException` (unchecked), để `@Transactional` tự rollback.
4. **Không nuốt lỗi.** Bắt xong phải ném lại, không được chỉ log rồi `return null`, vì sẽ không rollback và dữ liệu dễ bị lưu dở.
5. Lỗi checked của thư viện (ví dụ `IOException` khi lưu ảnh): bắt bằng try catch rồi `throw new AppException(...)` bọc lại.
6. **Không dùng `finally`** trừ khi có tài nguyên cần đóng. Khi đó ưu tiên `try-with-resources`. Không nhét logic nghiệp vụ vào `finally`.
7. `GlobalExceptionHandler` chỉ chuyển lỗi thành JSON, **không log lại** để khỏi trùng log.

```java
public class AppException extends RuntimeException {
    private final HttpStatus status;
    public AppException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
    public HttpStatus getStatus() { return status; }
}
```

Mẫu một hàm service:

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    @Transactional
    public BookingResponse confirm(Long id) {
        log.info("Confirm booking id={}", id);
        try {
            Booking booking = findBookingOrThrow(id);
            booking.getStatus().validateTransitionTo(BookingStatus.CONFIRMED);
            booking.setStatus(BookingStatus.CONFIRMED);
            return BookingResponse.from(bookingRepository.save(booking));
        } catch (AppException e) {
            log.warn("Confirm booking thất bại id={}: {}", id, e.getMessage());
            throw e; // lỗi nghiệp vụ: ném lại nguyên
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi confirm booking id={}", id, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xác nhận booking");
        }
    }
}
```

---

## 7. Ghi log

- Dùng `@Slf4j` của Lombok, không dùng `System.out.println`.
- Log ở **đầu các hàm thay đổi dữ liệu** (tạo, sửa, xóa) và **khi chuyển trạng thái**, kèm id liên quan.
- Mức log: `info` cho thao tác bình thường, `warn` cho lỗi nghiệp vụ, `error` cho lỗi bất ngờ (kèm exception để có stack trace).
- Dùng placeholder `{}`: `log.info("Create car plate={}", plate)`, không nối chuỗi bằng `+`.
- **Tuyệt đối không log** mật khẩu, token, thông tin thanh toán.

---

## 8. Chuyển đổi Entity và DTO nằm ngay trong DTO

Không tạo class mapper riêng ở giai đoạn này.

- **Entity sang Response:** hàm static `from(...)` trong Response DTO. Với danh sách và trang thì dùng `.map(CarResponse::from)`.
- **Request sang Entity:** hàm `toEntity()` trong Request DTO để tạo mới.
- **Cập nhật:** hàm `applyTo(Entity)` trong Request DTO, ghi đè các trường cho phép sửa lên entity đã lấy từ DB. Không tạo entity mới để cập nhật (sẽ mất `createdAt` và các trường khác).

Lưu ý:

1. `toEntity()` chỉ gán các trường đơn giản, **không truy vấn DB**. Các quan hệ (xe, khách hàng) do service tự `findById` rồi `set` vào sau.
2. Gọi `from(...)` khi còn trong service (còn transaction), không gọi ở controller, để tránh `LazyInitializationException`.
3. Không trả thẳng entity ra controller. Luôn qua Response DTO.

```java
public record CarResponse(Long id, String plate, String brand,
                          BigDecimal pricePerHour, BigDecimal pricePerDay, CarStatus status) {
    public static CarResponse from(Car c) {
        return new CarResponse(c.getId(), c.getPlate(), c.getBrand(),
                c.getPricePerHour(), c.getPricePerDay(), c.getStatus());
    }
}
```

Nếu sau này mapping quá nhiều và phức tạp thì cả nhóm họp lại cân nhắc chuyển sang MapStruct.

---

## 9. Đặt tên và API

- Entity bảng người dùng đặt `@Table(name = "users")` vì `user` là từ khóa của PostgreSQL.
- Endpoint dạng danh từ số nhiều: `/api/cars`, `/api/bookings`.
- Thời gian dùng `LocalDateTime`; tiền dùng `BigDecimal`.
- Một xe không được có hai booking chồng thời gian: kiểm tra bằng điều kiện `startTime < newEnd AND endTime > newStart`.

---

## 10. Git và bảo mật

- Nhánh: `main` (bản ổn định để nộp), `DEV` (gom code), `BE` và `FE` (làm việc theo phần). Không push thẳng lên `main`.
- Không commit `node_modules`, `target`, file `.env`.
- **Không commit mật khẩu database.** Cấu hình thật để trong `application-local.properties` (đã nằm trong `.gitignore`); mỗi người tự tạo file này trên máy mình, mẫu để trong `application-local.properties.example` với mật khẩu để trống.
- Commit message rõ ràng, ví dụ: `feat: add car CRUD with paging`.

---

## 11. Checklist trước khi tạo Pull Request

- [ ] Danh sách có phân trang
- [ ] Status dùng enum và gọi `validateTransitionTo` trước khi đổi
- [ ] Service có try catch, ném lại `AppException`, không dùng `throws`
- [ ] Có log ở các hàm thay đổi dữ liệu, không log thông tin nhạy cảm
- [ ] Không trả entity thẳng ra controller
- [ ] Không có service riêng cho bảng con phụ thuộc
- [ ] Phần chung đã tái sử dụng, không copy-paste
- [ ] Không có mật khẩu hay file local trong commit
