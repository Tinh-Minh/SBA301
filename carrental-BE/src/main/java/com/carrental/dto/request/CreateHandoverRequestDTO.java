package com.carrental.dto.request;

import com.carrental.enums.HandoverType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Lập biên bản bàn giao (nhận xe hoặc trả xe). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateHandoverRequestDTO {

    @NotNull(message = "Vui lòng chọn loại bàn giao (PICKUP/RETURN)")
    private HandoverType handoverType;

    @Min(value = 0, message = "Số km không được âm")
    private Integer odometerKm;

    @Min(value = 0, message = "Mức nhiên liệu từ 0 đến 100%")
    @Max(value = 100, message = "Mức nhiên liệu từ 0 đến 100%")
    private Integer fuelPercent;

    @Size(max = 2000, message = "Ghi chú tình trạng xe tối đa 2000 ký tự")
    private String conditionNote;

    @Valid
    @Size(max = 20, message = "Tối đa 20 ảnh mỗi biên bản")
    private List<HandoverImageRequestDTO> images = new ArrayList<>();
}
