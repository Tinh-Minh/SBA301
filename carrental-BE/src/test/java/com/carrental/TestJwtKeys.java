package com.carrental;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

/** Ephemeral integration-test signing keys, created outside the project and removed on JVM shutdown. */
final class TestJwtKeys {
    static final String ISSUER = "sba301:function1:test-issuer";
    static final String AUDIENCE = "carrental-api-test";
    private static final Path DIRECTORY;
    private static final KeyPair KEY_PAIR;
    private static final Path PRIVATE_KEY_FILE;
    private static final Path PUBLIC_KEY_FILE;

    static {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KEY_PAIR = generator.generateKeyPair();
            DIRECTORY = Files.createTempDirectory("sba301-p03-test-keys-");
            PRIVATE_KEY_FILE = DIRECTORY.resolve("private.pem");
            PUBLIC_KEY_FILE = DIRECTORY.resolve("public.pem");
            Files.writeString(PRIVATE_KEY_FILE, pem("PRIVATE KEY", KEY_PAIR.getPrivate().getEncoded()));
            Files.writeString(PUBLIC_KEY_FILE, pem("PUBLIC KEY", KEY_PAIR.getPublic().getEncoded()));
            Runtime.getRuntime().addShutdownHook(new Thread(TestJwtKeys::deleteTemporaryFiles));
        } catch (Exception exception) {
            throw new ExceptionInInitializerError("Could not initialize temporary integration-test keys");
        }
    }

    private TestJwtKeys() { }

    static String privateKeyLocation() { return PRIVATE_KEY_FILE.toUri().toString(); }
    static String publicKeyLocation() { return PUBLIC_KEY_FILE.toUri().toString(); }
    static RSAPrivateKey privateKey() { return (RSAPrivateKey) KEY_PAIR.getPrivate(); }
    static RSAPublicKey publicKey() { return (RSAPublicKey) KEY_PAIR.getPublic(); }

    private static String pem(String type, byte[] encoded) {
        String body = Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(encoded);
        return "-----BEGIN " + type + "-----\n" + body + "\n-----END " + type + "-----\n";
    }

    private static void deleteTemporaryFiles() {
        try {
            Files.deleteIfExists(PRIVATE_KEY_FILE);
            Files.deleteIfExists(PUBLIC_KEY_FILE);
            Files.deleteIfExists(DIRECTORY);
        } catch (IOException ignored) {
            // Shutdown cleanup is best effort; all test keys are synthetic and outside the repository.
        }
    }
}
