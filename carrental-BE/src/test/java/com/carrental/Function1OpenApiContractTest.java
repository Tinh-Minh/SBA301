package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import com.carrental.config.DocumentProperties;
import com.carrental.config.CustomerProperties;
import com.carrental.controller.AuthController;
import com.carrental.controller.BankAccountController;
import com.carrental.controller.CustomerController;
import com.carrental.controller.DriverController;
import com.carrental.controller.HealthController;
import com.carrental.controller.UserDocumentController;
import com.carrental.controller.VoucherController;
import com.carrental.service.AuthService;
import com.carrental.service.BankAccountService;
import com.carrental.service.CustomerService;
import com.carrental.service.DriverEligibilityService;
import com.carrental.service.DriverService;
import com.carrental.service.KycService;
import com.carrental.service.UserDocumentService;
import com.carrental.service.VoucherService;
import com.carrental.web.UserDocumentMultipartReader;
import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.request.bankaccount.BankAccountListQuery;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.request.customer.ChangeCustomerStatusRequest;
import com.carrental.dto.request.customer.CustomerListQuery;
import com.carrental.dto.request.customer.UpdateProfileRequest;
import com.carrental.dto.request.document.ReviewUserDocumentRequest;
import com.carrental.dto.request.document.UserDocumentListQuery;
import com.carrental.dto.request.driver.ChangeDriverStatusRequest;
import com.carrental.dto.request.voucher.ChangeVoucherStatusRequest;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.dto.response.DriverResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.HealthResponse;
import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentReviewResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.VoucherResponse;
import com.carrental.dto.response.VoucherWindowState;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.DocumentVerifyStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.UserDocumentType;
import com.carrental.enums.VoucherStatus;
import com.carrental.dto.request.driver.DriverListQuery;
import com.carrental.dto.request.voucher.VoucherListQuery;
import com.carrental.exception.AppException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.beans.Introspector;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Structural OpenAPI checks against actual Spring MVC handler mappings for Function 1 controllers. */
@org.junit.jupiter.api.extension.ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = Function1OpenApiContractTest.MvcConfiguration.class)
class Function1OpenApiContractTest {

    private static final Path SPEC = Path.of("openapi/function1.json");

    @Autowired private RequestMappingHandlerMapping mappings;
    private final JsonMapper mapper = JsonMapper.builder().build();

