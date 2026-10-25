package com.carrental.storage;

import com.carrental.config.DocumentProperties;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Component;

/** Stores private images under server-generated names; downloads remain permission-checked by the service. */
@Component
public final class LocalPrivateDocumentStorage implements PrivateDocumentStorage {
    private static final Pattern LOCATOR = Pattern.compile("private-local:([0-9a-fA-F-]{36})\\.(jpg|png)");
    private final DocumentProperties properties;
    private final Path root;

    public LocalPrivateDocumentStorage(DocumentProperties properties) {
        this.properties = properties;
        this.root = properties.getStorage().isEnabled() ? storageRoot(properties.getStorage().getRoot()) : null;
    }

    @Override
    public boolean isEnabled() { return properties.getStorage().isEnabled(); }

    @Override
    public PrivateDocumentReceipt store(UploadedDocumentImage image) {
        requireEnabled();
        if (image == null || image.filename() == null
                || !image.filename().matches("[A-Za-z0-9][A-Za-z0-9 _-]{0,99}\\.(?i:jpg|jpeg|png)")) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        DocumentImageFormat format = validateImage(image.bytes());
        String extension = image.filename().substring(image.filename().lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        boolean matchingName = format == DocumentImageFormat.PNG ? extension.equals("png")
                : extension.equals("jpg") || extension.equals("jpeg");
        if (!matchingName || !format.mediaType().equalsIgnoreCase(image.mediaType())) {
            throw new AppException(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
        }
        UUID id = UUID.randomUUID();
        String locator = "private-local:" + id + "." + format.extension();
        Path file = safePath(locator);
        try {
            Files.write(file, image.bytes(), StandardOpenOption.CREATE_NEW);
            return new PrivateDocumentReceipt(locator, id);
        } catch (IOException exception) {
            try { Files.deleteIfExists(file); } catch (IOException cleanupFailure) { exception.addSuppressed(cleanupFailure); }
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, "Không thể lưu tệp riêng tư", exception);
        }
    }

    @Override
    public PrivateDocumentFile open(String locator) {
        requireEnabled();
        Path file = safePath(locator);
        if (!Files.exists(file, LinkOption.NOFOLLOW_LINKS)) throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        try {
            if (!Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS)
                    || Files.size(file) > properties.getUpload().getMaxFileSize().toBytes()) {
                throw new AppException(ErrorCode.INTERNAL_ERROR);
            }
            byte[] bytes = Files.readAllBytes(file);
            DocumentImageFormat format;
            try { format = validateImage(bytes); }
            catch (AppException invalidImage) { throw new AppException(ErrorCode.INTERNAL_ERROR, "Ảnh đã lưu không hợp lệ", invalidImage); }
            if (!file.toString().endsWith("." + format.extension())) throw new AppException(ErrorCode.INTERNAL_ERROR);
            return new PrivateDocumentFile(bytes, format);
        } catch (IOException exception) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "Không thể đọc tệp riêng tư", exception);
        }
    }

    @Override
    public void delete(PrivateDocumentReceipt receipt) {
        requireEnabled();
        if (receipt == null) return;
        Path file = safePath(receipt.locator());
        if (receipt.receiptId() == null || !file.getFileName().toString().startsWith(receipt.receiptId() + ".")) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
        try { Files.deleteIfExists(file); }
        catch (IOException exception) { throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, "Không thể dọn tệp riêng tư", exception); }
    }

    private DocumentImageFormat validateImage(byte[] bytes) {
        if (bytes == null || bytes.length == 0) throw new AppException(ErrorCode.VALIDATION_ERROR);
        if (bytes.length > properties.getUpload().getMaxFileSize().toBytes()) throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
        try (var input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new AppException(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
            var reader = readers.next();
            try {
                reader.setInput(input, true, true);
                String name = reader.getFormatName().toLowerCase(Locale.ROOT);
                DocumentImageFormat format = switch (name) {
                    case "png" -> DocumentImageFormat.PNG;
                    case "jpeg", "jpg" -> DocumentImageFormat.JPEG;
                    default -> throw new AppException(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
                };
                int width = reader.getWidth(0), height = reader.getHeight(0);
                if (width <= 0 || height <= 0 || width > properties.getUpload().getMaxImageDimension()
                        || height > properties.getUpload().getMaxImageDimension()
                        || (long) width * height > properties.getUpload().getMaxImagePixels()) {
                    throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
                }
                AtomicBoolean warning = new AtomicBoolean();
                reader.addIIOReadWarningListener((source, message) -> warning.set(true));
                if (reader.read(0) == null || warning.get()) throw new AppException(ErrorCode.VALIDATION_ERROR);
                return format;
            } finally { reader.dispose(); }
        } catch (IOException exception) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
    }

    private Path storageRoot(String configured) {
        if (configured == null || configured.isBlank()) throw new IllegalStateException("Private storage root is required");
        Path path = Path.of(configured).normalize();
        if (!path.isAbsolute() || Files.isSymbolicLink(path)
                || path.startsWith(Path.of("").toAbsolutePath().normalize())) {
            throw new IllegalStateException("Private storage must be an absolute directory outside the application working directory");
        }
        try { return Files.createDirectories(path).toRealPath(); }
        catch (IOException exception) { throw new IllegalStateException("Private storage is unavailable", exception); }
    }

    private Path safePath(String locator) {
        var matcher = LOCATOR.matcher(locator == null ? "" : locator);
        if (!matcher.matches()) throw new AppException(ErrorCode.INTERNAL_ERROR);
        Path file = root.resolve(matcher.group(1) + "." + matcher.group(2)).normalize();
        if (!file.getParent().equals(root) || Files.isSymbolicLink(file)) throw new AppException(ErrorCode.INTERNAL_ERROR);
        return file;
    }

    private void requireEnabled() {
        if (!isEnabled() || root == null) throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE);
    }
}
