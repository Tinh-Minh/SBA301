package com.carrental.storage;

import java.nio.file.Path;

/** Tiny test-only main class packaged into a temporary JAR to verify CodeSource resolution. */
public final class StorageRootJarProbe {

    private StorageRootJarProbe() { }

    public static void main(String[] arguments) {
        Path location = StorageRootPolicy.applicationCodeLocation(StorageRootJarProbe.class);
        try {
            StorageRootPolicy.validateRoot(arguments[0], location);
            System.out.println("ACCEPTED");
        } catch (IllegalStateException exception) {
            System.out.println("REJECTED");
        }
    }
}