    @Test
    void staticOpenApiParitiesWithActualMvcMethodsAndDeclaresTheRuntimeContract() throws Exception {
        JsonNode root = mapper.readTree(Files.readString(SPEC));
        assertThat(root.path("openapi").asText()).isEqualTo("3.1.0");
        assertThat(root.path("servers").get(0).path("url").asText()).isEqualTo("/");
        validateLocalReferences(root, root);

        JsonNode paths = root.path("paths");
        Set<String> documented = new LinkedHashSet<>();
        Set<String> operationIds = new HashSet<>();
        paths.propertyNames().forEach(path -> {
            JsonNode pathItem = paths.path(path);
            pathItem.propertyNames().forEach(method -> {
                if (!Set.of("get", "post", "put", "patch", "delete", "head", "options", "trace").contains(method)) return;
                JsonNode operation = pathItem.path(method);
                assertThat(operation.path("operationId").asText()).isNotBlank();
                assertThat(operationIds.add(operation.path("operationId").asText()))
                        .as("unique operationId %s", operation.path("operationId").asText()).isTrue();
                documented.add(method.toUpperCase() + " " + path);
            });
        });

        Set<String> actual = new LinkedHashSet<>();
        Map<String, Set<String>> actualConsumes = new java.util.HashMap<>();
        mappings.getHandlerMethods().forEach((mapping, handler) -> {
            if (!handler.getBeanType().getPackageName().equals("com.carrental.controller")) return;
            if (!Set.of(AuthController.class, BankAccountController.class, CustomerController.class,
                    DriverController.class, HealthController.class, UserDocumentController.class,
                    VoucherController.class).contains(handler.getBeanType())) return;
            Set<String> pathsForMapping = mapping.getPathPatternsCondition().getPatternValues();
            Set<RequestMethod> methods = mapping.getMethodsCondition().getMethods();
            Set<String> consumes = mapping.getConsumesCondition().getConsumableMediaTypes().stream()
                    .map(org.springframework.http.MediaType::toString).collect(java.util.stream.Collectors.toSet());
            pathsForMapping.forEach(path -> methods.forEach(method -> {
                String key = method.name() + " " + path;
                actual.add(key);
                actualConsumes.put(key, consumes);
            }));
        });
        assertThat(documented).containsExactlyInAnyOrderElementsOf(actual);
        assertThat(actual).hasSize(32);
        actual.forEach(key -> {
            String[] pair = key.split(" ", 2);
            JsonNode operation = paths.path(pair[1]).path(pair[0].toLowerCase(java.util.Locale.ROOT));
            Set<String> documentedConsumes = new HashSet<>();
            operation.path("requestBody").path("content").propertyNames().forEach(documentedConsumes::add);
            assertThat(documentedConsumes).as("request media parity for %s", key).isEqualTo(actualConsumes.get(key));
            assertThat(operation.has("requestBody")).as("request body parity for %s", key)
                    .isEqualTo(!actualConsumes.get(key).isEmpty());
        });

        assertThat(root.path("security").get(0).has("BearerAuth")).isTrue();
        assertThat(paths.path("/api/health").path("get").path("security")).isEmpty();
        assertThat(paths.path("/api/auth/register").path("post").path("security").isArray()).isTrue();
        assertThat(paths.path("/api/auth/register").path("post").path("security")).isEmpty();
        assertThat(paths.path("/api/auth/login").path("post").path("security")).isEmpty();
        assertThat(paths.path("/api/drivers").path("post").has("requestBody")).isFalse();
        assertThat(paths.path("/api/bank-accounts/{id}/default").path("patch").has("requestBody")).isFalse();
        assertThat(paths.path("/api/bank-accounts/{id}").path("delete").has("requestBody")).isFalse();
        assertThat(paths.path("/api/user-documents/{id}/files/{side}").path("get")
                .path("responses").path("200").path("content").has("image/jpeg")).isTrue();
        assertThat(paths.path("/api/user-documents/{id}/files/{side}").path("get")
                .path("responses").path("200").path("content").has("image/png")).isTrue();
        assertThat(paths.path("/api/vouchers").path("post").path("x-required-roles").toString()).contains("ADMIN");
        assertThat(root.path("components").path("schemas").path("RegisterRequest").path("required").toString())
                .contains("fullName", "email", "phone", "password");
        assertThat(root.path("components").path("schemas").path("VoucherCreate").path("required").toString())
                .contains("code", "discountType", "discountValue", "startAt", "endAt");
        assertThat(root.path("components").path("schemas").path("DocumentUpload").path("required").toString())
                .contains("docType", "docNumber", "frontImage").doesNotContain("backImage");
        assertThat(root.path("components").path("securitySchemes").path("BearerAuth").path("scheme").asText())
                .isEqualTo("bearer");
        assertThat(root.path("info").path("description").asText()).contains("no-store", "X-Request-ID");
    }

