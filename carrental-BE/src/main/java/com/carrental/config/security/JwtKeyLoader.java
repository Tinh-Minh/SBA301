package com.carrental.config.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.Signature;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.regex.Pattern;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

public final class JwtKeyLoader {

    private static final int MINIMUM_RSA_BITS = 2048;
    private static final Pattern PEM_BODY = Pattern.compile("-----BEGIN [A-Z ]+-----(.*?)-----END [A-Z ]+-----", Pattern.DOTALL);

    private JwtKeyLoader() { }

    public static JwtKeyMaterial load(
            String privateLocation,
            String publicLocation,
            String privateBase64,
            String publicBase64,
            ResourceLoader loader) {
        try {
            byte[] privateBytes;
            byte[] publicBytes;
            if (hasText(privateBase64) || hasText(publicBase64)) {
                if (!hasText(privateBase64) || !hasText(publicBase64)) {
                    throw new IllegalStateException("Both inline JWT RSA keys must be configured");
                }
                privateBytes = decodeInlineKey(privateBase64);
                publicBytes = decodeInlineKey(publicBase64);
            } else {
                privateBytes = readExternalPem(privateLocation, loader);
                publicBytes = readExternalPem(publicLocation, loader);
            }
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            var privateKey = (RSAPrivateKey) keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privateBytes));
            var publicKey = (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(publicBytes));
            if (privateKey.getModulus().bitLength() < MINIMUM_RSA_BITS
                    || publicKey.getModulus().bitLength() < MINIMUM_RSA_BITS
                    || !privateKey.getModulus().equals(publicKey.getModulus())) {
                throw new IllegalStateException("Configured JWT RSA keys are invalid or do not form a matching pair");
            }
            verifyPair(privateKey, publicKey);
            return new JwtKeyMaterial(privateKey, publicKey);
        } catch (IllegalStateException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalStateException("Configured JWT RSA key files could not be loaded", exception);
        }
    }

    private static byte[] decodeInlineKey(String value) {
        try {
            return Base64.getMimeDecoder().decode(value);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("Configured inline JWT RSA key is invalid");
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static byte[] readExternalPem(String location, ResourceLoader loader) throws IOException {
        if (location == null || !location.startsWith("file:")) {
            throw new IllegalStateException("JWT key locations must use external file: resources");
        }
        Resource resource = loader.getResource(location);
        if (!resource.exists() || !resource.isReadable()) {
            throw new IllegalStateException("Configured JWT RSA key file is unavailable");
        }
        Path path = resource.getFile().toPath().toAbsolutePath().normalize();
        String normalizedPath = path.toString().replace('\\', '/').toLowerCase(java.util.Locale.ROOT);
        if (normalizedPath.contains("/src/main/resources/")) {
            throw new IllegalStateException("JWT key files must remain outside application resources");
        }
        String pem;
        try (var stream = resource.getInputStream()) {
            pem = new String(stream.readAllBytes(), StandardCharsets.US_ASCII);
        }
        var matcher = PEM_BODY.matcher(pem);
        if (!matcher.find()) {
            throw new IllegalStateException("Configured JWT PEM file has an unsupported format");
        }
        String body = matcher.group(1);
        if (matcher.find()) {
            throw new IllegalStateException("Configured JWT PEM file has an unsupported format");
        }
        return Base64.getMimeDecoder().decode(body);
    }

    private static void verifyPair(RSAPrivateKey privateKey, RSAPublicKey publicKey) throws Exception {
        byte[] probe = "carrental-rs256-key-check".getBytes(StandardCharsets.US_ASCII);
        Signature signer = Signature.getInstance("SHA256withRSA");
        signer.initSign(privateKey);
        signer.update(probe);
        byte[] signature = signer.sign();
        Signature verifier = Signature.getInstance("SHA256withRSA");
        verifier.initVerify(publicKey);
        verifier.update(probe);
        if (!verifier.verify(signature)) {
            throw new IllegalStateException("Configured JWT RSA keys do not form a matching pair");
        }
    }
}
