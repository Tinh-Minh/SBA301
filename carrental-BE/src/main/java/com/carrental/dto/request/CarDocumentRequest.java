package com.carrental.dto.request;

import com.carrental.enums.CarDocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarDocumentRequest {

    @NotNull(message = "Loại giấy tờ không được để trống")
    private CarDocumentType docType;

    @NotBlank(message = "Đường dẫn file giấy tờ không được để trống")
    @Size(max = 500, message = "Đường dẫn file giấy tờ tối đa 500 ký tự")
    private String fileUrl;

    private LocalDate expiresAt;
}
