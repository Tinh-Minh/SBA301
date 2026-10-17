package com.carrental.controller;

import com.carrental.config.DocumentProperties;
import com.carrental.dto.request.document.UserDocumentListQuery;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.dto.response.UserDocumentReviewResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.UserDocumentService;
import com.carrental.storage.DocumentImageFormat;
import com.carrental.storage.PrivateDocumentFile;
import com.carrental.web.RequestTraceFilter;
import com.carrental.web.UserDocumentMultipartReader;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/user-documents")
public class UserDocumentController {

    private final UserDocumentService service;
    private final UserDocumentMultipartReader multipartReader;
    private final DocumentProperties properties;

    public UserDocumentController(UserDocumentService service, UserDocumentMultipartReader multipartReader,
            DocumentProperties properties) {
        this.service = service;
        this.multipartReader = multipartReader;
        this.properties = properties;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserDocumentDetailResponse>> submit(
            @AuthenticationPrincipal CurrentAccount account, HttpServletRequest request) {
        UserDocumentSubmissionCommand command = multipartReader.read(request);
        UserDocumentDetailResponse detail = service.submit(account, command);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/user-documents/{id}")
                        .buildAndExpand(detail.id()).toUri())
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(detail, RequestTraceFilter.currentTraceId()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserDocumentSummaryResponse>>> list(
            @AuthenticationPrincipal CurrentAccount account,
            @RequestParam MultiValueMap<String, String> parameters) {
        UserDocumentListQuery query = UserDocumentListQuery.parse(parameters, properties);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(service.list(account, query), RequestTraceFilter.currentTraceId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDocumentDetailResponse>> get(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(service.get(account, id), RequestTraceFilter.currentTraceId()));
    }

    @GetMapping("/{id}/files/{side}")
    public ResponseEntity<byte[]> download(@AuthenticationPrincipal CurrentAccount account,
            @PathVariable long id, @PathVariable String side) {
        PrivateDocumentFile file = service.download(account, id, side);
        DocumentImageFormat format = file.format();
        byte[] bytes = file.bytes();
        String filename = "document-" + id + "-" + side + "." + format.extension();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(format.mediaType()))
                .contentLength(bytes.length)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename, StandardCharsets.US_ASCII).build().toString())
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .header(RequestTraceFilter.HEADER_NAME, RequestTraceFilter.currentTraceId())
                .body(bytes);
    }

    @PatchMapping(path = "/{id}/review", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDocumentReviewResponse>> review(
            @AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id,
            HttpServletRequest request,
            @org.springframework.web.bind.annotation.RequestBody ReviewUserDocumentRequest command) {
        if (id <= 0) throw new com.carrental.exception.AppException(com.carrental.exception.ErrorCode.INVALID_REQUEST);
        if (request.getQueryString() != null) {
            throw new com.carrental.exception.AppException(com.carrental.exception.ErrorCode.INVALID_REQUEST);
        }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(service.review(actor, id, command), RequestTraceFilter.currentTraceId()));
    }
}
