package com.carrental.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.jar.JarOutputStream;
import java.util.jar.Manifest;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/** Exercises the actual Spring Boot JarLauncher and nested CodeSource in a child JVM. */
class StorageRootBootJarIT {

    private static final String PROBE_CLASS_ENTRY = "BOOT-INF/classes/com/carrental/storage/StorageRootBootJarProbe.class";

    @Test
    void actualBootJarProtectsPhysicalApplicationTreeAndAcceptsExternalRootFromAnotherWorkingDirectory(
            @TempDir Path temp) throws Exception {
        Path systemTemp = Path.of(System.getProperty("java.io.tmpdir")).toRealPath();
        Path fixtureRoot = temp.toRealPath();
        assertThat(fixtureRoot).startsWith(systemTemp).isNotEqualTo(systemTemp);

        Path project = Files.createDirectories(fixtureRoot.resolve("boot fixture space %20 tiếng Việt 日本語"));
        Files.writeString(project.resolve("pom.xml"), "<project/>\n");
        Path target = Files.createDirectories(project.resolve("target"));
        Path executableJar = target.resolve("carrental-be.jar");
        installProbeInBootJar(Path.of("target/carrental-be-0.0.1-SNAPSHOT.jar").toAbsolutePath(), executableJar);

        Path workingDirectory = Files.createDirectories(fixtureRoot.resolve("unrelated working directory"));
        Path config = Files.createDirectories(project.resolve("config/custom root"));
        Path publicRoot = Files.createDirectories(project.resolve("public"));
        Path targetCustom = Files.createDirectories(target.resolve("custom root"));
        Path arbitrary = Files.createDirectories(project.resolve("randomly named private folder"));
        Path external = Files.createDirectories(fixtureRoot.resolve("external private %20 根"));
        assertThat(workingDirectory.startsWith(project)).isFalse();

        List<Path> forbiddenRoots = List.of(project, config, publicRoot, target, targetCustom, arbitrary);
        List<List<String>> beforeContents = new ArrayList<>();
        for (Path root : forbiddenRoots) beforeContents.add(children(root));

        for (int index = 0; index < forbiddenRoots.size(); index++) {
            ProbeResult result = runProbe(executableJar, workingDirectory, "enabled", forbiddenRoots.get(index));
            assertBootCodeSource(result, executableJar, workingDirectory);
            assertThat(result.output()).contains("ADAPTER_RESULT=REJECTED");
            assertThat(children(forbiddenRoots.get(index))).isEqualTo(beforeContents.get(index));
        }

        ProbeResult externalResult = runProbe(executableJar, workingDirectory, "enabled", external);
        assertBootCodeSource(externalResult, executableJar, workingDirectory);
        assertThat(externalResult.output()).contains("ADAPTER_RESULT=ACCEPTED");
        assertThat(children(external)).isEmpty();

        ProbeResult disabledResult = runProbe(executableJar, workingDirectory, "disabled", null);
        assertBootCodeSource(disabledResult, executableJar, workingDirectory);
        assertThat(disabledResult.output()).contains("ADAPTER_RESULT=DISABLED_INITIALIZED");

        System.out.println("ACTUAL_BOOT_CODESOURCE_BASE64 " + line(externalResult.output(), "APPLICATION_CODE_SOURCE_URL_BASE64="));
        System.out.println("ACTUAL_BOOT_OUTER_LOCATION_BASE64 " + line(externalResult.output(), "JAR_CONNECTION_OUTER_URL_BASE64="));
        System.out.println("ACTUAL_BOOT_PHYSICAL_LOCATION_BASE64 " + line(externalResult.output(), "RESOLVED_LOCATION_BASE64="));
        System.out.println("ACTUAL_BOOT_PHYSICAL_PROVIDER " + line(externalResult.output(), "RESOLVED_PROVIDER="));
        System.out.println("ACTUAL_BOOT_PROBE_CWD " + line(externalResult.output(), "PROCESS_CWD="));
        System.out.println("ACTUAL_BOOT_FORBIDDEN_ROOTS_REJECTED project,config,public,target,target-custom,arbitrary");
        System.out.println("ACTUAL_BOOT_EXTERNAL_ROOT ACCEPTED");
        System.out.println("ACTUAL_BOOT_DISABLED_STORAGE INITIALIZED_WITHOUT_ROOT");
        System.out.println("ACTUAL_BOOT_PATH_ENCODING spaces,percent,Unicode PASS");
    }

