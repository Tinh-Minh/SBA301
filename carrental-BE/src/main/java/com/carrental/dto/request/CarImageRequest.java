package com.carrental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarImageRequest {

    @NotBlank(message = "Đường dẫn ảnh không được để trống")
    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    private String imageUrl;

    @Builder.Default
    private Boolean isPrimary = false;

    @Builder.Default
    private Integer sortOrder = 0;
}
