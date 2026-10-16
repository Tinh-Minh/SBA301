package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.carrental.config.DocumentProperties;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.storage.CanonicalDocumentImage;
import com.carrental.storage.DocumentImageFormat;
import com.carrental.storage.DocumentImageInspector;
import com.carrental.storage.LocalPrivateDocumentStorage;
import com.carrental.storage.PrivateDocumentFile;
import com.carrental.storage.PrivateDocumentReceipt;
import com.carrental.storage.UploadedDocumentImage;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Random;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.IIOImage;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PrivateDocumentStorageTest {

    @Test
    void disabledStorageDoesNotCreateConfiguredRootAndRejectsUse(@TempDir Path temp) {
        DocumentProperties properties = new DocumentProperties();
        Path missing = temp.resolve("must-not-be-created");
        properties.getStorage().setRoot(missing.toString());
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(properties);

        assertThat(storage.isEnabled()).isFalse();
        assertThat(Files.exists(missing)).isFalse();
        assertThatThrownBy(() -> storage.open("private-local:anything.jpg"))
                .isInstanceOf(AppException.class)
                .extracting(error -> ((AppException) error).errorCode()).isEqualTo(ErrorCode.DEPENDENCY_UNAVAILABLE);
        assertThat(Files.exists(missing)).isFalse();
    }

    @Test
    void localAdapterStoresReadsAndIdempotentlyDeletesOnlyItsReceipt(@TempDir Path root, @TempDir Path outside) throws Exception {
        DocumentProperties properties = enabled(root);
        LocalPrivateDocumentStorage storage = new LocalPrivateDocumentStorage(properties);
        byte[] bytes = {1, 2, 3, 4};
        PrivateDocumentReceipt receipt = storage.store(new CanonicalDocumentImage(bytes, DocumentImageFormat.PNG));
        assertThat(receipt.locator()).matches("private-local:[0-9a-f-]{36}\\.png");
        Path stored = root.resolve(receipt.locator().substring("private-local:".length()));
        assertThat(Files.readAllBytes(stored)).containsExactly(bytes);
        PrivateDocumentFile opened = storage.open(receipt.locator());
        assertThat(opened.bytes()).containsExactly(bytes);
        assertThat(opened.format()).isEqualTo(DocumentImageFormat.PNG);

        Path marker = outside.resolve("outside-marker.txt");
        Files.writeString(marker, "untouched", StandardCharsets.UTF_8);
        assertThatThrownBy(() -> storage.open("private-local:../../outside-marker.txt"))
                .isInstanceOf(AppException.class)
                .extracting(error -> ((AppException) error).errorCode()).isEqualTo(ErrorCode.INTERNAL_ERROR);
        assertThatThrownBy(() -> storage.delete(new PrivateDocumentReceipt("private-local:../../outside-marker.txt", UUID.randomUUID())))
                .isInstanceOf(AppException.class);
        assertThat(Files.readString(marker)).isEqualTo("untouched");

        storage.delete(receipt);
        storage.delete(receipt);
        assertThat(Files.exists(stored)).isFalse();
        assertThat(Files.readString(marker)).isEqualTo("untouched");
    }

    @Test
    void enabledStorageRejectsRelativeMissingAndApplicationTreeRoots(@TempDir Path temp) {
        DocumentProperties relative = enabled(temp);
        relative.getStorage().setRoot("relative/private");
        assertThatThrownBy(() -> new LocalPrivateDocumentStorage(relative)).isInstanceOf(IllegalStateException.class);

        DocumentProperties missing = enabled(temp);
        missing.getStorage().setRoot(temp.resolve("missing").toString());
        assertThatThrownBy(() -> new LocalPrivateDocumentStorage(missing)).isInstanceOf(IllegalStateException.class);

        DocumentProperties repository = enabled(temp);
        repository.getStorage().setRoot(Path.of(System.getProperty("user.dir"), "target").toString());
        assertThatThrownBy(() -> new LocalPrivateDocumentStorage(repository)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void imageInspectorAcceptsOnlyMatchingFormatsAndReencodesAppendedData(@TempDir Path temp) throws Exception {
        DocumentProperties properties = enabled(temp);
        DocumentImageInspector inspector = new DocumentImageInspector(properties);
        byte[] png = image(4, 3, "png");
        byte[] tailed = java.util.Arrays.copyOf(png, png.length + 24);
        System.arraycopy("SENTINEL_APPENDED_DATA".getBytes(StandardCharsets.US_ASCII), 0,
                tailed, png.length, 22);
        CanonicalDocumentImage clean = inspector.inspect(new UploadedDocumentImage("front.png", "image/png", tailed));
        assertThat(clean.format()).isEqualTo(DocumentImageFormat.PNG);
        assertThat(new String(clean.bytes(), StandardCharsets.ISO_8859_1)).doesNotContain("SENTINEL_APPENDED_DATA");
        BufferedImage decoded = ImageIO.read(new java.io.ByteArrayInputStream(clean.bytes()));
        assertThat(decoded.getWidth()).isEqualTo(4);
        assertThat(decoded.getHeight()).isEqualTo(3);

        assertError(() -> inspector.inspect(new UploadedDocumentImage("fake.jpg", "image/jpeg", png)),
                ErrorCode.UNSUPPORTED_MEDIA_TYPE);
        assertError(() -> inspector.inspect(new UploadedDocumentImage("front.jpg", "image/jpeg", new byte[] {1, 2, 3, 4})),
                ErrorCode.UNSUPPORTED_MEDIA_TYPE);
        assertError(() -> inspector.inspect(new UploadedDocumentImage("../../front.png", "image/png", png)),
                ErrorCode.VALIDATION_ERROR);
    }

    @Test
    void jpegAndPngIntegrityRejectsTruncationAndChecksumDamageButAcceptsAppendedBytes(@TempDir Path temp) throws Exception {
        DocumentProperties properties = enabled(temp);
        DocumentImageInspector inspector = new DocumentImageInspector(properties);
        byte[] jpeg = image(160, 120, "jpeg");
        byte[] png = image(16, 12, "png");

        CanonicalDocumentImage validJpeg = inspector.inspect(new UploadedDocumentImage("front.jpg", "image/jpeg", jpeg));
        assertThat(validJpeg.format()).isEqualTo(DocumentImageFormat.JPEG);
        assertThat(ImageIO.read(new java.io.ByteArrayInputStream(validJpeg.bytes()))).satisfies(decoded -> {
            assertThat(decoded.getWidth()).isEqualTo(160);
            assertThat(decoded.getHeight()).isEqualTo(120);
        });

        byte[] sentinel = "APPENDED-SENTINEL".getBytes(StandardCharsets.US_ASCII);
        byte[] jpegWithTail = java.util.Arrays.copyOf(jpeg, jpeg.length + sentinel.length);
        System.arraycopy(sentinel, 0, jpegWithTail, jpeg.length, sentinel.length);
        CanonicalDocumentImage canonicalTail = inspector.inspect(
                new UploadedDocumentImage("front.jpg", "image/jpeg", jpegWithTail));
        assertThat(new String(canonicalTail.bytes(), StandardCharsets.ISO_8859_1)).doesNotContain("APPENDED-SENTINEL");
        assertThat(ImageIO.read(new java.io.ByteArrayInputStream(canonicalTail.bytes()))).isNotNull();

        int[] jpegCuts = {2, 64, Math.max(1, jpeg.length / 3)};
        for (int cut : jpegCuts) {
            byte[] truncated = java.util.Arrays.copyOf(jpeg, jpeg.length - cut);
            assertError(() -> inspector.inspect(new UploadedDocumentImage("front.jpg", "image/jpeg", truncated)),
                    ErrorCode.VALIDATION_ERROR);
            assertThatThrownBy(() -> inspector.validateStored(truncated, DocumentImageFormat.JPEG))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        byte[] missingPngEnd = java.util.Arrays.copyOf(png, png.length - 8);
        assertError(() -> inspector.inspect(new UploadedDocumentImage("front.png", "image/png", missingPngEnd)),
                ErrorCode.VALIDATION_ERROR);
        byte[] truncatedPngChunk = java.util.Arrays.copyOf(png, png.length - 13);
        assertError(() -> inspector.inspect(new UploadedDocumentImage("front.png", "image/png", truncatedPngChunk)),
                ErrorCode.VALIDATION_ERROR);
        byte[] damagedPngCrc = png.clone();
        damagedPngCrc[damagedPngCrc.length - 5] ^= 0x01;
        assertError(() -> inspector.inspect(new UploadedDocumentImage("front.png", "image/png", damagedPngCrc)),
                ErrorCode.VALIDATION_ERROR);

        byte[] pngWithTail = java.util.Arrays.copyOf(png, png.length + sentinel.length);
        System.arraycopy(sentinel, 0, pngWithTail, png.length, sentinel.length);
        CanonicalDocumentImage canonicalPngTail = inspector.inspect(
                new UploadedDocumentImage("front.png", "image/png", pngWithTail));
        assertThat(new String(canonicalPngTail.bytes(), StandardCharsets.ISO_8859_1)).doesNotContain("APPENDED-SENTINEL");
        assertThat(ImageIO.read(new java.io.ByteArrayInputStream(canonicalPngTail.bytes()))).isNotNull();
    }

    @Test
    void canonicalEncoderEnforcesOutputByteCap(@TempDir Path temp) throws Exception {
        BufferedImage noisy = new BufferedImage(128, 128, BufferedImage.TYPE_INT_RGB);
        Random random = new Random(3021);
        for (int y = 0; y < noisy.getHeight(); y++) {
            for (int x = 0; x < noisy.getWidth(); x++) noisy.setRGB(x, y, random.nextInt(1 << 24));
        }
        byte[] lowQuality = jpegAtQuality(noisy, 0.05f);
        byte[] highQuality = jpegAtQuality(noisy, 0.92f);
        assertThat(highQuality.length).isGreaterThan(lowQuality.length + 32);

        DocumentProperties properties = enabled(temp);
        properties.getUpload().setMaxFileSize(org.springframework.util.unit.DataSize.ofBytes(lowQuality.length + 16L));
        assertError(() -> new DocumentImageInspector(properties).inspect(
                new UploadedDocumentImage("front.jpg", "image/jpeg", lowQuality)), ErrorCode.PAYLOAD_TOO_LARGE);
    }

    @Test
    void imageDimensionsAreRejectedBeforeDecodeWhenOverConfiguredCap(@TempDir Path temp) throws Exception {
        DocumentProperties properties = enabled(temp);
        properties.getUpload().setMaxImagePixels(8);
        DocumentImageInspector inspector = new DocumentImageInspector(properties);
        byte[] image = image(3, 3, "png");
        assertError(() -> inspector.inspect(new UploadedDocumentImage("front.png", "image/png", image)),
                ErrorCode.PAYLOAD_TOO_LARGE);
    }

    private static DocumentProperties enabled(Path root) {
        DocumentProperties properties = new DocumentProperties();
        properties.getStorage().setEnabled(true);
        properties.getStorage().setRoot(root.toString());
        return properties;
    }

    private static byte[] image(int width, int height, String format) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, Color.BLUE.getRGB());
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, format, output);
        return output.toByteArray();
    }

    private static byte[] jpegAtQuality(BufferedImage image, float quality) throws Exception {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
        ImageWriter writer = writers.next();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (MemoryCacheImageOutputStream output = new MemoryCacheImageOutputStream(bytes)) {
            writer.setOutput(output);
            ImageWriteParam parameters = writer.getDefaultWriteParam();
            parameters.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            parameters.setCompressionQuality(quality);
            writer.write(null, new IIOImage(image, null, null), parameters);
            output.flush();
        } finally {
            writer.dispose();
        }
        return bytes.toByteArray();
    }

    private static void assertError(Runnable action, ErrorCode code) {
        assertThatThrownBy(action::run).isInstanceOf(AppException.class)
                .extracting(error -> ((AppException) error).errorCode()).isEqualTo(code);
    }
}
