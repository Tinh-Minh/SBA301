package com.carrental.dto.request;

import com.carrental.enums.CarDocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarDocumentRequest {

    @NotNull(message = "Loại giấy tờ không được để trống")
    private CarDocumentType docType;

    @NotBlank(message = "Đường dẫn file giấy tờ không được để trống")
    private String fileUrl;

    private LocalDate expiresAt;
}
