package com.carrental.storage;

import com.carrental.config.DocumentProperties;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Local filesystem adapter for a configured, non-public directory outside the application tree. */
@Component
public final class LocalPrivateDocumentStorage implements PrivateDocumentStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalPrivateDocumentStorage.class);
    private static final Pattern LOCATOR = Pattern.compile("private-local:([0-9a-fA-F-]{36})\\.(jpg|png)");
    private final DocumentProperties properties;
    private final Path root;

    public LocalPrivateDocumentStorage(DocumentProperties properties) {
        this.properties = properties;
        this.root = properties.getStorage().isEnabled() ? validateRoot(properties.getStorage().getRoot()) : null;
    }

    @Override public boolean isEnabled() { return properties.getStorage().isEnabled(); }

    @Override
    public PrivateDocumentReceipt store(CanonicalDocumentImage image) {
        requireEnabled();
        UUID id = UUID.randomUUID();
        Path destination = safePath(id.toString() + "." + image.format().extension());
        boolean[] created = {false};
        try {
            try (OutputStream output = Files.newOutputStream(destination, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE)) {
                created[0] = true;
                output.write(image.bytes());
            }
            return new PrivateDocumentReceipt("private-local:" + destination.getFileName(), id);
        } catch (IOException | SecurityException exception) {
            if (created[0]) {
                try { Files.deleteIfExists(destination); }
                catch (IOException | SecurityException cleanupFailure) {
                    exception.addSuppressed(cleanupFailure);
                    log.error("Private document write cleanup failed action=document-storage-write traceId={} receiptId={} exceptionType={}",
                            com.carrental.web.RequestTraceFilter.currentTraceId(), id, cleanupFailure.getClass().getSimpleName());
                }
            }
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, "Không thể lưu tệp riêng tư", exception);
        }
    }

    @Override
    public PrivateDocumentFile open(String locator) {
        requireEnabled();
        Matcher matcher = locator == null ? null : LOCATOR.matcher(locator);
        if (matcher == null || !matcher.matches()) throw internalStorageFailure(null);
        try {
            if (!UUID.fromString(matcher.group(1)).toString().equalsIgnoreCase(matcher.group(1))) throw internalStorageFailure(null);
        } catch (IllegalArgumentException exception) {
            throw internalStorageFailure(null);
        }
        Path path = safePath(matcher.group(1) + "." + matcher.group(2).toLowerCase(Locale.ROOT));
        try {
            if (!Files.exists(path, LinkOption.NOFOLLOW_LINKS)) {
                throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
            }
            rejectUnexpectedPath(path);
            long size = Files.size(path);
            if (size <= 0 || size > properties.getUpload().getMaxFileSize().toBytes()) {
                throw internalStorageFailure(null);
            }
            byte[] bytes = Files.readAllBytes(path);
            if (bytes.length != size) throw internalStorageFailure(null);
            DocumentImageFormat format = "png".equalsIgnoreCase(matcher.group(2))
                    ? DocumentImageFormat.PNG : DocumentImageFormat.JPEG;
            return new PrivateDocumentFile(bytes, format);
        } catch (AppException exception) {
            throw exception;
        } catch (IOException | SecurityException exception) {
            throw internalStorageFailure(exception);
        }
    }

    @Override
    public void delete(PrivateDocumentReceipt receipt) {
        requireEnabled();
        if (receipt == null || receipt.receiptId() == null || receipt.locator() == null) return;
        Matcher matcher = LOCATOR.matcher(receipt.locator());
        if (!matcher.matches() || !receipt.receiptId().toString().equalsIgnoreCase(matcher.group(1))) {
            throw internalStorageFailure(null);
        }
        Path path = safePath(matcher.group(1) + "." + matcher.group(2).toLowerCase(Locale.ROOT));
        try {
            if (Files.exists(path, LinkOption.NOFOLLOW_LINKS)) {
                rejectUnexpectedPath(path);
                Files.delete(path);
            }
        } catch (IOException | SecurityException exception) {
            throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE, "Không thể dọn tệp riêng tư", exception);
        }
    }

    private Path safePath(String fileName) {
        Path path = root.resolve(fileName).normalize();
        if (!path.startsWith(root) || !root.equals(path.getParent())) throw internalStorageFailure(null);
        return path;
    }

    private void rejectUnexpectedPath(Path path) throws IOException {
        if (Files.isSymbolicLink(path) || !Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS)) {
            throw internalStorageFailure(null);
        }
        Path real = path.toRealPath(LinkOption.NOFOLLOW_LINKS);
        if (!real.startsWith(root) || !root.equals(real.getParent())) throw internalStorageFailure(null);
    }

    private void requireEnabled() {
        if (!isEnabled() || root == null) throw new AppException(ErrorCode.DEPENDENCY_UNAVAILABLE);
    }

    private Path validateRoot(String configured) {
        return StorageRootPolicy.validateRoot(configured,
                StorageRootPolicy.applicationCodeLocation(LocalPrivateDocumentStorage.class));
    }

    private AppException internalStorageFailure(Throwable cause) {
        return cause == null ? new AppException(ErrorCode.INTERNAL_ERROR)
                : new AppException(ErrorCode.INTERNAL_ERROR, "Không thể đọc tệp riêng tư", cause);
    }
}
