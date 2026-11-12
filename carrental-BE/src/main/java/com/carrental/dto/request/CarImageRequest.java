package com.carrental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class CarImageRequest {

    @NotBlank(message = "Đường dẫn ảnh không được để trống")
    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    @jakarta.validation.constraints.Pattern(regexp = "^(https?://|/(?!/))\\S+$",
            message = "Đường dẫn chỉ được bắt đầu bằng http://, https:// hoặc là đường dẫn nội bộ dạng /...")
    private String imageUrl;

    @Builder.Default
    private Boolean isPrimary = false;

    @Builder.Default
    private Integer sortOrder = 0;
}