    @Test
    void requestSchemasMatchActualDtoAllowListsAndRuntimeEnums() throws Exception {
        JsonNode root = mapper.readTree(Files.readString(SPEC));
        JsonNode schemas = root.path("components").path("schemas");

        Map<String, Class<?>> dtoTypes = Map.ofEntries(
                Map.entry("RegisterRequest", RegisterRequest.class),
                Map.entry("LoginRequest", LoginRequest.class),
                Map.entry("ProfilePatch", UpdateProfileRequest.class),
                Map.entry("CustomerStatus", ChangeCustomerStatusRequest.class),
                Map.entry("DocumentReviewRequest", ReviewUserDocumentRequest.class),
                Map.entry("DriverStatusRequest", ChangeDriverStatusRequest.class),
                Map.entry("BankAccountRequest", CreateBankAccountRequest.class),
                Map.entry("VoucherCreate", CreateVoucherRequest.class),
                Map.entry("VoucherUpdate", UpdateVoucherAdminRequest.class),
                Map.entry("VoucherStatusRequest", ChangeVoucherStatusRequest.class));
        dtoTypes.forEach((schemaName, dtoType) -> {
            JsonNode schema = schemas.path(schemaName);
            assertThat(schema.path("additionalProperties").asBoolean())
                    .as("closed request object %s", schemaName).isFalse();
            assertThat(objectPropertyNames(schema))
                    .as("OpenAPI request fields reflect bean allowlist %s", schemaName)
                    .containsExactlyInAnyOrderElementsOf(beanPropertyNames(dtoType));
        });
        Set<String> multipartFields = new HashSet<>(staticStringSet(UserDocumentMultipartReader.class, "SCALARS"));
        multipartFields.addAll(staticStringSet(UserDocumentMultipartReader.class, "FILES"));
        assertThat(schemas.path("DocumentUpload").path("additionalProperties").asBoolean()).isFalse();
        assertThat(objectPropertyNames(schemas.path("DocumentUpload")))
                .as("multipart schema reflects parser allowlist")
                .containsExactlyInAnyOrderElementsOf(multipartFields);

        Map<String, Map.Entry<Class<?>, String>> queryParserSets = Map.of(
                "/api/customers", Map.entry(CustomerListQuery.class, "ALLOWED_PARAMETERS"),
                "/api/user-documents", Map.entry(UserDocumentListQuery.class, "ALLOWED"),
                "/api/drivers", Map.entry(DriverListQuery.class, "ALLOWED_PARAMETERS"),
                "/api/bank-accounts", Map.entry(BankAccountListQuery.class, "ALLOWED"),
                "/api/vouchers", Map.entry(VoucherListQuery.class, "ALLOWED"));
        for (var entry : queryParserSets.entrySet()) {
            Set<String> documented = new HashSet<>();
            root.path("paths").path(entry.getKey()).path("get").path("parameters").forEach(parameter -> {
                if ("query".equals(parameter.path("in").asText())) documented.add(parameter.path("name").asText());
            });
            assertThat(documented).as("query allowlist for parser %s", entry.getValue().getKey().getSimpleName())
                    .containsExactlyInAnyOrderElementsOf(staticStringSet(entry.getValue().getKey(), entry.getValue().getValue()));
        }

        assertEnumValues(schemas.path("Customer").path("properties").path("role"), Role.values());
        assertEnumValues(schemas.path("Customer").path("properties").path("status"), CustomerStatus.values());
        assertEnumValues(schemas.path("Customer").path("properties").path("kycStatus"), KycStatus.values());
        assertEnumValues(schemas.path("Document").path("properties").path("docType"), UserDocumentType.values());
        assertEnumValues(schemas.path("Document").path("properties").path("verifyStatus"), DocumentVerifyStatus.values());
        assertEnumValues(schemas.path("Driver").path("properties").path("status"), DriverStatus.values());
        assertEnumValues(schemas.path("Voucher").path("properties").path("discountType"), DiscountType.values());
        assertEnumValues(schemas.path("Voucher").path("properties").path("status"), VoucherStatus.values());
        assertEnumValues(schemas.path("Voucher").path("properties").path("windowState"), VoucherWindowState.values());
        assertEnumValues(schemas.path("CustomerStatus").path("properties").path("status"), CustomerStatus.values());
        assertEnumValues(schemas.path("DocumentUpload").path("properties").path("docType"), UserDocumentType.values());
        assertEnumValues(schemas.path("VoucherCreate").path("properties").path("discountType"), DiscountType.values());
        assertEnumValues(schemas.path("VoucherStatusRequest").path("properties").path("status"), VoucherStatus.values());
        assertEnumValues(schemas.path("DriverStatusRequest").path("properties").path("status"),
                Set.of(DriverStatus.ACTIVE, DriverStatus.SUSPENDED));
        assertEnumValues(schemas.path("DocumentReviewRequest").path("properties").path("verifyStatus"),
                Set.of(DocumentVerifyStatus.APPROVED, DocumentVerifyStatus.REJECTED));

        JsonNode driverStatusSchema = queryParameter(root, "/api/drivers", "status");
        JsonNode voucherStatusSchema = queryParameter(root, "/api/vouchers", "status");
        assertEnumValues(driverStatusSchema, DriverStatus.values());
        assertEnumValues(voucherStatusSchema, VoucherStatus.values());
        assertEnumValues(queryParameter(root, "/api/customers", "status"), CustomerStatus.values());
        assertEnumValues(queryParameter(root, "/api/customers", "kycStatus"), KycStatus.values());
        assertEnumValues(queryParameter(root, "/api/user-documents", "docType"), UserDocumentType.values());
        assertEnumValues(queryParameter(root, "/api/user-documents", "verifyStatus"), DocumentVerifyStatus.values());
        assertEnumValues(queryParameter(root, "/api/vouchers", "discountType"), DiscountType.values());
        assertEnumValues(queryParameter(root, "/api/vouchers", "window"), VoucherWindowState.values());
        assertSchemaEnumValues(queryParameter(root, "/api/user-documents", "scope"), Set.of("mine", "all"));
        CustomerProperties properties = new CustomerProperties();
        for (DriverStatus status : DriverStatus.values()) {
            LinkedMultiValueMap<String, String> query = new LinkedMultiValueMap<>();
            query.add("status", status.name());
            assertThat(schemaAccepts(root, driverStatusSchema, mapper.readTree("\"" + status.name() + "\"")))
                    .isTrue();
            assertThat(DriverListQuery.parse(query, properties).status()).isEqualTo(status);
        }
        for (VoucherStatus status : VoucherStatus.values()) {
            LinkedMultiValueMap<String, String> query = new LinkedMultiValueMap<>();
            query.add("status", status.name());
            assertThat(schemaAccepts(root, voucherStatusSchema, mapper.readTree("\"" + status.name() + "\"")))
                    .isTrue();
            assertThat(VoucherListQuery.parse(query, properties).status()).isEqualTo(status);
        }
        for (String unsupported : List.of("LOCKED", "INACTIVE")) {
            assertThat(schemaAccepts(root, driverStatusSchema, mapper.readTree("\"" + unsupported + "\""))).isFalse();
            LinkedMultiValueMap<String, String> query = new LinkedMultiValueMap<>();
            query.add("status", unsupported);
            assertThatThrownBy(() -> DriverListQuery.parse(query, properties)).isInstanceOf(AppException.class);
        }
        for (String unsupported : List.of("PENDING", "SUSPENDED", "LOCKED")) {
            assertThat(schemaAccepts(root, voucherStatusSchema, mapper.readTree("\"" + unsupported + "\""))).isFalse();
            LinkedMultiValueMap<String, String> query = new LinkedMultiValueMap<>();
            query.add("status", unsupported);
            assertThatThrownBy(() -> VoucherListQuery.parse(query, properties)).isInstanceOf(AppException.class);
        }
    }

