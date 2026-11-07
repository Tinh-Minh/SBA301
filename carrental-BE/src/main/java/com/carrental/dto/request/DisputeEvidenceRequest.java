package com.carrental.dto.request;

import com.carrental.entity.DisputeEvidence;
import com.carrental.enums.EvidenceFileType;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DisputeEvidenceRequest {
    private Long uploadedById;

    @NotBlank(message = "Đường dẫn file không được để trống")
    private String fileUrl;

    private String fileType;

    private String description;

    public DisputeEvidence toEntity() {
        DisputeEvidence evidence = new DisputeEvidence();
        evidence.setFileUrl(this.fileUrl);
        EvidenceFileType type = EvidenceFileType.IMAGE;
        if (this.fileType != null) {
            try {
                type = EvidenceFileType.valueOf(this.fileType.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        evidence.setFileType(type);
        evidence.setDescription(this.description);
        evidence.setCreatedAt(LocalDateTime.now());
        return evidence;
    }
}
