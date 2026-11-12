package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.service.PublicImageStorageService;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Tải ảnh lên máy chủ (ảnh hiện trạng xe khi bàn giao, ảnh xe, ảnh giấy tờ xe).
 *
 * <p>Ảnh được lưu với tên ngẫu nhiên (UUID) và trả về đường dẫn nội bộ {@code /api/uploads/files/...}
 * để dùng cho các trường URL ảnh. Chỉ nhận JPEG/PNG/WebP hợp lệ tối đa 5MB.
 */
@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final PublicImageStorageService imageStorageService;

    @PostMapping(path = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = imageStorageService.storeImage(file);
        return ApiResponse.ok("Tải ảnh lên thành công", Map.of("url", url));
    }

    @PostMapping(path = "/images/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, List<String>>> uploadImages(@RequestParam("files") List<MultipartFile> files) {
        List<String> urls = imageStorageService.storeImages(files);
        return ApiResponse.ok("Tải nhiều ảnh lên thành công", Map.of("urls", urls));
    }

    @GetMapping("/files/{name}")
    public ResponseEntity<Resource> getImage(@PathVariable String name) {
        PublicImageStorageService.LoadedImage loaded = imageStorageService.loadImage(name);
        return ResponseEntity.ok()
                .contentType(loaded.mediaType())
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(loaded.resource());
    }
}
