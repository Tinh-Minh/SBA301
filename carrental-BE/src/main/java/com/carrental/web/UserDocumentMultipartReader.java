package com.carrental.web;

import com.carrental.config.DocumentProperties;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.UserDocumentSubmissionRequest;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.storage.UploadedDocumentImage;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Part;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

/** Reads the complete multipart part inventory before accepting any scalar or file value. */
@Component
public final class UserDocumentMultipartReader {

    private static final Set<String> SCALARS = Set.of("docType", "docNumber", "fullNameOnDoc", "dateOfBirthOnDoc",
            "issuePlace", "issueDate", "expiresAt", "licenseClass");
    private static final Set<String> FILES = Set.of("frontImage", "backImage");
    private final DocumentProperties properties;
    private final Clock clock;

    public UserDocumentMultipartReader(DocumentProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public UserDocumentSubmissionCommand read(HttpServletRequest request) {
        if (request.getQueryString() != null && !request.getQueryString().isBlank()) throw invalid();
        Map<String, String> fields = new HashMap<>();
        UploadedDocumentImage front = null;
        UploadedDocumentImage back = null;
        long total = 0;
        try {
            for (Part part : request.getParts()) {
                String name = part.getName();
                if (!SCALARS.contains(name) && !FILES.contains(name)) throw invalid();
                String filename = part.getSubmittedFileName();
                if (FILES.contains(name)) {
                    if (filename == null || filename.isBlank()) throw requiredFile(name);
                    byte[] bytes = readBounded(part, properties.getUpload().getMaxFileSize().toBytes());
                    total = safeAdd(total, bytes.length);
                    if (name.equals("frontImage")) {
                        if (front != null) throw invalid();
                        front = new UploadedDocumentImage(filename, part.getContentType(), bytes);
                    } else {
                        if (back != null) throw invalid();
                        back = new UploadedDocumentImage(filename, part.getContentType(), bytes);
                    }
                } else {
                    if (filename != null || fields.containsKey(name)) throw invalid();
                    byte[] bytes = readBounded(part, 4_096);
                    total = safeAdd(total, bytes.length);
                    fields.put(name, decode(bytes));
                }
                if (total > properties.getUpload().getMaxRequestSize().toBytes()) throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
            }
        } catch (AppException exception) {
            throw exception;
        } catch (IOException | ServletException exception) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Multipart request is invalid");
        }
        if (front == null || front.bytes().length == 0) throw requiredFile("frontImage");
        if (back != null && back.bytes().length == 0) throw requiredFile("backImage");
        return new UserDocumentSubmissionCommand(UserDocumentSubmissionRequest.parse(fields, clock), front, back);
    }

    private byte[] readBounded(Part part, long limit) throws IOException {
        int readLimit = Math.toIntExact(limit);
        try (var input = part.getInputStream()) {
            byte[] bytes = input.readNBytes(readLimit + 1);
            if (bytes.length > readLimit) throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
            return bytes;
        }
    }

    private String decode(byte[] bytes) {
        try {
            return StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString();
        } catch (CharacterCodingException exception) {
            throw invalid();
        }
    }

    private long safeAdd(long total, long value) {
        try { return Math.addExact(total, value); }
        catch (ArithmeticException exception) { throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE); }
    }

    private AppException requiredFile(String field) {
        return new AppException(ErrorCode.VALIDATION_ERROR,
                java.util.List.of(new com.carrental.dto.response.FieldErrorResponse(field, "Tệp ảnh là bắt buộc và không được để trống")));
    }

    private AppException invalid() { return new AppException(ErrorCode.INVALID_REQUEST); }
}