    private void assertBootCodeSource(ProbeResult result, Path executableJar, Path workingDirectory) throws Exception {
        assertThat(result.exitCode()).as(result.output()).isZero();
        String pathType = System.getProperty("os.name").startsWith("Windows")
                ? "sun.nio.fs.WindowsPath" : "sun.nio.fs.UnixPath";
        assertThat(result.output()).contains(
                "APPLICATION_CODE_SOURCE_PROTOCOL=jar",
                "APPLICATION_CODE_SOURCE_URL=jar:nested:",
                "JAR_CONNECTION_OUTER_PROTOCOL=nested",
                "RESOLVED_LOCATION=" + executableJar.toRealPath(),
                "RESOLVED_PATH_TYPE=" + pathType,
                "RESOLVED_PROVIDER=file",
                "PROCESS_CWD=" + workingDirectory.toRealPath());
    }

    private ProbeResult runProbe(Path jar, Path workingDirectory, String mode, Path root) throws Exception {
        boolean windows = System.getProperty("os.name").startsWith("Windows");
        ProcessBuilder builder;
        if (windows) {
            String script = "Add-Type -TypeDefinition 'using System; using System.Text; using System.Runtime.InteropServices; "
                    + "public static class SbaP05ShortPath { [DllImport(\"kernel32.dll\", CharSet=CharSet.Unicode, SetLastError=true)] "
                    + "public static extern uint GetShortPathName(string path, StringBuilder output, uint capacity); }'; "
                    + "$buffer=[System.Text.StringBuilder]::new(32768); "
                    + "$length=[SbaP05ShortPath]::GetShortPathName($env:SBA_P05_BOOT_JAR, $buffer, [uint32]$buffer.Capacity); "
                    + "if ($length -eq 0 -or $length -ge $buffer.Capacity) { exit 98 }; "
                    + "$java=Join-Path $env:JAVA_HOME 'bin\\java.exe'; & $java '-jar' $buffer.ToString() $env:SBA_P05_PROBE_MODE; exit $LASTEXITCODE";
            String encodedScript = java.util.Base64.getEncoder().encodeToString(
                    script.getBytes(java.nio.charset.StandardCharsets.UTF_16LE));
            builder = new ProcessBuilder("powershell.exe", "-NoProfile", "-NonInteractive", "-EncodedCommand", encodedScript);
            builder.environment().put("SBA_P05_BOOT_JAR", jar.toString());
            builder.environment().put("JAVA_HOME", System.getProperty("java.home"));
        } else {
            Path javaExecutable = Path.of(System.getProperty("java.home"), "bin", "java");
            builder = new ProcessBuilder(javaExecutable.toString(), "-jar", jar.toString(), mode);
        }
        builder.environment().put("SBA_P05_PROBE_MODE", mode);
        if (root != null) builder.environment().put("SBA_P05_STORAGE_ROOT", root.toString());
        Process process = builder.directory(workingDirectory.toFile()).redirectErrorStream(true).start();
        try {
            if (!process.waitFor(20, TimeUnit.SECONDS)) {
                terminateProcessTree(process);
                throw new AssertionError("Actual Boot executable JAR root probe exceeded 20 seconds");
            }
            String output = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8).strip();
            return new ProbeResult(process.exitValue(), decodeDiagnostics(output));
        } finally {
            terminateProcessTree(process);
            process.getInputStream().close();
            process.getErrorStream().close();
            process.getOutputStream().close();
        }
    }

    private void terminateProcessTree(Process process) throws InterruptedException {
        process.descendants().forEach(ProcessHandle::destroyForcibly);
        if (process.isAlive()) process.destroyForcibly();
        process.waitFor(5, TimeUnit.SECONDS);
    }

    private String decodeDiagnostics(String output) {
        StringBuilder decoded = new StringBuilder(output);
        for (String marker : List.of("APPLICATION_CODE_SOURCE_URL_BASE64=", "JAR_CONNECTION_OUTER_URL_BASE64=",
                "RESOLVED_LOCATION_BASE64=", "PROCESS_CWD_BASE64=")) {
            String encoded = output.lines().filter(line -> line.startsWith(marker)).findFirst().orElse(null);
            if (encoded != null) {
                String value = new String(java.util.Base64.getDecoder().decode(encoded.substring(marker.length())),
                        java.nio.charset.StandardCharsets.UTF_8);
                String decodedMarker = marker.replace("_BASE64", "");
                decoded.append(System.lineSeparator()).append(decodedMarker).append(value);
            }
        }
        return decoded.toString();
    }

    private void installProbeInBootJar(Path source, Path target) throws Exception {
        assertThat(source).isRegularFile();
        Path rewritten = target.resolveSibling(target.getFileName() + ".rewritten");
        boolean manifestFound = false;
        boolean helperFound = false;
        try (JarFile input = new JarFile(source.toFile());
                JarOutputStream output = new JarOutputStream(Files.newOutputStream(rewritten))) {
            Manifest manifest = input.getManifest();
            assertThat(manifest).isNotNull();
            assertThat(manifest.getMainAttributes().getValue("Start-Class")).isEqualTo("com.carrental.CarRentalApplication");
            assertThat(input.getJarEntry(PROBE_CLASS_ENTRY)).isNull();
            assertThat(input.getJarEntry("BOOT-INF/classes/com/carrental/storage/StorageRootBootJarIT.class")).isNull();
            manifest.getMainAttributes().putValue("Start-Class", "com.carrental.storage.StorageRootBootJarProbe");
            for (JarEntry entry : input.stream().toList()) {
                if (entry.getName().equals("META-INF/MANIFEST.MF")) {
                    JarEntry copy = copyEntry(entry);
                    output.putNextEntry(copy);
                    manifest.write(output);
                    output.closeEntry();
                    manifestFound = true;
                } else {
                    JarEntry copy = copyEntry(entry);
                    output.putNextEntry(copy);
                    try (InputStream content = input.getInputStream(entry)) {
                        content.transferTo(output);
                    }
                    output.closeEntry();
                }
            }
            assertThat(manifestFound).isTrue();
            try (InputStream helper = getClass().getResourceAsStream("/com/carrental/storage/StorageRootBootJarProbe.class")) {
                assertThat(helper).isNotNull();
                JarEntry entry = new JarEntry(PROBE_CLASS_ENTRY);
                output.putNextEntry(entry);
                helper.transferTo(output);
                output.closeEntry();
                helperFound = true;
            }
        }
        assertThat(helperFound).isTrue();
        Files.move(rewritten, target);
    }

    private JarEntry copyEntry(JarEntry original) {
        JarEntry copy = new JarEntry(original.getName());
        if (original.getTime() >= 0) copy.setTime(original.getTime());
        if (original.getComment() != null) copy.setComment(original.getComment());
        if (original.getMethod() == JarEntry.STORED) {
            copy.setMethod(JarEntry.STORED);
            copy.setSize(original.getSize());
            copy.setCrc(original.getCrc());
        } else {
            copy.setMethod(JarEntry.DEFLATED);
        }
        return copy;
    }

    private List<String> children(Path directory) throws Exception {
        try (var paths = Files.list(directory)) {
            return paths.map(path -> path.getFileName().toString()).sorted().toList();
        }
    }

    private String line(String output, String marker) {
        return output.lines().filter(value -> value.startsWith(marker)).findFirst()
                .orElseThrow(() -> new AssertionError("Missing probe marker " + marker));
    }

    private record ProbeResult(int exitCode, String output) { }
}
