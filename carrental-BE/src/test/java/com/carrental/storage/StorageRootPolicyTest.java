package com.carrental.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.InputStream;
import java.net.URL;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarOutputStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class StorageRootPolicyTest {

    @Test
    void explodedApplicationRootsAreProtectedIndependentOfWorkingDirectory(@TempDir Path temp) throws Exception {
        Path project = Files.createDirectories(temp.resolve("exploded-project"));
        Files.writeString(project.resolve("pom.xml"), "<project/>");
        Path classes = Files.createDirectories(project.resolve("target/classes"));
        List<Path> protectedCandidates = List.of(
                Files.createDirectories(project.resolve("config/custom-data")),
                Files.createDirectories(project.resolve("public")),
                Files.createDirectories(project.resolve("src/main/resources")),
                Files.createDirectories(project.resolve("target/custom")),
                Files.createDirectories(project.resolve("build/custom")),
                Files.createDirectories(project.resolve("randomly-named-private")));
        Path external = Files.createDirectories(temp.resolve("external-private-root"));
        Path otherWorkingDirectory = Files.createDirectories(temp.resolve("different-working-directory"));
        assertThat(StorageRootPolicy.applicationCodeLocation(classes.toUri().toURL())).isEqualTo(classes.toRealPath());
        assertThat(classes.getFileSystem()).isSameAs(FileSystems.getDefault());
        String previous = System.getProperty("user.dir");
        try {
            System.setProperty("user.dir", otherWorkingDirectory.toString());
            for (Path candidate : protectedCandidates) {
                assertThatThrownBy(() -> StorageRootPolicy.validateRoot(candidate.toString(), classes))
                        .isInstanceOf(IllegalStateException.class)
                        .hasMessageContaining("outside the application tree");
            }
            assertThat(StorageRootPolicy.validateRoot(external.toString(), classes)).isEqualTo(external.toRealPath());
        } finally {
            System.setProperty("user.dir", previous);
        }
    }

    @Test
    void packagedApplicationProtectsArtifactProjectAndCustomFoldersFromOtherWorkingDirectory(@TempDir Path temp)
            throws Exception {
        Path project = Files.createDirectories(temp.resolve("jar-project"));
        Files.writeString(project.resolve("pom.xml"), "<project/>");
        Path target = Files.createDirectories(project.resolve("target"));
        Path jar = target.resolve("root-policy-probe.jar");
        createProbeJar(jar);
        Path config = Files.createDirectories(project.resolve("data/custom-private"));
        Path external = Files.createDirectories(temp.resolve("outside-jar-project"));
        Path otherWorkingDirectory = Files.createDirectories(temp.resolve("different-working-directory"));

        assertThat(runProbe(jar, config, otherWorkingDirectory)).isEqualTo("REJECTED");
        assertThat(runProbe(jar, target, otherWorkingDirectory)).isEqualTo("REJECTED");
        assertThat(runProbe(jar, external, otherWorkingDirectory)).isEqualTo("ACCEPTED");
    }

    @Test
    void fileAndStandardJarUrlsResolveToCanonicalNativeArtifactsWithEncodedPaths(@TempDir Path temp) throws Exception {
        Path encodedProject = Files.createDirectories(temp.resolve("project space %20 with tiếng Việt"));
        Files.writeString(encodedProject.resolve("pom.xml"), "<project/>");
        Path classes = Files.createDirectories(encodedProject.resolve("classes"));
        Path jar = encodedProject.resolve("plain app %20 日本語.jar");
        createProbeJar(jar);

        assertThat(StorageRootPolicy.applicationCodeLocation(classes.toUri().toURL()))
                .isEqualTo(classes.toRealPath());
        URL jarEntryUrl = new URL("jar:" + jar.toUri().toASCIIString() + "!/com/carrental/storage/StorageRootJarProbe.class");
        assertThat(StorageRootPolicy.applicationCodeLocation(jarEntryUrl)).isEqualTo(jar.toRealPath());
        assertThat(jar.toRealPath().getFileSystem()).isSameAs(FileSystems.getDefault());
    }

    @Test
    void unsupportedMissingAndNonNativeLocationsFailClosed(@TempDir Path temp) throws Exception {
        Path external = Files.createDirectories(temp.resolve("external"));
        URL unsupported = new URL("https://example.invalid/application.jar");
        assertThatThrownBy(() -> StorageRootPolicy.applicationCodeLocation(unsupported))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Application code location cannot be validated");

        URL missing = temp.resolve("missing-application-classes").toUri().toURL();
        assertThatThrownBy(() -> StorageRootPolicy.applicationCodeLocation(missing))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Application code location cannot be validated");

        Path jar = temp.resolve("non-native.jar");
        createProbeJar(jar);
        try (var zipFileSystem = FileSystems.newFileSystem(jar, Map.of())) {
            assertThatThrownBy(() -> StorageRootPolicy.validateRoot(external.toString(), zipFileSystem.getPath("/")))
                    .isInstanceOf(IllegalStateException.class)
                    .hasCauseInstanceOf(java.io.IOException.class)
                    .hasRootCauseMessage("Application artifact is not on the native filesystem");
        }
    }

    private void createProbeJar(Path jar) throws Exception {
        try (JarOutputStream output = new JarOutputStream(Files.newOutputStream(jar), manifest())) {
            addClass(output, "/com/carrental/storage/StorageRootPolicy.class",
                    "com/carrental/storage/StorageRootPolicy.class");
            addClass(output, "/com/carrental/storage/StorageRootJarProbe.class",
                    "com/carrental/storage/StorageRootJarProbe.class");
        }
    }

    private java.util.jar.Manifest manifest() {
        java.util.jar.Manifest manifest = new java.util.jar.Manifest();
        manifest.getMainAttributes().putValue("Manifest-Version", "1.0");
        manifest.getMainAttributes().putValue("Main-Class", "com.carrental.storage.StorageRootJarProbe");
        return manifest;
    }

    private void addClass(JarOutputStream output, String resource, String entry) throws Exception {
        output.putNextEntry(new JarEntry(entry));
        try (InputStream input = getClass().getResourceAsStream(resource)) {
            if (input == null) throw new IllegalStateException("Test class resource is missing");
            input.transferTo(output);
        }
        output.closeEntry();
    }

    private String runProbe(Path jar, Path root, Path workingDirectory) throws Exception {
        String javaExecutable = Path.of(System.getProperty("java.home"), "bin", "java.exe").toString();
        Process process = new ProcessBuilder(javaExecutable, "-jar", jar.toString(), root.toString())
                .directory(workingDirectory.toFile()).redirectErrorStream(true).start();
        if (!process.waitFor(10, java.util.concurrent.TimeUnit.SECONDS)) {
            process.destroyForcibly();
            throw new AssertionError("Storage-root JAR probe exceeded its time limit");
        }
        String output = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8).strip();
        assertThat(process.exitValue()).as(output).isZero();
        return output;
    }
}
