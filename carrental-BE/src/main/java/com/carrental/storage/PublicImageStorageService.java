package com.carrental.storage;


import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Lưu trữ và kiểm tra ảnh công khai (ảnh xe, giấy tờ xe, ảnh bàn giao).
 */
@Slf4j
@Service
public class PublicImageStorageService {

    public static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    public static final int MAX_BATCH_FILES = 10;

    private static final Map<String, String> EXTENSIONS = Map.of("jpeg", "jpg", "png", "png", "webp", "webp");
    private static final Set<String> ALLOWED_FILENAME_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Pattern SAFE_NAME = Pattern.compile("^[0-9a-f\\-]{36}\\.(jpg|png|webp)$");

    private final Path root;

    public PublicImageStorageService(@Value("${app.upload.root:storage/public-uploads}") String root) {
        this.root = Path.of(root).toAbsolutePath().normalize();
    }

    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng chọn một tệp ảnh");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE, "Dung lượng ảnh tối đa là 5MB");
        }
        validateFilenameExtension(file.getOriginalFilename());

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không đọc được tệp tải lên");
        }
        if (bytes.length == 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tệp ảnh rỗng");
        }
        if (bytes.length > MAX_IMAGE_BYTES) {
            throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE, "Dung lượng ảnh tối đa là 5MB");
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
        return "/api/uploads/files/" + name;
    }

    public List<String> storeImages(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ít nhất một tệp ảnh");
        }
        if (files.size() > MAX_BATCH_FILES) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mỗi lần chỉ được tải lên tối đa " + MAX_BATCH_FILES + " ảnh");
        }
        List<String> storedUrls = new ArrayList<>(files.size());
        try {
            for (MultipartFile file : files) {
                storedUrls.add(storeImage(file));
            }
            return storedUrls;
        } catch (RuntimeException ex) {
            deleteQuietly(storedUrls);
            throw ex;
        }
    }

    public LoadedImage loadImage(String name) {
        if (name == null || !SAFE_NAME.matcher(name).matches()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh");
        }
        Path path = root.resolve(name).normalize();
        if (!path.startsWith(root) || !Files.isRegularFile(path)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh");
        }
        MediaType type = name.endsWith(".png") ? MediaType.IMAGE_PNG
                : name.endsWith(".webp") ? MediaType.parseMediaType("image/webp") : MediaType.IMAGE_JPEG;
        return new LoadedImage(new FileSystemResource(path), type);
    }

    public void deleteQuietly(List<String> urls) {
        if (urls == null) {
            return;
        }
        for (String url : urls) {
            deleteQuietly(url);
        }
    }

    public void deleteQuietly(String url) {
        if (url == null || !url.startsWith("/api/uploads/files/")) {
            return;
        }
        String name = url.substring("/api/uploads/files/".length());
        if (!SAFE_NAME.matcher(name).matches()) {
            return;
        }
        Path path = root.resolve(name).normalize();
        if (path.startsWith(root)) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
                log.warn("Không xóa được tệp tạm {}", name);
            }
        }
    }

    private static void validateFilenameExtension(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return;
        }
        String base = originalFilename.trim();
        int slash = Math.max(base.lastIndexOf('/'), base.lastIndexOf('\\'));
        if (slash >= 0) {
            base = base.substring(slash + 1);
        }
        int dot = base.lastIndexOf('.');
        if (dot >= 0 && dot < base.length() - 1) {
            String ext = base.substring(dot + 1).toLowerCase(Locale.ROOT);
            if (!ALLOWED_FILENAME_EXTENSIONS.contains(ext)) {
                throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                        "Chỉ hỗ trợ định dạng ảnh JPG, PNG hoặc WebP");
            }
        }
    }

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
                    String format = reader.getFormatName().toLowerCase(Locale.ROOT);
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
        throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Chỉ nhận ảnh JPG, PNG hoặc WebP hợp lệ");
    }

    private static boolean isWebp(byte[] b) {
        if (b.length < 20) {
            return false;
        }
        boolean header = b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
        if (!header) {
            return false;
        }
        boolean vp8Chunk = b[12] == 'V' && b[13] == 'P' && b[14] == '8'
                && (b[15] == ' ' || b[15] == 'L' || b[15] == 'X');
        return vp8Chunk;
    }

    public record LoadedImage(Resource resource, MediaType mediaType) {
    }
}
