package com.carrental.dto.request.document;

import com.carrental.config.DocumentProperties;
import com.carrental.enums.DocumentType;
import com.carrental.enums.VerificationStatus;
import com.carrental.util.ListQueryParser;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;

public record UserDocumentListQuery(
        String scope,
        Long customerId,
        DocumentType docType,
        VerificationStatus verifyStatus,
        Pageable pageable) {

    private static final Set<String> ALLOWED = Set.of("scope", "customerId", "docType", "verifyStatus", "page", "size", "sort");
    private static final Set<String> SORTS = Set.of("id", "createdAt", "updatedAt", "docType", "verifyStatus");

    public static UserDocumentListQuery parse(MultiValueMap<String, String> parameters, DocumentProperties properties) {
        ListQueryParser.requireAllowed(parameters, ALLOWED);
        String scope = ListQueryParser.value(parameters, "scope", "mine");
        if (!scope.equals("mine") && !scope.equals("all")) throw ListQueryParser.invalid();
        Long customerId = ListQueryParser.positiveLong(parameters, "customerId");
        DocumentType docType = ListQueryParser.enumValue(parameters, "docType", DocumentType.class);
        VerificationStatus status = ListQueryParser.enumValue(parameters, "verifyStatus", VerificationStatus.class);
        return new UserDocumentListQuery(scope, customerId, docType, status, ListQueryParser.pageable(
                parameters, properties.getList().getDefaultPageSize(), properties.getList().getMaxPageSize(), SORTS));
    }
}
