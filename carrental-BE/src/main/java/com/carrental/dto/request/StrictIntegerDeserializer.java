package com.carrental.dto.request;

import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;

/**
 * Chỉ nhận số nguyên JSON thật sự (vd 4), từ chối số lẻ (4.5) hoặc chuỗi ("4")
 * thay vì để Jackson tự cắt 4.5 thành 4.
 */
public class StrictIntegerDeserializer extends ValueDeserializer<Integer> {

    @Override
    public Integer deserialize(JsonParser parser, DeserializationContext context) {
        if (parser.currentToken() == JsonToken.VALUE_NUMBER_INT) {
            return parser.getIntValue();
        }
        return (Integer) context.handleUnexpectedToken(Integer.class, parser);
    }
}
