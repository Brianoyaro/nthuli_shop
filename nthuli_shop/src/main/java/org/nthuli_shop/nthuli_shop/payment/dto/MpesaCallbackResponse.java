package org.nthuli_shop.nthuli_shop.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MpesaCallbackResponse {
    @JsonProperty("Body")
    private CallbackBody body;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CallbackBody {
        @JsonProperty("stkCallback")
        private StkCallback stkCallback;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class StkCallback {
            @JsonProperty("MerchantRequestID")
            private String merchantRequestId;

            @JsonProperty("CheckoutRequestID")
            private String checkoutRequestId;

            @JsonProperty("ResultCode")
            private Integer resultCode;

            @JsonProperty("ResultDesc")
            private String resultDesc;

            @JsonProperty("CallbackMetadata")
            private CallbackMetadata callbackMetadata;

            @Data
            @NoArgsConstructor
            @AllArgsConstructor
            @Builder
            public static class CallbackMetadata {
                @JsonProperty("Item")
                private java.util.List<CallbackItem> items;

                @Data
                @NoArgsConstructor
                @AllArgsConstructor
                @Builder
                public static class CallbackItem {
                    @JsonProperty("Name")
                    private String name;

                    @JsonProperty("Value")
                    private Object value;
                }
            }
        }
    }
}
