package com.carrental.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/** Resource limits and the opt-in private document storage location. */
@Validated
@ConfigurationProperties(prefix = "app.document")
public class DocumentProperties {

    @Valid @NotNull private Storage storage = new Storage();
    @Valid @NotNull private Upload upload = new Upload();
    @Valid @NotNull private Listing list = new Listing();

    public Storage getStorage() { return storage; }
    public void setStorage(Storage storage) { this.storage = storage; }
    public Upload getUpload() { return upload; }
    public void setUpload(Upload upload) { this.upload = upload; }
    public Listing getList() { return list; }
    public void setList(Listing list) { this.list = list; }

    @AssertTrue(message = "Document upload limits are inconsistent")
    public boolean isUploadLimitsConsistent() {
        if (upload == null || upload.maxFileSize == null || upload.maxRequestSize == null) return false;
        long file = upload.maxFileSize.toBytes();
        long request = upload.maxRequestSize.toBytes();
        return file > 0 && file <= 50L * 1024 * 1024
                && request > 0 && request <= 110L * 1024 * 1024
                && request >= safeRequiredRequestBytes(file)
                && upload.maxImagePixels > 0 && upload.maxImagePixels <= 100_000_000
                && upload.maxImageDimension > 0 && upload.maxImageDimension <= 30_000;
    }

    @AssertTrue(message = "Document list page limits are inconsistent")
    public boolean isListLimitsConsistent() {
        return list != null && list.defaultPageSize > 0 && list.maxPageSize > 0
                && list.defaultPageSize <= list.maxPageSize && list.maxPageSize <= 1000;
    }

    private static long safeRequiredRequestBytes(long file) {
        try {
            return Math.addExact(Math.multiplyExact(file, 2), 2_048);
        } catch (ArithmeticException exception) {
            return Long.MAX_VALUE;
        }
    }

    public static class Storage {
        private boolean enabled;
        private String root;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean value) { enabled = value; }
        public String getRoot() { return root; }
        public void setRoot(String value) { root = value; }
    }

    public static class Upload {
        @NotNull private DataSize maxFileSize = DataSize.ofMegabytes(5);
        @NotNull private DataSize maxRequestSize = DataSize.ofMegabytes(11);
        @Min(1) private long maxImagePixels = 20_000_000;
        @Min(1) private int maxImageDimension = 10_000;

        public DataSize getMaxFileSize() { return maxFileSize; }
        public void setMaxFileSize(DataSize value) { maxFileSize = value; }
        public DataSize getMaxRequestSize() { return maxRequestSize; }
        public void setMaxRequestSize(DataSize value) { maxRequestSize = value; }
        public long getMaxImagePixels() { return maxImagePixels; }
        public void setMaxImagePixels(long value) { maxImagePixels = value; }
        public int getMaxImageDimension() { return maxImageDimension; }
        public void setMaxImageDimension(int value) { maxImageDimension = value; }
    }

    public static class Listing {
        @Min(1) private int defaultPageSize = 20;
        @Min(1) private int maxPageSize = 100;

        public int getDefaultPageSize() { return defaultPageSize; }
        public void setDefaultPageSize(int value) { defaultPageSize = value; }
        public int getMaxPageSize() { return maxPageSize; }
        public void setMaxPageSize(int value) { maxPageSize = value; }
    }
}
