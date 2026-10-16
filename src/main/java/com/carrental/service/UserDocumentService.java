package com.carrental.service;

import com.carrental.dto.request.document.UserDocumentListQuery;
import com.carrental.dto.request.document.UserDocumentSubmissionCommand;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.dto.response.UserDocumentReviewResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.storage.PrivateDocumentFile;

public interface UserDocumentService {
    UserDocumentDetailResponse submit(CurrentAccount account, UserDocumentSubmissionCommand command);
    PageResponse<UserDocumentSummaryResponse> list(CurrentAccount account, UserDocumentListQuery query);
    UserDocumentDetailResponse get(CurrentAccount account, long documentId);
    PrivateDocumentFile download(CurrentAccount account, long documentId, String side);
    UserDocumentReviewResponse review(CurrentAccount actor, long documentId, ReviewUserDocumentRequest request);
}