    @Test
    void requestSchemasEncodeKnownValidationAndConditionalRules() throws Exception {
        JsonNode root = mapper.readTree(Files.readString(SPEC));
        JsonNode schemas = root.path("components").path("schemas");
        assertSchema(root, schemas.path("ProfilePatch"), "{\"address\":\"" + "A".repeat(300) + "\"}", true);
        assertSchema(root, schemas.path("ProfilePatch"), "{\"address\":\"x\"}", true);
        assertSchema(root, schemas.path("ProfilePatch"), "{\"dateOfBirth\":null,\"address\":null}", true);
        assertSchema(root, schemas.path("ProfilePatch"), "{\"fullName\":null}", false);
        assertSchema(root, schemas.path("ProfilePatch"), "{\"fullName\":\"   \"}", false);
        assertSchema(root, schemas.path("ProfilePatch"), "{}", false);
        assertSchema(root, schemas.path("ProfilePatch"), "{\"address\":\"" + "A".repeat(301) + "\"}", false);

        JsonNode customerStatus = schemas.path("CustomerStatus");
        assertSchema(root, customerStatus, "{\"status\":\"LOCKED\"}", false);
        assertSchema(root, customerStatus, "{\"status\":\"LOCKED\",\"reason\":null}", false);
        assertSchema(root, customerStatus, "{\"status\":\"LOCKED\",\"reason\":\"   \"}", false);
        assertSchema(root, customerStatus, "{\"status\":\"LOCKED\",\"reason\":\"synthetic reason\"}", true);

        JsonNode driverStatus = schemas.path("DriverStatusRequest");
        assertSchema(root, driverStatus, "{\"status\":\"ACTIVE\"}", true);
        assertSchema(root, driverStatus, "{\"status\":\"ACTIVE\",\"reason\":null}", true);
        assertSchema(root, driverStatus, "{\"status\":\"ACTIVE\",\"reason\":\"text\"}", false);
        assertSchema(root, driverStatus, "{\"status\":\"SUSPENDED\"}", false);
        assertSchema(root, driverStatus, "{\"status\":\"SUSPENDED\",\"reason\":null}", false);
        assertSchema(root, driverStatus, "{\"status\":\"SUSPENDED\",\"reason\":\"synthetic reason\"}", true);
        assertSchema(root, driverStatus, "{\"status\":\"PENDING\"}", false);

        JsonNode documentReview = schemas.path("DocumentReviewRequest");
        assertSchema(root, documentReview, "{\"verifyStatus\":\"APPROVED\"}", true);
        assertSchema(root, documentReview, "{\"verifyStatus\":\"APPROVED\",\"rejectReason\":null}", true);
        assertSchema(root, documentReview, "{\"verifyStatus\":\"APPROVED\",\"rejectReason\":\"text\"}", false);
        assertSchema(root, documentReview, "{\"verifyStatus\":\"REJECTED\"}", false);
        assertSchema(root, documentReview,
                "{\"verifyStatus\":\"REJECTED\",\"rejectReason\":\"synthetic reason\"}", true);

        JsonNode upload = schemas.path("DocumentUpload");
        String minimalPassport = "{\"docType\":\"PASSPORT\",\"docNumber\":\"synthetic\",\"frontImage\":\"binary\"}";
        assertSchema(root, upload, minimalPassport, true);
        assertSchema(root, upload, "{\"docType\":\"DRIVER_LICENSE\",\"docNumber\":\"synthetic\",\"frontImage\":\"binary\"}", false);
        assertSchema(root, upload, "{\"docType\":\"DRIVER_LICENSE\",\"docNumber\":\"synthetic\",\"frontImage\":\"binary\",\"licenseClass\":\"B2\"}", true);

        JsonNode voucher = schemas.path("VoucherCreate");
        assertSchema(root, voucher, voucherBody("FIXED", "1.0", "0", "0", "1", "1"), true);
        assertSchema(root, voucher, voucherBody("FIXED", "1e0", "0", "0", "1", "1"), true);
        for (String field : List.of("discountValue", "maxDiscount", "minOrderAmount")) {
            String fractional = voucherBody("FIXED", "1", "0", "0", "1", "1")
                    .replace("\"" + field + "\":", "\"" + field + "\":12.5");
            assertSchema(root, voucher, fractional, false);
        }
        assertSchema(root, voucher, voucherBody("PERCENT", "101", "0", "0", "1", "1"), false);
        assertSchema(root, voucher, voucherBody("PERCENT", "100", "0", "0", "1", "1"), true);
        assertSchema(root, voucher, voucherBody("FIXED", "1", "1.0", "0", "1", "1"), true);
        // JSON Schema integer is mathematical; the HTTP test separately preserves the runtime token-only quota rule.
        assertSchema(root, voucher, voucherBody("FIXED", "1", "0", "0", "1.0", "1e0"), true);

        JsonNode voucherUpdate = schemas.path("VoucherUpdate");
        assertSchema(root, voucherUpdate, "{\"description\":null,\"usageLimit\":null}", true);
        assertSchema(root, voucherUpdate, "{\"description\":\"x\"}", false);
        assertSchema(root, voucherUpdate, "{\"usageLimit\":1}", false);
    }

