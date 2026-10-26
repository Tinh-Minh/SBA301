package com.carrental;

import static org.assertj.core.api.Assertions.*;
import com.carrental.config.DocumentProperties;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.storage.LocalPrivateDocumentStorage;
import com.carrental.storage.PrivateDocumentStorage.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.util.unit.DataSize;

class PrivateDocumentStorageTest {
    @Test
    void disabledStorageDoesNotCreateConfiguredRootAndRejectsUse(@TempDir Path temp) {
        DocumentProperties properties = new DocumentProperties();
        Path missing = temp.resolve("missing");
        properties.getStorage().setRoot(missing.toString());
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(properties);
        assertThat(storage.isEnabled()).isFalse();
        assertError(() -> storage.open("private-local:anything.jpg"), ErrorCode.DEPENDENCY_UNAVAILABLE);
        assertThat(missing).doesNotExist();
    }

    @Test
    void storesReadsAndIdempotentlyDeletesOnlyItsReceipt(@TempDir Path root, @TempDir Path outside) throws Exception {
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(enabled(root));
        byte[] bytes = image(4, 3, "png");
        PrivateDocumentReceipt receipt = storage.store(new UploadedDocumentImage("front.png", "image/png", bytes));
        assertThat(receipt.locator()).matches("private-local:[0-9a-f-]{36}\\.png");
        assertThat(storage.open(receipt.locator()).bytes()).containsExactly(bytes);
        assertThat(storage.open(receipt.locator()).format()).isEqualTo(DocumentImageFormat.PNG);
        Path marker = outside.resolve("outside.txt");
        Files.writeString(marker, "untouched");
        assertError(() -> storage.open("private-local:../../outside.txt"), ErrorCode.INTERNAL_ERROR);
        assertError(() -> storage.delete(new PrivateDocumentReceipt("private-local:../../outside.txt", UUID.randomUUID())), ErrorCode.INTERNAL_ERROR);
        storage.delete(receipt);
        storage.delete(receipt);
        assertError(() -> storage.open(receipt.locator()), ErrorCode.RESOURCE_NOT_FOUND);
        assertThat(Files.readString(marker)).isEqualTo("untouched");
    }

    @Test
    void requiresPrivateAbsoluteRootAndCreatesMissingDirectory(@TempDir Path temp) {
        DocumentProperties properties = enabled(temp);
        properties.getStorage().setRoot("relative/private");
        assertThatThrownBy(() -> new LocalPrivateDocumentStorage(properties)).isInstanceOf(IllegalStateException.class);
        properties.getStorage().setRoot(Path.of("target").toAbsolutePath().toString());
        assertThatThrownBy(() -> new LocalPrivateDocumentStorage(properties)).isInstanceOf(IllegalStateException.class);
        properties.getStorage().setRoot(temp.resolve("new-private-directory").toString());
        new LocalPrivateDocumentStorage(properties);
        assertThat(temp.resolve("new-private-directory")).isDirectory();
    }

    @Test
    void acceptsRealJpegAndPngAndRejectsSpoofedTypesAndUnsafeNames(@TempDir Path root) throws Exception {
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(enabled(root));
        byte[] png = image(4, 3, "png");
        byte[] jpeg = image(4, 3, "jpeg");
        assertThat(storage.open(storage.store(new UploadedDocumentImage("front.png", "image/png", png)).locator()).format())
                .isEqualTo(DocumentImageFormat.PNG);
        assertThat(storage.open(storage.store(new UploadedDocumentImage("front.jpg", "image/jpeg", jpeg)).locator()).format())
                .isEqualTo(DocumentImageFormat.JPEG);
        assertError(() -> storage.store(new UploadedDocumentImage("fake.jpg", "image/jpeg", png)), ErrorCode.UNSUPPORTED_MEDIA_TYPE);
        assertError(() -> storage.store(new UploadedDocumentImage("front.png", "text/plain", png)), ErrorCode.UNSUPPORTED_MEDIA_TYPE);
        assertError(() -> storage.store(new UploadedDocumentImage("../../front.png", "image/png", png)), ErrorCode.VALIDATION_ERROR);
        assertError(() -> storage.store(new UploadedDocumentImage("front.jpg", "image/jpeg", new byte[]{1,2,3,4})), ErrorCode.UNSUPPORTED_MEDIA_TYPE);
    }

    @Test
    void rejectsEmptyTruncatedAndCorruptStoredImages(@TempDir Path root) throws Exception {
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(enabled(root));
        assertError(() -> storage.store(new UploadedDocumentImage("front.png", "image/png", new byte[0])), ErrorCode.VALIDATION_ERROR);
        byte[] png = image(16, 12, "png");
        byte[] truncated = java.util.Arrays.copyOf(png, png.length / 2);
        assertError(() -> storage.store(new UploadedDocumentImage("front.png", "image/png", truncated)), ErrorCode.VALIDATION_ERROR);
        var receipt = storage.store(new UploadedDocumentImage("front.png", "image/png", png));
        Files.write(root.resolve(receipt.locator().substring("private-local:".length())), new byte[]{1,2,3});
        assertError(() -> storage.open(receipt.locator()), ErrorCode.INTERNAL_ERROR);
    }

    @Test
    void rejectsOversizedUploads(@TempDir Path root) throws Exception {
        byte[] png = image(4, 3, "png");
        DocumentProperties properties = enabled(root);
        properties.getUpload().setMaxFileSize(DataSize.ofBytes(png.length - 1));
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(properties);
        assertError(() -> storage.store(new UploadedDocumentImage("front.png", "image/png", png)), ErrorCode.PAYLOAD_TOO_LARGE);
        try (var files = Files.list(root)) { assertThat(files.count()).isZero(); }
    }

    @Test
    void rejectsExcessiveDimensionsBeforeDecoding(@TempDir Path root) throws Exception {
        DocumentProperties properties = enabled(root);
        properties.getUpload().setMaxImagePixels(8);
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(properties);
        byte[] png = image(3, 3, "png");
        assertError(() -> storage.store(new UploadedDocumentImage("front.png", "image/png", png)), ErrorCode.PAYLOAD_TOO_LARGE);
    }

    private static DocumentProperties enabled(Path root) {
        DocumentProperties p = new DocumentProperties();
        p.getStorage().setEnabled(true);
        p.getStorage().setRoot(root.toString());
        return p;
    }
    private static byte[] image(int width, int height, String format) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), format, bytes);
        return bytes.toByteArray();
    }
    private static void assertError(Runnable action, ErrorCode code) {
        assertThatThrownBy(action::run).isInstanceOf(AppException.class)
                .extracting(e -> ((AppException)e).errorCode()).isEqualTo(code);
    }
}
