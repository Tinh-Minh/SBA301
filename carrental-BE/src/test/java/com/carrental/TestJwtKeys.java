package com.carrental;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Map;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

/** Ephemeral integration-test signing keys, created outside the project and removed on JVM shutdown. */
public final class TestJwtKeys {
    public static final String ISSUER = "sba301:function1:test-issuer";
    public static final String AUDIENCE = "carrental-api-test";
    public static final String HS256_SECRET = "function1-test-secret-key-for-hs256-not-production";
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

    public static String privateKeyLocation() { return PRIVATE_KEY_FILE.toUri().toString(); }
    public static String publicKeyLocation() { return PUBLIC_KEY_FILE.toUri().toString(); }
    public static RSAPrivateKey privateKey() { return (RSAPrivateKey) KEY_PAIR.getPrivate(); }
    public static RSAPublicKey publicKey() { return (RSAPublicKey) KEY_PAIR.getPublic(); }

    public static String signHs256Token(Map<String, Object> claims) throws Exception {
        return signHs256Token(claims, HS256_SECRET);
    }

    public static String signHs256Token(Map<String, Object> claims, String secret) throws Exception {
        JWTClaimsSet.Builder claimSet = new JWTClaimsSet.Builder();
        claims.forEach(claimSet::claim);
        SignedJWT signed = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(), claimSet.build());
        signed.sign(new MACSigner(secret.getBytes(StandardCharsets.UTF_8)));
        return signed.serialize();
    }

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
