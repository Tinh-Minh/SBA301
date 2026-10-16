package com.carrental.config.security;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

public final class JwtKeyMaterial {
    private final RSAPrivateKey privateKey;
    private final RSAPublicKey publicKey;

    public JwtKeyMaterial(RSAPrivateKey privateKey, RSAPublicKey publicKey) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    public RSAPrivateKey privateKey() { return privateKey; }
    public RSAPublicKey publicKey() { return publicKey; }

    @Override
    public String toString() {
        return "JwtKeyMaterial[privateKey=<redacted>, publicKey=<redacted>]";
    }
}
