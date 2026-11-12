package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.exception.AppException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Tải ảnh lên máy chủ (ảnh hiện trạng xe khi bàn giao, ảnh xe, ảnh giấy tờ xe).
 *
 * <p>Ảnh được lưu với tên ngẫu nhiên (UUID) và trả về đường dẫn nội bộ {@code /api/uploads/files/...}
 * để dùng cho các trường URL ảnh. Chỉ nhận JPEG/PNG/WebP hợp lệ, nội dung được kiểm tra bằng
 * ImageIO chứ không tin vào phần mở rộng hay Content-Type của client.
 */
@Slf4j
@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final Map<String, String> EXTENSIONS = Map.of("jpeg", "jpg", "png", "png", "webp", "webp");
    private static final java.util.regex.Pattern SAFE_NAME =
            java.util.regex.Pattern.compile("^[0-9a-f\\-]{36}\\.(jpg|png|webp)$");

    private final Path root;

    public UploadController(@Value("${app.upload.root:storage/public-uploads}") String root) {
        this.root = Path.of(root).toAbsolutePath().normalize();
    }

    @PostMapping(path = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng chọn một tệp ảnh");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không đọc được tệp tải lên");
        }
        String extension = detectExtension(bytes);
        String name = UUID.randomUUID() + "." + extension;
        try {
            Files.createDirectories(root);
            Files.write(root.resolve(name), bytes);
        } catch (IOException e) {
            log.error("Không lưu được ảnh tải lên", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không lưu được ảnh, vui lòng thử lại");
        }
        return ApiResponse.ok("Tải ảnh lên thành công", Map.of("url", "/api/uploads/files/" + name));
    }

    @GetMapping("/files/{name}")
    public ResponseEntity<Resource> getImage(@PathVariable String name) {
        if (!SAFE_NAME.matcher(name).matches()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh");
        }
        Path path = root.resolve(name).normalize();
        if (!path.startsWith(root) || !Files.isRegularFile(path)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh");
        }
        MediaType type = name.endsWith(".png") ? MediaType.IMAGE_PNG
                : name.endsWith(".webp") ? MediaType.parseMediaType("image/webp") : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(type)
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(path));
    }

    /** Xác định định dạng thật của ảnh từ nội dung; từ chối mọi thứ không phải JPEG/PNG/WebP. */
    private static String detectExtension(byte[] bytes) {
        if (isWebp(bytes)) {
            return "webp";
        }
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            var readers = ImageIO.getImageReaders(in);
            if (readers.hasNext()) {
                ImageReader reader = readers.next();
                try {
                    reader.setInput(in);
                    String format = reader.getFormatName().toLowerCase(java.util.Locale.ROOT);
                    String extension = EXTENSIONS.get("jpg".equals(format) ? "jpeg" : format);
                    if (extension != null && reader.getWidth(0) > 0 && reader.getHeight(0) > 0) {
                        return extension;
                    }
                } finally {
                    reader.dispose();
                }
            }
        } catch (IOException | RuntimeException ignored) {
            // rơi xuống lỗi chung bên dưới
        }
        throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Chỉ nhận ảnh JPEG, PNG hoặc WebP hợp lệ");
    }

    private static boolean isWebp(byte[] b) {
        return b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
    }
}
