package com.carrental.dto.request;

import com.carrental.entity.DisputeEvidence;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

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
        evidence.setFileType(this.fileType != null ? this.fileType : "IMAGE");
        evidence.setDescription(this.description);
        evidence.setCreatedAt(Instant.now());
        return evidence;
    }
}