    @Test
    void responseSchemasReflectSerializedRecordFieldNamesAndRequiredFields() throws Exception {
        JsonNode schemas = mapper.readTree(Files.readString(SPEC)).path("components").path("schemas");
        Map<String, Class<?>> records = Map.ofEntries(
                Map.entry("FieldError", FieldErrorResponse.class),
                Map.entry("AccountSummary", TokenResponse.AccountSummary.class),
                Map.entry("Token", TokenResponse.class),
                Map.entry("Customer", CustomerProfileResponse.class),
                Map.entry("Kyc", KycSummaryResponse.class),
                Map.entry("Document", UserDocumentDetailResponse.class),
                Map.entry("DocumentReview", UserDocumentReviewResponse.class),
                Map.entry("Driver", DriverResponse.class),
                Map.entry("Eligibility", DriverEligibilityResponse.class),
                Map.entry("BankAccount", BankAccountResponse.class),
                Map.entry("Voucher", VoucherResponse.class),
                Map.entry("Page", PageResponse.class),
                Map.entry("Health", HealthResponse.class),
                Map.entry("CustomerAdmin", CustomerAdminResponse.class),
                Map.entry("CustomerSummary", CustomerSummaryResponse.class),
                Map.entry("DocumentSummary", UserDocumentSummaryResponse.class));
        records.forEach((schemaName, recordType) -> {
            Set<String> serializedNames = recordComponentNames(recordType);
            assertThat(objectPropertyNames(schemas.path(schemaName)))
                    .as("response schema fields match %s", recordType.getSimpleName())
                    .containsExactlyInAnyOrderElementsOf(serializedNames);
            assertThat(stringArray(schemas.path(schemaName).path("required")))
                    .as("serialized record components are present, including nullable components, in %s", schemaName)
                    .containsExactlyInAnyOrderElementsOf(serializedNames);
        });
    }

