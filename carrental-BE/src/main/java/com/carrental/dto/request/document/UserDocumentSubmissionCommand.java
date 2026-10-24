package com.carrental.dto.request.document;

import com.carrental.storage.UploadedDocumentImage;

public record UserDocumentSubmissionCommand(
        UserDocumentSubmissionRequest metadata,
        UploadedDocumentImage frontImage,
        UploadedDocumentImage backImage) {
}
