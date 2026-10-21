package com.carrental.storage;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.JarURLConnection;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.Set;

/** Resolves protected roots from the loaded physical artifact, never from the process working directory. */
final class StorageRootPolicy {

    private static final String BOOT_NESTED_LOCATION =
            "org.springframework.boot.loader.net.protocol.nested.NestedLocation";

    private StorageRootPolicy() { }

    static Path validateRoot(String configured, Path applicationCodeLocation) {
        if (configured == null || configured.isBlank()) {
            throw new IllegalStateException("Private document storage root is required when enabled");
        }
        try {
            Path raw = Path.of(configured);
            if (!raw.isAbsolute() || Files.isSymbolicLink(raw) || !Files.isDirectory(raw, LinkOption.NOFOLLOW_LINKS)) {
                throw new IllegalStateException("Private document storage root must be an existing absolute directory");
            }
            Path canonicalRoot = raw.toRealPath();
            Path canonicalLocation = applicationCodeLocation.toRealPath();
            requireDefaultFileSystem(canonicalRoot);
            requireDefaultFileSystem(canonicalLocation);
            for (Path protectedRoot : protectedRoots(canonicalLocation)) {
                if (canonicalRoot.getFileSystem() != protectedRoot.getFileSystem()) {
                    throw new IllegalStateException("Private document storage root and application must use the same native filesystem");
                }
                if (canonicalRoot.startsWith(protectedRoot)) {
                    throw new IllegalStateException("Private document storage root must be outside the application tree");
                }
            }
            if (!Files.isWritable(canonicalRoot)) {
                throw new IllegalStateException("Private document storage root is not writable");
            }
            return canonicalRoot;
        } catch (IOException | SecurityException | java.nio.file.InvalidPathException exception) {
            throw new IllegalStateException("Private document storage root cannot be validated", exception);
        }
    }

    static Path applicationCodeLocation(Class<?> applicationClass) {
        try {
            var codeSource = applicationClass.getProtectionDomain().getCodeSource();
            if (codeSource == null || codeSource.getLocation() == null) {
                throw new IllegalStateException("Application code location cannot be validated");
            }
            return applicationCodeLocation(codeSource.getLocation());
        } catch (SecurityException | LinkageError exception) {
            throw new IllegalStateException("Application code location cannot be validated", exception);
        }
    }

    static Path applicationCodeLocation(URL location) {
        try {
            if (location == null) throw new IOException("Application code location is unavailable");
            Path physicalLocation = switch (location.getProtocol()) {
                case "file" -> Path.of(location.toURI());
                case "jar" -> resolveJarLocation(location);
                case "nested" -> resolveSpringBootNestedLocation(location);
                default -> throw new IOException("Unsupported application code location protocol");
            };
            requireDefaultFileSystem(physicalLocation);
            Path canonicalLocation = physicalLocation.toRealPath();
            if (!Files.isDirectory(canonicalLocation, LinkOption.NOFOLLOW_LINKS)
                    && !Files.isRegularFile(canonicalLocation, LinkOption.NOFOLLOW_LINKS)) {
                throw new IOException("Application code location is not a file or directory");
            }
            return canonicalLocation;
        } catch (IOException | URISyntaxException | ReflectiveOperationException | SecurityException
                | java.nio.file.InvalidPathException exception) {
            throw new IllegalStateException("Application code location cannot be validated", exception);
        }
    }

    static Set<Path> protectedRoots(Path applicationCodeLocation) throws IOException {
        Path location = applicationCodeLocation.toRealPath();
        requireDefaultFileSystem(location);
        LinkedHashSet<Path> roots = new LinkedHashSet<>();
        roots.add(location);
        boolean directory = Files.isDirectory(location, LinkOption.NOFOLLOW_LINKS);
        if (!directory && !Files.isRegularFile(location, LinkOption.NOFOLLOW_LINKS)) {
            throw new IOException("Application code location is not a file or directory");
        }
        Path cursor = directory ? location : location.getParent();
        if (cursor == null) throw new IOException("Application artifact has no parent");

        if (!directory) roots.add(cursor.toRealPath());
        Path nearestProjectRoot = null;
        Path repositoryRoot = null;
        while (cursor != null) {
            Path canonical = cursor.toRealPath();
            if (nearestProjectRoot == null && hasBuildDescriptor(canonical)) nearestProjectRoot = canonical;
            if (hasGitMetadata(canonical)) {
                repositoryRoot = canonical;
                break;
            }
            cursor = cursor.getParent();
        }
        if (nearestProjectRoot != null) roots.add(nearestProjectRoot);
        if (repositoryRoot != null) roots.add(repositoryRoot);
        return Set.copyOf(roots);
    }

    private static Path resolveJarLocation(URL location)
            throws IOException, URISyntaxException, ReflectiveOperationException {
        URLConnection connection = location.openConnection();
        if (!(connection instanceof JarURLConnection jarConnection)) {
            throw new IOException("Application archive URL is not a JarURLConnection");
        }
        URL archiveLocation = jarConnection.getJarFileURL();
        return switch (archiveLocation.getProtocol()) {
            case "file" -> Path.of(archiveLocation.toURI());
            case "nested" -> resolveSpringBootNestedLocation(archiveLocation);
            default -> throw new IOException("Application archive uses an unsupported location protocol");
        };
    }

    /** Uses Boot's URL parser so encoded spaces, percent signs, Unicode, and drive roots remain intact. */
    private static Path resolveSpringBootNestedLocation(URL nestedLocationUrl) throws ReflectiveOperationException, IOException {
        try {
            Class<?> nestedLocationType = Class.forName(BOOT_NESTED_LOCATION, false, ClassLoader.getSystemClassLoader());
            Method fromUrl = nestedLocationType.getMethod("fromUrl", URL.class);
            Object nestedLocation = fromUrl.invoke(null, nestedLocationUrl);
            Object path = nestedLocationType.getMethod("path").invoke(nestedLocation);
            if (path instanceof Path physicalArchive) return physicalArchive;
            throw new IOException("Boot nested location did not resolve to a filesystem path");
        } catch (InvocationTargetException exception) {
            throw new IOException("Boot nested location is invalid", exception.getCause());
        } catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException exception) {
            throw new IOException("Boot nested location API is unavailable", exception);
        }
    }

    private static void requireDefaultFileSystem(Path path) throws IOException {
        if (path == null || path.getFileSystem() != FileSystems.getDefault()) {
            throw new IOException("Application artifact is not on the native filesystem");
        }
    }

    private static boolean hasBuildDescriptor(Path path) {
        return Files.isRegularFile(path.resolve("pom.xml"), LinkOption.NOFOLLOW_LINKS)
                || Files.isRegularFile(path.resolve("build.gradle"), LinkOption.NOFOLLOW_LINKS)
                || Files.isRegularFile(path.resolve("build.gradle.kts"), LinkOption.NOFOLLOW_LINKS);
    }

    private static boolean hasGitMetadata(Path path) {
        return Files.isDirectory(path.resolve(".git"), LinkOption.NOFOLLOW_LINKS)
                || Files.isRegularFile(path.resolve(".git"), LinkOption.NOFOLLOW_LINKS);
    }
}