    private void assertSchema(JsonNode root, JsonNode schema, String json, boolean expected) throws Exception {
        assertThat(schemaAccepts(root, schema, mapper.readTree(json)))
                .as("schema instance validity for %s", schema.toString()).isEqualTo(expected);
    }

    private boolean schemaAccepts(JsonNode root, JsonNode schema, JsonNode instance) {
        SchemaSubsetValidator validator = new SchemaSubsetValidator(root);
        validator.assertSupportedKeywords(schema);
        return validator.matches(schema, instance);
    }

    private String voucherBody(String discountType, String discountValue, String maxDiscount,
            String minOrderAmount, String usageLimit, String perUserLimit) {
        return "{\"code\":\"SYNTHETIC-SCHEMA-001\",\"discountType\":\"" + discountType
                + "\",\"discountValue\":" + discountValue + ",\"maxDiscount\":" + maxDiscount
                + ",\"minOrderAmount\":" + minOrderAmount + ",\"startAt\":\"2026-10-14T00:00:00\","
                + "\"endAt\":\"2026-10-15T00:00:00\",\"usageLimit\":" + usageLimit
                + ",\"perUserLimit\":" + perUserLimit + "}";
    }

    private JsonNode queryParameter(JsonNode root, String path, String name) {
        for (JsonNode parameter : root.path("paths").path(path).path("get").path("parameters")) {
            if (name.equals(parameter.path("name").asText())) return parameter.path("schema");
        }
        throw new AssertionError("Missing query parameter schema: " + path + "?" + name);
    }

    private Set<String> objectPropertyNames(JsonNode schema) {
        Set<String> names = new HashSet<>();
        schema.path("properties").propertyNames().forEach(names::add);
        return names;
    }

    private Set<String> stringArray(JsonNode array) {
        Set<String> result = new HashSet<>();
        array.forEach(value -> result.add(value.asText()));
        return result;
    }

