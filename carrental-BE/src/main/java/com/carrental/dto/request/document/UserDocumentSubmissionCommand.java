package com.carrental.dto.request.document;

import com.carrental.storage.PrivateDocumentStorage.UploadedDocumentImage;

public record UserDocumentSubmissionCommand(
        UserDocumentSubmissionRequest metadata,
        UploadedDocumentImage frontImage,
        UploadedDocumentImage backImage) {
}
