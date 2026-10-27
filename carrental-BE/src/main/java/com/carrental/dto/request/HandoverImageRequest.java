package com.carrental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Một ảnh đính kèm biên bản bàn giao (đường dẫn ảnh đã tải lên nơi khác). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HandoverImageRequest {

    @NotBlank(message = "Thiếu đường dẫn ảnh")
    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    @Pattern(regexp = "^https?://\\S+$", message = "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://")
    private String imageUrl;

    @Size(max = 200, message = "Chú thích tối đa 200 ký tự")
    private String caption;
}
