import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.KeyPairGenerator;
import java.util.Base64;

/** Development setup only. Run with JDK 21 source-file mode; never packaged in the app. */
public final class GenerateJwtKeys {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Expected private and public file paths");
        Path privateFile = Path.of(args[0]).toAbsolutePath().normalize();
        Path publicFile = Path.of(args[1]).toAbsolutePath().normalize();
        if (Files.exists(privateFile) && Files.exists(publicFile)) {
            System.out.println("Existing development key files preserved.");
            return;
        }
        if (Files.exists(privateFile) || Files.exists(publicFile)) {
            throw new IllegalStateException("Only one key file exists; resolve the incomplete pair without overwriting it");
        }
        Files.createDirectories(privateFile.getParent());
        Files.createDirectories(publicFile.getParent());
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(3072);
        var pair = generator.generateKeyPair();
        Files.writeString(privateFile, pem("PRIVATE KEY", pair.getPrivate().getEncoded()),
                StandardCharsets.US_ASCII, StandardOpenOption.CREATE_NEW);
        Files.writeString(publicFile, pem("PUBLIC KEY", pair.getPublic().getEncoded()),
                StandardCharsets.US_ASCII, StandardOpenOption.CREATE_NEW);
        System.out.println("Development RSA key pair created; key contents are not printed.");
    }

    private static String pem(String type, byte[] bytes) {
        return "-----BEGIN " + type + "-----\n"
                + Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(bytes)
                + "\n-----END " + type + "-----\n";
    }
}
