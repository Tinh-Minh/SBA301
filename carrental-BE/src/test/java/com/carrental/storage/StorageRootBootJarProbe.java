package com.carrental.storage;

import com.carrental.config.DocumentProperties;
import java.net.JarURLConnection;
import java.net.URL;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.jar.JarFile;

/** Test-only main class copied into a temporary executable Boot JAR fixture. */
public final class StorageRootBootJarProbe {

    private StorageRootBootJarProbe() { }

    public static void main(String[] arguments) throws Exception {
        URL codeSource = StorageRootBootJarProbe.class.getProtectionDomain().getCodeSource().getLocation();
        System.out.println("APPLICATION_CODE_SOURCE_PROTOCOL=" + codeSource.getProtocol());
        System.out.println("APPLICATION_CODE_SOURCE_URL_BASE64=" + encode(codeSource.toExternalForm()));
        if (codeSource.openConnection() instanceof JarURLConnection connection) {
            System.out.println("JAR_CONNECTION_OUTER_PROTOCOL=" + connection.getJarFileURL().getProtocol());
            System.out.println("JAR_CONNECTION_OUTER_URL_BASE64=" + encode(connection.getJarFileURL().toExternalForm()));
            JarFile containingJar = connection.getJarFile();
            System.out.println("JAR_CONNECTION_ARCHIVE_TYPE=" + containingJar.getClass().getName());
            System.out.println("JAR_CONNECTION_ARCHIVE_NAME_BASE64=" + encode(containingJar.getName()));
        } else {
            System.out.println("JAR_CONNECTION_OUTER_PROTOCOL=UNAVAILABLE");
        }

        Path resolved = StorageRootPolicy.applicationCodeLocation(StorageRootBootJarProbe.class);
        System.out.println("RESOLVED_LOCATION_BASE64=" + encode(resolved.toString()));
        System.out.println("RESOLVED_PATH_TYPE=" + resolved.getClass().getName());
        System.out.println("RESOLVED_PROVIDER=" + resolved.getFileSystem().provider().getScheme());
        System.out.println("PROCESS_CWD_BASE64=" + encode(Path.of(System.getProperty("user.dir")).toRealPath().toString()));

        DocumentProperties properties = new DocumentProperties();
        if ("disabled".equals(arguments[0])) {
            properties.getStorage().setEnabled(false);
            new LocalPrivateDocumentStorage(properties);
            System.out.println("ADAPTER_RESULT=DISABLED_INITIALIZED");
            return;
        }

        properties.getStorage().setEnabled(true);
        properties.getStorage().setRoot(System.getenv("SBA_P05_STORAGE_ROOT"));
        try {
            new LocalPrivateDocumentStorage(properties);
            System.out.println("ADAPTER_RESULT=ACCEPTED");
        } catch (IllegalStateException exception) {
            System.out.println("ADAPTER_RESULT=REJECTED");
            System.out.println("ADAPTER_FAILURE_TYPE=" + exception.getClass().getSimpleName());
        }
    }

    private static String encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