    private Set<String> beanPropertyNames(Class<?> type) {
        try {
            Set<String> result = new HashSet<>();
            Arrays.stream(Introspector.getBeanInfo(type).getPropertyDescriptors())
                    .map(java.beans.PropertyDescriptor::getName)
                    .filter(name -> !"class".equals(name))
                    .forEach(result::add);
            return result;
        } catch (java.beans.IntrospectionException exception) {
            throw new AssertionError("Cannot inspect request DTO " + type.getName(), exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Set<String> staticStringSet(Class<?> type, String fieldName) throws Exception {
        var field = type.getDeclaredField(fieldName);
        field.setAccessible(true);
        return Set.copyOf((Set<String>) field.get(null));
    }

    private Set<String> recordComponentNames(Class<?> type) {
        assertThat(type.isRecord()).as("record-backed response DTO %s", type.getName()).isTrue();
        return Arrays.stream(type.getRecordComponents()).map(java.lang.reflect.RecordComponent::getName)
                .collect(java.util.stream.Collectors.toSet());
    }

    private void assertEnumValues(JsonNode schema, Enum<?>[] values) {
        assertSchemaEnumValues(schema, Set.copyOf(Arrays.stream(values).map(Enum::name).toList()));
    }

    private void assertEnumValues(JsonNode schema, Set<? extends Enum<?>> values) {
        assertSchemaEnumValues(schema, Set.copyOf(values.stream().map(Enum::name).toList()));
    }

    private void assertSchemaEnumValues(JsonNode schema, Set<String> expected) {
        Set<String> actual = new HashSet<>();
        schema.path("enum").forEach(value -> { if (value.isTextual()) actual.add(value.stringValue()); });
        assertThat(actual).isEqualTo(expected);
    }

    /**
     * Regression validator for the subset exercised below: local $ref, type, required, properties,
     * additionalProperties, enum/const, lengths/pattern, numeric bounds/multipleOf, property counts,
     * allOf/anyOf/oneOf/not, and if/then/else. format and descriptive/default annotations are ignored.
     * Any other validation keyword in a tested schema fails explicitly instead of being silently skipped.
     */
    private static final class SchemaSubsetValidator {
        private static final Set<String> ASSERTION_KEYWORDS = Set.of(
                "$ref", "type", "required", "properties", "additionalProperties", "enum", "const",
                "minLength", "maxLength", "pattern", "minimum", "maximum", "exclusiveMinimum",
                "exclusiveMaximum", "multipleOf", "minProperties", "maxProperties", "allOf", "anyOf",
                "oneOf", "not", "if", "then", "else");
        private static final Set<String> ANNOTATION_KEYWORDS = Set.of(
                "$schema", "$id", "title", "description", "default", "examples", "format", "writeOnly",
                "readOnly", "deprecated", "contentMediaType", "contentEncoding");

        private final JsonNode root;

        private SchemaSubsetValidator(JsonNode root) { this.root = root; }

        private void assertSupportedKeywords(JsonNode schema) {
            if (schema.isObject()) {
                schema.propertyNames().forEach(name -> {
                    if (!ASSERTION_KEYWORDS.contains(name) && !ANNOTATION_KEYWORDS.contains(name) && !name.startsWith("x-")) {
                        throw new AssertionError("Unsupported JSON Schema keyword in tested contract subset: " + name);
                    }
                    switch (name) {
                        case "$ref" -> assertSupportedKeywords(resolve(schema.path(name).stringValue()));
                        case "properties" -> schema.path(name).propertyNames()
                                .forEach(property -> assertSupportedKeywords(schema.path(name).path(property)));
                        case "additionalProperties", "not", "if", "then", "else" -> {
                            if (schema.path(name).isObject()) assertSupportedKeywords(schema.path(name));
                        }
                        case "allOf", "anyOf", "oneOf" -> schema.path(name).forEach(this::assertSupportedKeywords);
                        default -> { }
                    }
                });
            }
        }

        private boolean matches(JsonNode schema, JsonNode value) {
            if (schema.has("$ref") && !matches(resolve(schema.path("$ref").stringValue()), value)) return false;
            if (!matchesType(schema.path("type"), value)) return false;
            if (schema.has("const") && !schema.path("const").equals(value)) return false;
            if (schema.has("enum") && !contains(schema.path("enum"), value)) return false;

            if (value.isObject()) {
                JsonNode required = schema.path("required");
                if (required.isArray()) for (JsonNode name : required) if (!value.has(name.stringValue())) return false;
                JsonNode properties = schema.path("properties");
                if (properties.isObject()) {
                    for (String name : objectPropertyNames(properties)) {
                        if (value.has(name) && !matches(properties.path(name), value.path(name))) return false;
                    }
                }
                JsonNode additional = schema.path("additionalProperties");
                if (additional.isBoolean() && !additional.booleanValue()) {
                    for (String name : objectPropertyNames(value)) {
                        if (!properties.has(name)) return false;
                    }
                } else if (additional.isObject()) {
                    for (String name : objectPropertyNames(value)) {
                        if (!properties.has(name) && !matches(additional, value.path(name))) return false;
                    }
                }
                if (schema.has("minProperties") && value.size() < schema.path("minProperties").intValue()) return false;
                if (schema.has("maxProperties") && value.size() > schema.path("maxProperties").intValue()) return false;
            }
            if (value.isTextual()) {
                int length = value.stringValue().codePointCount(0, value.stringValue().length());
                if (schema.has("minLength") && length < schema.path("minLength").intValue()) return false;
                if (schema.has("maxLength") && length > schema.path("maxLength").intValue()) return false;
                if (schema.has("pattern") && !java.util.regex.Pattern.compile(schema.path("pattern").stringValue())
                        .matcher(value.stringValue()).find()) return false;
            }
            if (value.isNumber()) {
                java.math.BigDecimal number = value.decimalValue();
                if (schema.has("minimum") && number.compareTo(schema.path("minimum").decimalValue()) < 0) return false;
                if (schema.has("maximum") && number.compareTo(schema.path("maximum").decimalValue()) > 0) return false;
                if (schema.has("exclusiveMinimum") && number.compareTo(schema.path("exclusiveMinimum").decimalValue()) <= 0) return false;
                if (schema.has("exclusiveMaximum") && number.compareTo(schema.path("exclusiveMaximum").decimalValue()) >= 0) return false;
                if (schema.has("multipleOf") && number.remainder(schema.path("multipleOf").decimalValue()).signum() != 0) return false;
            }

            if (schema.has("allOf")) for (JsonNode branch : schema.path("allOf")) if (!matches(branch, value)) return false;
            if (schema.has("anyOf")) {
                boolean any = false;
                for (JsonNode branch : schema.path("anyOf")) any |= matches(branch, value);
                if (!any) return false;
            }
            if (schema.has("oneOf")) {
                int count = 0;
                for (JsonNode branch : schema.path("oneOf")) if (matches(branch, value)) count++;
                if (count != 1) return false;
            }
            if (schema.has("not") && matches(schema.path("not"), value)) return false;
            if (schema.has("if")) {
                boolean condition = matches(schema.path("if"), value);
                if (condition && schema.has("then") && !matches(schema.path("then"), value)) return false;
                if (!condition && schema.has("else") && !matches(schema.path("else"), value)) return false;
            }
            return true;
        }

        private JsonNode resolve(String ref) {
            if (!ref.startsWith("#/")) throw new AssertionError("Unsupported external JSON Schema ref: " + ref);
            JsonNode resolved = root;
            for (String part : ref.substring(2).split("/")) {
                resolved = resolved.path(part.replace("~1", "/").replace("~0", "~"));
            }
            if (resolved.isMissingNode()) throw new AssertionError("Unresolved JSON Schema ref: " + ref);
            return resolved;
        }

        private boolean matchesType(JsonNode type, JsonNode value) {
            if (type.isMissingNode()) return true;
            if (type.isArray()) {
                for (JsonNode candidate : type) if (matchesType(candidate, value)) return true;
                return false;
            }
            return switch (type.stringValue()) {
                case "object" -> value.isObject();
                case "array" -> value.isArray();
                case "string" -> value.isTextual();
                case "integer" -> value.isNumber() && value.decimalValue().stripTrailingZeros().scale() <= 0;
                case "number" -> value.isNumber();
                case "boolean" -> value.isBoolean();
                case "null" -> value.isNull();
                default -> throw new AssertionError("Unsupported JSON Schema type: " + type.stringValue());
            };
        }

        private boolean contains(JsonNode values, JsonNode value) {
            for (JsonNode candidate : values) if (candidate.equals(value)) return true;
            return false;
        }

        private Set<String> objectPropertyNames(JsonNode object) {
            Set<String> names = new HashSet<>();
            object.propertyNames().forEach(names::add);
            return names;
        }
    }

    private void validateLocalReferences(JsonNode root, JsonNode node) {
        if (node.isObject()) {
            if (node.has("$ref")) {
                String ref = node.path("$ref").asText();
                assertThat(ref).startsWith("#/");
                JsonNode resolved = root;
                for (String part : ref.substring(2).split("/")) {
                    resolved = resolved.path(part.replace("~1", "/").replace("~0", "~"));
                }
                assertThat(resolved.isMissingNode()).as("resolves %s", ref).isFalse();
            }
            node.propertyNames().forEach(name -> validateLocalReferences(root, node.path(name)));
        } else if (node.isArray()) {
            node.forEach(child -> validateLocalReferences(root, child));
        }
    }

    @Configuration(proxyBeanMethods = false)
    @org.springframework.web.servlet.config.annotation.EnableWebMvc
    static class MvcConfiguration {
        @Bean AuthController authController() { return new AuthController(mock(AuthService.class)); }
        @Bean HealthController healthController() { return new HealthController(); }
        @Bean CustomerController customerController() {
            return new CustomerController(mock(CustomerService.class), new com.carrental.config.CustomerProperties(),
                    mock(KycService.class));
        }
        @Bean UserDocumentController userDocumentController() {
            return new UserDocumentController(mock(UserDocumentService.class), mock(UserDocumentMultipartReader.class),
                    new DocumentProperties());
        }
        @Bean DriverController driverController() {
            return new DriverController(mock(DriverService.class), new com.carrental.config.CustomerProperties());
        }
        @Bean BankAccountController bankAccountController() {
            return new BankAccountController(mock(BankAccountService.class), new com.carrental.config.CustomerProperties());
        }
        @Bean VoucherController voucherController() {
            return new VoucherController(mock(VoucherService.class), new com.carrental.config.CustomerProperties());
        }
    }
}
